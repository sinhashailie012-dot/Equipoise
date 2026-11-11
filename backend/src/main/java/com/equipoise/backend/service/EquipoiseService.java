package com.equipoise.backend.service;

import com.equipoise.backend.dto.PageResponse;
import com.equipoise.backend.entity.*;
import com.equipoise.backend.exception.ResourceNotFoundException;
import com.equipoise.backend.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class EquipoiseService {
    private static final DateTimeFormatter NOTE_DATE = DateTimeFormatter.ofPattern("d MMM, HH:mm");
    private final EmployeeRepository employees;
    private final TeamRepository teams;
    private final ProjectRepository projects;
    private final TaskRepository tasks;
    private final LeaveRepository leaves;
    private final AlertRepository alerts;
    private final AlertRuleRepository rules;
    private final CheckInRepository checkIns;
    private final NoteRepository notes;
    private final SettingsRepository settingsRepository;
    private final UserRepository users;

    public EquipoiseService(
            EmployeeRepository employees, TeamRepository teams, ProjectRepository projects, TaskRepository tasks,
            LeaveRepository leaves, AlertRepository alerts, AlertRuleRepository rules, CheckInRepository checkIns,
            NoteRepository notes, SettingsRepository settingsRepository, UserRepository users
    ) {
        this.employees = employees;
        this.teams = teams;
        this.projects = projects;
        this.tasks = tasks;
        this.leaves = leaves;
        this.alerts = alerts;
        this.rules = rules;
        this.checkIns = checkIns;
        this.notes = notes;
        this.settingsRepository = settingsRepository;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getEmployees(Map<String, String> params) {
        int page = nonNegative(params.get("page"), 0);
        int size = Math.min(100, Math.max(1, nonNegative(params.get("size"), 20)));
        String sortBy = params.getOrDefault("sortBy", "allocation");
        Sort sort = switch (sortBy) {
            case "name" -> Sort.by("name").ascending();
            case "risk" -> Sort.by("riskScore").descending();
            case "allocation-asc" -> Sort.by("allocatedHours").ascending();
            default -> Sort.by("allocatedHours").descending();
        };
        List<Employee> filtered = employees.findAll(sort).stream().filter(employee -> matchesEmployee(employee, params)).toList();
        int start = Math.min(page * size, filtered.size());
        return PageResponse.of(filtered.subList(start, Math.min(start + size, filtered.size())).stream()
                .map(this::employeeSummary).toList(), page, size, filtered.size());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEmployee(String id) {
        Employee employee = employee(id);
        Map<String, Object> result = employeeSummary(employee);
        result.put("weeklyAllocation", parseCsv(employee.getWeeklyAllocationCsv()));
        result.put("overtimeHistory", parseCsv(employee.getOvertimeHistoryCsv()));
        result.put("managerNotes", notes.findByEmployeeIdOrderByCreatedAtDesc(id).stream()
                .findFirst().map(Note::getNoteText).orElse(""));
        result.put("managerNoteDate", notes.findByEmployeeIdOrderByCreatedAtDesc(id).stream()
                .findFirst().map(note -> note.getCreatedAt().format(NOTE_DATE)).orElse(""));
        result.put("leaveHistory", leaves.findAll().stream().filter(leave -> leave.getEmployee() != null
                && leave.getEmployee().getId().equals(id)).map(leave -> map(
                        "date", leave.getDates(), "type", leave.getType(), "note", leave.getHours(), "status", leave.getStatus()
                )).toList());
        result.put("tasks", tasks.findByAssigneeId(id).stream().map(this::taskDto).toList());
        result.put("signals", riskSignals(employee));
        result.put("suggestedAction", suggestedAction(employee));
        return result;
    }

    public Map<String, Object> updateEmployee(String id, Map<String, Object> updates) {
        Employee employee = employee(id);
        int previousUtilization = WorkloadLogic.utilization(employee.getAllocatedHours(), employee.getContractedHours());
        int previousOverdue = employee.getOverdueTasks();
        int previousLongWeeks = employee.getConsecutiveLongWeeks();
        setIfPresent(updates, "name", employee::setName);
        setIfPresent(updates, "role", employee::setRole);
        setIfPresent(updates, "email", employee::setEmail);
        setIfPresent(updates, "department", employee::setDepartment);
        if (updates.containsKey("contractedHours")) employee.setContractedHours(number(updates.get("contractedHours"), "contractedHours"));
        if (updates.containsKey("allocatedHours")) employee.setAllocatedHours(number(updates.get("allocatedHours"), "allocatedHours"));
        setNumberIfPresent(updates, "overdueTasks", employee::setOverdueTasks);
        setNumberIfPresent(updates, "consecutiveLongWeeks", employee::setConsecutiveLongWeeks);
        employee.setStatus(WorkloadLogic.status(WorkloadLogic.utilization(employee.getAllocatedHours(), employee.getContractedHours()), configSettings()));
        employee.setRiskScore(WorkloadLogic.burnoutScore(employee));
        createThresholdAlerts(employee, previousUtilization, previousOverdue, previousLongWeeks);
        return employeeSummary(employees.save(employee));
    }

    public Map<String, Object> addNote(String employeeId, Map<String, String> body) {
        Employee employee = employee(employeeId);
        String noteText = required(body.get("note"), "note");
        Note note = notes.save(Note.builder().employee(employee).noteText(noteText)
                .author(body.getOrDefault("author", "Equipoise manager")).build());
        return map("success", true, "employeeId", employeeId, "note", note.getNoteText(),
                "date", note.getCreatedAt().format(NOTE_DATE));
    }

    public Map<String, Object> getOverview(String dateRange) {
        List<Employee> people = defaultTeamPeople();
        int allocated = people.stream().mapToInt(Employee::getAllocatedHours).sum();
        int capacity = people.stream().mapToInt(Employee::getContractedHours).sum();
        int atRisk = (int) people.stream().filter(person -> person.getRiskScore() >= 60).count();
        int spare = people.stream().mapToInt(person -> Math.max(0, person.getContractedHours() - person.getAllocatedHours())).sum();
        int overdue = people.stream().mapToInt(Employee::getOverdueTasks).sum();
        List<String> weeks = List.of("14 Sep", "21 Sep", "28 Sep", "5 Oct", "12 Oct", "19 Oct", "26 Oct", "2 Nov");
        List<Map<String, Object>> heatmap = people.stream().limit(8).map(person -> map(
                "id", person.getId(), "name", person.getName(), "hours", parseCsv(person.getWeeklyAllocationCsv())
        )).toList();
        List<Employee> attention = people.stream().filter(person -> person.getRiskScore() >= 60)
                .sorted(Comparator.comparing(Employee::getRiskScore).reversed()).limit(3).toList();
        int avgRisk = (int) Math.round(people.stream().mapToInt(Employee::getRiskScore).average().orElse(0));
        return map(
                "dateRange", dateRange,
                "kpis", map(
                        "teamUtilization", map("value", percent(allocated, capacity), "note", allocated + " of " + capacity + " hrs allocated", "fraction", allocated + " / " + capacity),
                        "atRiskEmployees", map("value", atRisk + " of " + people.size(), "note", "Risk score above 60"),
                        "overdueTasks", map("value", Integer.toString(overdue), "note", "Across " + attention.size() + " people"),
                        "spareCapacity", map("value", spare + " hrs", "note", "Available across " + people.stream().filter(p -> p.getAllocatedHours() < p.getContractedHours()).count() + " people")
                ),
                "heatmap", map("weeks", weeks, "capacity", 40, "rows", heatmap),
                "teamBurnoutRisk", map("score", avgRisk, "label", "Elevated · " + avgRisk + " / 100",
                        "change", "+6 points from last week", "insight", "Sustained overtime is the strongest signal. Start with Marcus and Asha."),
                "needsAttention", attention.stream().map(person -> map(
                        "id", person.getId(), "name", person.getName(), "initials", person.getInitials(),
                        "allocated", person.getAllocatedHours() + " hrs allocated",
                        "overdue", person.getOverdueTasks() + " overdue",
                        "status", person.getStatus().getKey()
                )).toList(),
                "overtimeHistory", List.of(
                        map("week", "Sep 14", "hours", 0), map("week", "21", "hours", 0), map("week", "28", "hours", 2),
                        map("week", "Oct 5", "hours", 4), map("week", "12", "hours", 10), map("week", "19", "hours", 16),
                        map("week", "26", "hours", 24), map("week", "Nov 2", "hours", 24)
                ),
                "recommendation", map("title", "A small move could make a real difference.",
                        "body", "Move 6 hrs from Asha to Daniel without changing the Atlas deadline.",
                        "actionLabel", "Review rebalance", "actionRoute", "/rebalancer")
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRebalancer(String projectId) {
        Project project = projects.findById(projectId).orElseGet(() -> projects.findById("atlas-redesign")
                .orElseThrow(() -> new ResourceNotFoundException("Project not found.")));
        List<Employee> people = employees.findAll().stream().filter(person -> project.getName().equals(person.getProject())).toList();
        List<Map<String, Object>> columns = people.stream().map(person -> {
            List<Map<String, Object>> assigned = tasks.findByAssigneeId(person.getId()).stream()
                    .filter(task -> task.getProjectEntity() != null && project.getId().equals(task.getProjectEntity().getId()))
                    .map(this::taskDto).toList();
            int utilization = WorkloadLogic.utilization(person.getAllocatedHours(), person.getContractedHours());
            return map("id", person.getId(), "name", person.getName(), "initials", person.getInitials(), "role", person.getRole(),
                    "project", project.getName(), "contractedHours", person.getContractedHours(), "allocatedHours", person.getAllocatedHours(),
                    "utilization", utilization, "status", person.getStatus().getKey(), "tasks", assigned);
        }).toList();
        Task suggestionTask = tasks.findById("task-2").orElse(null);
        Map<String, Object> suggestion = suggestionTask != null && Boolean.TRUE.equals(suggestionTask.getIsSuggested())
                ? map("id", "sugg-1", "taskId", suggestionTask.getId(),
                "title", "Move " + suggestionTask.getHours() + " hrs from " + suggestionTask.getAssignee().getName() + " to Daniel Kim",
                "taskName", suggestionTask.getTitle() + " · " + project.getName() + " · Due " + suggestionTask.getDue(),
                "impactText", "Asha: 48 → 42 hrs · 120% → 105%    Daniel: 28 → 34 hrs · 70% → 85%",
                "matchText", "Skill match: research synthesis · No deadline change") : null;
        return map("project", project.getName() + " · " + people.size() + " people", "dateRange", "2–8 Nov 2026",
                "suggestion", suggestion, "columns", columns);
    }

    public Map<String, Object> reassignTask(Map<String, Object> body) {
        Task task = tasks.findById(required(string(body.get("taskId")), "taskId"))
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        Employee from = employee(required(string(body.get("fromEmployeeId")), "fromEmployeeId"));
        Employee to = employee(required(string(body.get("toEmployeeId")), "toEmployeeId"));
        if (!task.getAssignee().getId().equals(from.getId())) {
            throw new IllegalArgumentException("The selected task is not assigned to the source employee.");
        }
        moveTask(task, from, to);
        return map("success", true, "taskId", task.getId(), "fromEmployeeId", from.getId(), "toEmployeeId", to.getId());
    }

    public Map<String, Object> suggestionAction(String suggestionId, boolean accept) {
        if (!"sugg-1".equals(suggestionId)) throw new ResourceNotFoundException("Suggestion not found.");
        Task task = tasks.findById("task-2").orElseThrow(() -> new ResourceNotFoundException("Suggested task not found."));
        if (accept && Boolean.TRUE.equals(task.getIsSuggested())) {
            Employee from = task.getAssignee();
            Employee to = task.getSuggestedTo();
            if (to == null) throw new IllegalStateException("The suggested task has no target employee.");
            moveTask(task, from, to);
        } else {
            task.setIsSuggested(false);
            task.setSuggestedTo(null);
            tasks.save(task);
        }
        return map("success", true, "message", accept ? "Suggestion accepted." : "Suggestion dismissed.");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCapacity(String view) {
        List<Employee> people = defaultTeamPeople();
        List<String> weeks = List.of("2 Nov · now", "9 Nov", "16 Nov", "23 Nov", "30 Nov", "7 Dec");
        List<Map<String, Object>> timeline = people.stream().map(person -> {
            List<Map<String, Object>> schedule = new ArrayList<>();
            for (int i = 0; i < weeks.size(); i++) {
                int hours = i == 0 ? person.getAllocatedHours() : Math.max(0, person.getAllocatedHours() - (i == 1 ? 2 : 4));
                int cap = person.getContractedHours();
                boolean onLeave = (person.getId().equals("asha-patel") && i == 2)
                        || (person.getId().equals("olivia-brooks") && i == 4);
                schedule.add(map("hours", onLeave ? Math.min(hours, cap - 16) : hours, "cap", cap,
                        "status", WorkloadLogic.status(WorkloadLogic.utilization(hours, cap), configSettings()).getKey(),
                        "isLeave", onLeave, "leaveLabel", onLeave ? "16 / " + cap + "h · leave" : ""));
            }
            return map("employeeId", person.getId(), "name", person.getName(), "project", person.getProject(), "schedule", schedule);
        }).toList();
        List<Map<String, Object>> upcoming = leaves.findAll().stream().map(leave -> map(
                "id", leave.getId(), "employee", leave.getEmployeeName(), "dates", leave.getDates(), "type", leave.getType(),
                "hours", leave.getHours(), "status", leave.getStatus()
        )).toList();
        int allocation = people.stream().mapToInt(Employee::getAllocatedHours).sum();
        int totalCapacity = people.stream().mapToInt(Employee::getContractedHours).sum();
        return map("kpis", map(
                        "currentAllocation", map("value", percent(allocation, totalCapacity), "note", "Week of 2 November"),
                        "nextWeek", map("value", percent(allocation - 10, totalCapacity), "note", (allocation - 10) + " of " + totalCapacity + " hrs committed"),
                        "knownLeave", map("value", "32 hrs", "note", "4 days in this horizon"),
                        "capacityIn6Weeks", map("value", Math.max(0, totalCapacity - allocation + 20) + " hrs", "note", "Uncommitted · week of 7 Dec")
                ),
                "weeks", "months".equals(view) ? List.of("November", "December", "January", "February", "March", "April") : weeks,
                "timeline", timeline, "upcomingLeave", upcoming,
                "recoveryCallout", map("title", "Protect the recovery window.",
                        "body", "Asha returns to a 24-hour week on 16 November. Keep Atlas handoff work with Daniel, rather than compressing it around her leave.",
                        "actionLabel", "Review Atlas allocations", "actionRoute", "/rebalancer"));
    }

    public Map<String, Object> addLeave(Map<String, Object> body) {
        String employeeText = required(string(body.get("employee")), "employee");
        Employee employee = employees.findById(employeeText).orElseGet(() -> employees.findAll().stream()
                .filter(person -> person.getName().equalsIgnoreCase(employeeText)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found.")));
        int hours = number(body.get("hours"), "hours");
        if (hours <= 0 || hours > 240) throw new IllegalArgumentException("Leave hours must be between 1 and 240.");
        Leave leave = leaves.save(Leave.builder().id(UUID.randomUUID().toString()).employee(employee)
                .employeeName(employee.getName()).type(required(string(body.get("type")), "type"))
                .dates(required(string(body.get("dates")), "dates")).hours(hours + " hrs").status("Approved").build());
        return map("success", true, "leave", map("id", leave.getId(), "employee", employee.getName(),
                "dates", leave.getDates(), "type", leave.getType(), "hours", leave.getHours(), "status", leave.getStatus()));
    }

    public Map<String, Object> addAllocation(Map<String, Object> body) {
        String employeeText = required(string(body.get("employee")), "employee");
        Employee employee = employees.findById(employeeText).orElseGet(() -> employees.findAll().stream()
                .filter(person -> person.getName().equalsIgnoreCase(employeeText)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found.")));
        String projectText = required(string(body.get("project")), "project");
        Project project = projects.findById(projectText).orElseGet(() -> projects.findAll().stream()
                .filter(item -> item.getName().equalsIgnoreCase(projectText)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Project not found.")));
        Map<String, Object> allocation = new HashMap<>();
        allocation.put("id", "task-" + UUID.randomUUID());
        allocation.put("title", "Capacity allocation · " + project.getName());
        allocation.put("projectId", project.getId());
        allocation.put("assigneeId", employee.getId());
        allocation.put("hours", body.get("hours"));
        allocation.put("due", body.get("week"));
        allocation.put("status", "Scheduled");
        Map<String, Object> task = createTask(allocation);
        return map("success", true, "task", task);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBurnout() {
        List<Employee> people = defaultTeamPeople();
        List<Employee> atRisk = people.stream().filter(person -> person.getRiskScore() >= 60)
                .sorted(Comparator.comparing(Employee::getRiskScore).reversed()).toList();
        List<Map<String, Object>> conversations = atRisk.stream().limit(3).map(person -> map(
                "id", person.getId(), "score", person.getRiskScore(), "name", person.getName(), "role", person.getRole(),
                "initials", person.getInitials(), "signals", String.join(" · ", riskSignals(person)),
                "recommendation", suggestedAction(person), "status", person.getStatus().getKey(),
                "actionLabel", person.getId().equals("asha-patel") ? "Schedule 1:1" : "Review plan",
                "actionType", person.getId().equals("asha-patel") ? "schedule-1-1" : "plan"
        )).toList();
        long open = people.stream().filter(person -> !"Completed".equals(person.getInterventionState())).count();
        return map(
                "kpis", map(
                        "employeesAtRisk", map("value", atRisk.size() + " of " + people.size(), "note", "Risk scores above 60"),
                        "criticalSignals", map("value", people.stream().filter(person -> person.getRiskScore() >= 80).count(),
                                "note", "Employees scoring ≥80"),
                        "openInterventions", map("value", Long.toString(open), "note", "Needs attention or scheduled"),
                        "teamRiskScore", map("value", Math.round(people.stream().mapToInt(Employee::getRiskScore).average().orElse(0)) + " / 100",
                                "note", "Elevated · +6 this week")
                ),
                "conversations", conversations,
                "drivers", List.of(
                        map("label", "Sustained overtime", "count", atRisk.size() + " of " + people.size() + " people",
                                "percentage", percentage(atRisk.size(), people.size()), "color", "#C4613F"),
                        map("label", "Deadline compression", "count", "3 of " + people.size() + " people",
                                "percentage", percentage(3, people.size()), "color", "#D4A537"),
                        map("label", "Limited recovery time", "count", "2 of " + people.size() + " people",
                                "percentage", percentage(2, people.size()), "color", "#4F7A7F")
                ),
                "interventions", people.stream().filter(person -> person.getRiskScore() >= 60).map(person -> map(
                        "id", "intervention-" + person.getId(), "personId", person.getId(), "person", person.getName(),
                        "action", suggestedAction(person), "due", value(person.getInterventionDue(), "Today"),
                        "state", value(person.getInterventionState(), "Needs attention")
                )).toList()
        );
    }

    public Map<String, Object> scheduleCheckIn(Map<String, Object> body) {
        Employee person = employee(required(string(body.get("employeeId")), "employeeId"));
        CheckIn checkIn = checkIns.save(CheckIn.builder().id("checkin-" + UUID.randomUUID())
                .employee(person).employeeName(person.getName()).date(required(string(body.get("date")), "date"))
                .time(required(string(body.get("time")), "time")).duration(required(string(body.get("duration")), "duration"))
                .location(required(string(body.get("location")), "location")).agenda(string(body.get("agenda")))
                .status("Scheduled").build());
        person.setInterventionState("Scheduled");
        person.setInterventionDue(checkIn.getDate());
        employees.save(person);
        return map("success", true, "message", "1:1 check-in scheduled with " + person.getName() + " for "
                + checkIn.getDate() + " at " + checkIn.getTime() + ".", "checkInId", checkIn.getId());
    }

    public Map<String, Object> updateIntervention(String id, Map<String, Object> body) {
        String employeeId = id.startsWith("intervention-") ? id.substring("intervention-".length()) : id;
        Employee person = employee(employeeId);
        setIfPresent(body, "state", person::setInterventionState);
        setIfPresent(body, "due", person::setInterventionDue);
        employees.save(person);
        return map("id", "intervention-" + employeeId, "personId", employeeId, "person", person.getName(),
                "action", suggestedAction(person), "due", value(person.getInterventionDue(), "Today"),
                "state", person.getInterventionState());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAlerts(Map<String, String> params) {
        List<Alert> all = alerts.findAll(Sort.by(Sort.Direction.DESC, "id"));
        String tab = params.getOrDefault("tab", "all");
        String severity = params.getOrDefault("severity", "all");
        List<Map<String, Object>> filtered = all.stream()
                .filter(alert -> switch (tab) {
                    case "unread" -> !alert.getIsRead() && !alert.getIsArchived();
                    case "archived" -> alert.getIsArchived();
                    default -> !alert.getIsArchived();
                })
                .filter(alert -> severity.equals("all") || alert.getCategory().getKey().equalsIgnoreCase(severity))
                .map(this::alertDto).toList();
        return map("alerts", filtered, "unreadCount", all.stream().filter(a -> !a.getIsRead() && !a.getIsArchived()).count(),
                "totalCount", all.stream().filter(a -> !a.getIsArchived()).count());
    }

    public Map<String, Object> alertAction(String id, String action, Integer hours) {
        Alert alert = alerts.findById(id).orElseThrow(() -> new ResourceNotFoundException("Alert not found."));
        switch (action) {
            case "read" -> alert.setIsRead(true);
            case "archive" -> alert.setIsArchived(true);
            case "snooze" -> {
                int duration = hours == null ? 24 : hours;
                if (duration < 1 || duration > 720) throw new IllegalArgumentException("Snooze hours must be between 1 and 720.");
                alert.setIsSnoozed(true);
                alert.setSnoozedUntil(LocalDateTime.now().plusHours(duration).toString());
            }
            default -> throw new IllegalArgumentException("Unsupported alert action.");
        }
        alerts.save(alert);
        return map("success", true, "id", id, "message", switch (action) {
            case "read" -> "Alert marked as read.";
            case "archive" -> "Alert archived.";
            default -> "Alert snoozed.";
        });
    }

    public Map<String, Object> markAllAlertsRead() {
        alerts.findAll().stream().filter(alert -> !alert.getIsArchived()).forEach(alert -> alert.setIsRead(true));
        return map("success", true, "message", "All alerts marked as read.");
    }

    public Map<String, Object> addAlertRule(Map<String, Object> body) {
        int threshold = number(body.get("threshold"), "threshold");
        if (threshold < 1 || threshold > 1000) throw new IllegalArgumentException("Threshold must be between 1 and 1000.");
        AlertRule rule = rules.save(AlertRule.builder().id("rule-" + UUID.randomUUID())
                .name(required(string(body.get("name")), "name")).thresholdPercent(threshold)
                .severity(required(string(body.get("severity")), "severity")).active(true).build());
        return map("success", true, "rule", ruleDto(rule));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAlertRules() {
        return rules.findAll().stream().map(this::ruleDto).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProjects(Map<String, String> params) {
        List<Project> list = projects.findAll().stream()
                .filter(project -> blank(params.get("search")) || contains(project.getName(), params.get("search"))
                        || contains(project.getSubtitle(), params.get("search")) || contains(project.getLeadName(), params.get("search")))
                .filter(project -> "all".equals(params.getOrDefault("status", "all"))
                        || contains(project.getStatus(), params.get("status")) || contains(project.getStatusVariant(), params.get("status")))
                .filter(project -> blank(params.get("lead")) || "all".equals(params.get("lead")) || contains(project.getLeadName(), params.get("lead")))
                .toList();
        int allocation = list.stream().mapToInt(Project::getWeeklyAllocation).sum();
        long taskCount = tasks.countByProjectEntityIsNotNull();
        return map("kpis", map("activeProjects", map("value", Integer.toString(list.size()), "note", employees.count() + " people contributing"),
                "weeklyCommitments", map("value", allocation + " hrs", "note", "Across " + taskCount + " active tasks"),
                "projectsNeedingCare", map("value", list.stream().filter(p -> !"On track".equalsIgnoreCase(p.getStatus())).count(),
                        "note", "Projects need manager attention")),
                "projects", list.stream().map(this::projectDto).toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProject(String id) {
        return projectDto(projects.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found.")));
    }

    public Map<String, Object> createProject(Map<String, Object> body) {
        String name = required(string(body.get("name")), "name");
        String id = slug(name);
        if (projects.existsById(id)) throw new IllegalArgumentException("A project with this name already exists.");
        int capacity = number(body.getOrDefault("weeklyCapacity", 40), "weeklyCapacity");
        Project project = Project.builder().id(id).name(name).subtitle(value(string(body.get("subtitle")), "Project description and scope."))
                .leadName(value(string(body.get("lead")), "Emma Chen")).leadInitials(initials(string(body.get("lead"))))
                .weeklyCapacity(capacity).weeklyAllocation(number(body.getOrDefault("weeklyAllocation", 0), "weeklyAllocation"))
                .percentage(capacity == 0 ? 0 : WorkloadLogic.utilization(number(body.getOrDefault("weeklyAllocation", 0), "weeklyAllocation"), capacity))
                .completedTasks(0).totalTasks(0).activeTasks(0).overdueTasks(0).atRiskPeople(0)
                .status("On track").statusVariant("balanced").accentColor("#7E9C7A")
                .projectDueDate(string(body.get("projectDueDate"))).nextMilestone(string(body.get("nextMilestone"))).build();
        return map("success", true, "project", projectDto(projects.save(project)));
    }

    public Map<String, Object> updateProject(String id, Map<String, Object> body) {
        Project project = projects.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        setIfPresent(body, "name", project::setName);
        setIfPresent(body, "subtitle", project::setSubtitle);
        setIfPresent(body, "lead", project::setLeadName);
        setIfPresent(body, "projectDueDate", project::setProjectDueDate);
        setNumberIfPresent(body, "weeklyCapacity", project::setWeeklyCapacity);
        setNumberIfPresent(body, "weeklyAllocation", project::setWeeklyAllocation);
        project.setPercentage(WorkloadLogic.utilization(project.getWeeklyAllocation(), project.getWeeklyCapacity()));
        return projectDto(projects.save(project));
    }

    public Map<String, Object> deleteProject(String id) {
        Project project = projects.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        if (!tasks.findByProjectContainingIgnoreCase(project.getName()).isEmpty()) {
            throw new IllegalArgumentException("A project with assigned tasks cannot be deleted.");
        }
        projects.delete(project);
        return map("success", true, "id", id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReport(Map<String, String> params) {
        List<Project> projectList = projects.findAll().stream()
                .filter(project -> blank(params.get("project")) || "all".equals(params.get("project")) || project.getId().equals(params.get("project")))
                .filter(project -> blank(params.get("team")) || "all".equals(params.get("team"))
                        || employees.findAll().stream().anyMatch(person -> project.getName().equals(person.getProject())
                        && person.getTeam() != null && person.getTeam().getId().equals(params.get("team"))))
                .toList();
        List<Map<String, Object>> pressure = projectList.stream().map(project -> map(
                "project", project.getName(), "allocation", project.getWeeklyAllocation() + " / " + project.getWeeklyCapacity() + " hrs",
                "allocated", project.getWeeklyAllocation(), "capacity", project.getWeeklyCapacity(),
                "utilization", project.getPercentage() + "%", "utilizationVal", project.getPercentage(),
                "overdue", project.getOverdueTasks() + " tasks", "peopleAtRisk", project.getAtRiskPeople() + " people",
                "statusVariant", project.getStatusVariant()
        )).toList();
        List<Employee> reportPeople = "all".equals(params.get("team")) || blank(params.get("team"))
                ? defaultTeamPeople()
                : employees.findAll().stream().filter(person -> person.getTeam() != null
                        && (person.getTeam().getId().equals(params.get("team"))
                        || contains(person.getTeam().getName(), params.get("team")))).toList();
        int capacity = reportPeople.stream().mapToInt(Employee::getContractedHours).sum();
        int allocated = reportPeople.stream().mapToInt(Employee::getAllocatedHours).sum();
        List<Map<String, Object>> demandHistory = List.of(
                map("week", "17 Aug", "hours", 240, "capacity", capacity),
                map("week", "24", "hours", 246, "capacity", capacity),
                map("week", "31", "hours", 250, "capacity", capacity),
                map("week", "7 Sep", "hours", 260, "capacity", capacity),
                map("week", "14", "hours", 260, "capacity", capacity),
                map("week", "21", "hours", 268, "capacity", capacity),
                map("week", "28", "hours", 278, "capacity", capacity),
                map("week", "5 Oct", "hours", 292, "capacity", capacity),
                map("week", "12", "hours", 294, "capacity", capacity),
                map("week", "19", "hours", 298, "capacity", capacity),
                map("week", "26", "hours", 314, "capacity", capacity),
                map("week", "2 Nov", "hours", allocated, "capacity", capacity)
        );
        List<Map<String, Object>> riskHistory = List.of(
                map("week", "17 Aug", "score", 30), map("week", "24", "score", 32),
                map("week", "31", "score", 33), map("week", "7 Sep", "score", 36),
                map("week", "14", "score", 36), map("week", "21", "score", 38),
                map("week", "28", "score", 40), map("week", "5 Oct", "score", 43),
                map("week", "12", "score", 46), map("week", "19", "score", 50),
                map("week", "26", "score", 52), map("week", "2 Nov", "score", 58)
        );
        int weeks = switch (params.getOrDefault("range", "last-8-weeks")) {
            case "last-4-weeks" -> 4;
            case "last-12-weeks" -> 12;
            default -> 8;
        };
        List<Map<String, Object>> selectedDemand = demandHistory.subList(demandHistory.size() - weeks, demandHistory.size());
        List<Map<String, Object>> selectedRisk = riskHistory.subList(riskHistory.size() - weeks, riskHistory.size());
        int averageDemand = (int) Math.round(selectedDemand.stream().mapToInt(point -> (int) point.get("hours")).average().orElse(0));
        String rangeStart = Objects.toString(selectedDemand.getFirst().get("week"));
        String rangeLabel = rangeStart + " – 8 November 2026";
        long reportAtRisk = reportPeople.stream().filter(person -> person.getRiskScore() >= 60).count();
        return map("dateRange", rangeLabel,
                "kpis", map(
                        "averageUtilization", map("value", percent(averageDemand, capacity), "note", (averageDemand * weeks) + " / " + (capacity * weeks) + " available hours"),
                        "currentOvertime", map("value", "24 hrs", "note", "Unchanged from last week"),
                        "currentAtRisk", map("value", Long.toString(reportAtRisk), "note", "Risk score above 60"),
                        "teamRiskTrend", map("value", "+22 pts", "note", "36 → 58 over eight weeks")
                ),
                "demandChart", selectedDemand,
                "riskChart", selectedRisk,
                "takeaway", map("headline", "The team isn't short on hours.\nThe hours are unevenly shared.",
                        "body", "38 unallocated hours sit alongside 24 excess hours. Start with the proposed 6-hour Atlas transfer, then review Beacon's scope.",
                        "actionLabel", "Open task rebalancer", "actionRoute", "/rebalancer"),
                "pressureTable", pressure
        );
    }

    @Transactional(readOnly = true)
    public String exportCsv(Map<String, String> params) {
        Map<String, Object> report = getReport(params);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> pressure = (List<Map<String, Object>>) report.get("pressureTable");
        StringBuilder csv = new StringBuilder("Project,Allocation,Capacity,Utilization,Overdue Tasks,People At Risk\r\n");
        for (Map<String, Object> row : pressure) {
            csv.append(csv(row.get("project"))).append(',').append(row.get("allocated")).append(',')
                    .append(row.get("capacity")).append(',').append(csv(row.get("utilization"))).append(',')
                    .append(csv(row.get("overdue"))).append(',').append(csv(row.get("peopleAtRisk"))).append("\r\n");
        }
        return csv.toString();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        Settings settings = configSettings();
        List<Map<String, Object>> members = users.findAll().stream().map(user -> map(
                "id", user.getId(), "name", user.getName(), "initials", value(user.getInitials(), initials(user.getName())),
                "description", user.getRole() == Role.ADMIN ? "Workspace, billing, team data and access" : "Team workload, risk signals and interventions",
                "role", user.getRole() == Role.ADMIN ? "Workspace admin" : user.getRole() == Role.MANAGER ? "Manager" : "Contributor"
        )).toList();
        return map(
                "workingHours", map("defaultWeeklyCapacity", settings.getDefaultWeeklyCapacity(),
                        "workspaceTimeZone", settings.getWorkspaceTimeZone(), "workdays", Arrays.asList(settings.getWorkdaysCsv().split(",")),
                        "workdayStarts", settings.getWorkdayStarts(), "workdayEnds", settings.getWorkdayEnds(),
                        "unpaidBreak", settings.getUnpaidBreak(), "deductLeaveAutomatically", settings.getDeductLeaveAutomatically()),
                "thresholds", List.of(
                        map("band", "spare", "label", "Spare capacity", "range", "Below " + settings.getSpareThreshold() + "%",
                                "note", "Below " + (settings.getSpareThreshold() * 40 / 100) + " hrs at 40 hr capacity"),
                        map("band", "balanced", "label", "Balanced", "range", settings.getSpareThreshold() + "–" + settings.getBalancedThreshold() + "%",
                                "note", settings.getSpareThreshold() + "–" + settings.getBalancedThreshold() + "% of capacity"),
                        map("band", "stretched", "label", "Stretched", "range", "Above " + settings.getBalancedThreshold() + "–" + settings.getStretchedThreshold() + "%",
                                "note", "Requires workload review"),
                        map("band", "overloaded", "label", "Overloaded", "range", "Above " + settings.getStretchedThreshold() + "–" + settings.getOverloadedThreshold() + "%",
                                "note", "Immediate rebalancing recommended"),
                        map("band", "critical", "label", "Critical", "range", "Above " + settings.getOverloadedThreshold() + "%",
                                "note", "Urgent intervention recommended")
                ),
                "riskScores", map("atRiskScore", settings.getAtRiskScore(), "criticalRiskScore", settings.getCriticalRiskScore()),
                "members", members,
                "notifications", map("immediateCriticalAlerts", settings.getImmediateCriticalAlerts(),
                        "dailyDigest", settings.getDailyDigest(), "weekendEmail", settings.getWeekendEmail())
        );
    }

    public Map<String, Object> updateSettings(Map<String, Object> body) {
        Settings settings = configSettings();
        Map<String, Object> working = nestedMap(body, "workingHours");
        setIfPresent(working, "defaultWeeklyCapacity", settings::setDefaultWeeklyCapacity);
        setIfPresent(working, "workspaceTimeZone", settings::setWorkspaceTimeZone);
        setIfPresent(working, "workdayStarts", settings::setWorkdayStarts);
        setIfPresent(working, "workdayEnds", settings::setWorkdayEnds);
        setIfPresent(working, "unpaidBreak", settings::setUnpaidBreak);
        if (working.containsKey("workdays")) settings.setWorkdaysCsv(((List<?>) working.get("workdays")).stream().map(Object::toString).collect(Collectors.joining(",")));
        if (working.containsKey("deductLeaveAutomatically")) settings.setDeductLeaveAutomatically(Boolean.parseBoolean(working.get("deductLeaveAutomatically").toString()));
        Map<String, Object> notifications = nestedMap(body, "notifications");
        if (notifications.containsKey("immediateCriticalAlerts")) settings.setImmediateCriticalAlerts(Boolean.parseBoolean(notifications.get("immediateCriticalAlerts").toString()));
        if (notifications.containsKey("dailyDigest")) settings.setDailyDigest(Boolean.parseBoolean(notifications.get("dailyDigest").toString()));
        if (notifications.containsKey("weekendEmail")) settings.setWeekendEmail(Boolean.parseBoolean(notifications.get("weekendEmail").toString()));
        Map<String, Object> risk = nestedMap(body, "riskScores");
        setIfPresent(risk, "atRiskScore", settings::setAtRiskScore);
        setIfPresent(risk, "criticalRiskScore", settings::setCriticalRiskScore);
        if (body.get("thresholds") instanceof List<?> bands) {
            for (Object value : bands) {
                if (!(value instanceof Map<?, ?> band) || !(band.get("band") instanceof String key)) continue;
                int upper = upperThreshold(string(band.get("range")));
                switch (key) {
                    case "spare" -> settings.setSpareThreshold(upper);
                    case "balanced" -> settings.setBalancedThreshold(upper);
                    case "stretched" -> settings.setStretchedThreshold(upper);
                    case "overloaded" -> settings.setOverloadedThreshold(upper);
                    default -> { }
                }
            }
        }
        validateThresholds(settings);
        settingsRepository.save(settings);
        employees.findAll().forEach(person -> {
            StatusBand previousStatus = person.getStatus();
            person.setStatus(WorkloadLogic.status(
                    WorkloadLogic.utilization(person.getAllocatedHours(), person.getContractedHours()), settings));
            employees.save(person);
            if (previousStatus != null && statusRank(previousStatus) < 3 && statusRank(person.getStatus()) >= 3) {
                createAlert(person, person.getStatus() == StatusBand.CRITICAL ? Severity.CRITICAL : Severity.NEEDS_ATTENTION,
                        "Workload threshold crossed", person.getAllocatedHours() + " assigned hours against "
                                + person.getContractedHours() + " contracted hours.");
            }
        });
        return getSettings();
    }

    public Map<String, Object> inviteMember(Map<String, Object> body) {
        String name = required(string(body.get("name")), "name");
        String email = required(string(body.get("email")), "email").toLowerCase();
        String roleValue = value(string(body.get("role")), "CONTRIBUTOR").toUpperCase().replace(' ', '_');
        Role role = switch (roleValue) {
            case "ADMIN", "WORKSPACE_ADMIN" -> Role.ADMIN;
            case "MANAGER" -> Role.MANAGER;
            default -> Role.CONTRIBUTOR;
        };
        if (users.existsByEmail(email)) throw new IllegalArgumentException("A member with this email already exists.");
        User user = users.save(User.builder().id(slug(email.substring(0, email.indexOf('@'))))
                .email(email).name(name).password("{noop}invited-account")
                .role(role).initials(initials(name)).workspace("Forma Studio").department("Design Team").build());
        return map("success", true, "member", map("id", user.getId(), "initials", user.getInitials(),
                "name", user.getName(), "description", "Invited workspace member", "role", body.getOrDefault("role", "Contributor")));
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getTasks(int page, int size, String search, String status, String employeeId) {
        int safeSize = Math.min(100, Math.max(1, size));
        List<Task> filtered = tasks.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .filter(task -> blank(search) || contains(task.getTitle(), search) || contains(task.getProject(), search))
                .filter(task -> blank(status) || "all".equals(status) || contains(task.getStatus(), status))
                .filter(task -> blank(employeeId) || task.getAssignee() != null && employeeId.equals(task.getAssignee().getId())).toList();
        int start = Math.min(Math.max(0, page) * safeSize, filtered.size());
        List<Map<String, Object>> content = filtered.subList(start, Math.min(start + safeSize, filtered.size()))
                .stream().map(this::taskDto).toList();
        return PageResponse.of(content, Math.max(0, page), safeSize, filtered.size());
    }

    public Map<String, Object> createTask(Map<String, Object> body) {
        String id = value(string(body.get("id")), "task-" + UUID.randomUUID());
        Employee assignee = body.get("assigneeId") == null ? null : employee(string(body.get("assigneeId")));
        Project project = body.get("projectId") == null ? null : projects.findById(string(body.get("projectId")))
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        Task task = Task.builder().id(id).title(required(string(body.get("title")), "title"))
                .project(project == null ? string(body.get("project")) : project.getName()).projectEntity(project)
                .assignee(assignee).hours(number(body.getOrDefault("hours", 0), "hours"))
                .due(string(body.get("due"))).status(value(string(body.get("status")), "To do")).isSuggested(false).build();
        if (task.getHours() < 0) throw new IllegalArgumentException("Task hours cannot be negative.");
        if (assignee != null) adjustHours(assignee, task.getHours());
        return taskDto(tasks.save(task));
    }

    public Map<String, Object> updateTask(String id, Map<String, Object> body) {
        Task task = tasks.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        Employee old = task.getAssignee();
        int oldHours = task.getHours();
        setIfPresent(body, "title", task::setTitle);
        setIfPresent(body, "due", task::setDue);
        setIfPresent(body, "status", task::setStatus);
        setNumberIfPresent(body, "hours", task::setHours);
        if (body.containsKey("assigneeId")) task.setAssignee(employee(string(body.get("assigneeId"))));
        if (body.containsKey("projectId")) {
            Project project = projects.findById(string(body.get("projectId")))
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
            task.setProjectEntity(project);
            task.setProject(project.getName());
        }
        if (task.getHours() < 0) throw new IllegalArgumentException("Task hours cannot be negative.");
        if (old != null) adjustHours(old, -oldHours);
        if (task.getAssignee() != null) adjustHours(task.getAssignee(), task.getHours());
        return taskDto(tasks.save(task));
    }

    public Map<String, Object> deleteTask(String id) {
        Task task = tasks.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        if (task.getAssignee() != null) adjustHours(task.getAssignee(), -task.getHours());
        tasks.delete(task);
        return map("success", true, "id", id);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getTeams(int page, int size) {
        Page<Team> result = teams.findAll(PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)), Sort.by("name")));
        List<Map<String, Object>> content = result.getContent().stream().map(team -> map(
                "id", team.getId(), "name", team.getName(), "department", team.getDepartment(),
                "contractedHours", team.getContractedHours(),
                "members", team.getMembers().stream().map(Employee::getId).toList()
        )).toList();
        return PageResponse.of(content, result.getNumber(), result.getSize(), result.getTotalElements());
    }

    private boolean matchesEmployee(Employee employee, Map<String, String> params) {
        String search = params.get("search");
        if (!blank(search) && !contains(employee.getName(), search) && !contains(employee.getRole(), search)
                && !contains(employee.getProject(), search)) return false;
        String tab = params.get("tab");
        if ("at-risk".equals(tab) && employee.getRiskScore() < 60
                && employee.getStatus() != StatusBand.CRITICAL && employee.getStatus() != StatusBand.OVERLOADED
                && employee.getStatus() != StatusBand.STRETCHED) return false;
        if ("spare".equals(tab) && employee.getStatus() != StatusBand.SPARE
                && employee.getAllocatedHours() >= employee.getContractedHours() * .8) return false;
        String team = params.get("team");
        return blank(team) || "all".equalsIgnoreCase(team) || contains(employee.getDepartment(), team)
                || employee.getTeam() != null && (employee.getTeam().getId().equalsIgnoreCase(team) || contains(employee.getTeam().getName(), team));
    }

    private Map<String, Object> employeeSummary(Employee person) {
        int score = person.getRiskScore() == null ? WorkloadLogic.burnoutScore(person) : person.getRiskScore();
        StatusBand status = WorkloadLogic.status(
                WorkloadLogic.utilization(person.getAllocatedHours(), person.getContractedHours()), configSettings());
        return map("id", person.getId(), "initials", person.getInitials(), "name", person.getName(), "role", person.getRole(),
                "email", person.getEmail(), "department", person.getDepartment(), "reportsTo", person.getReportsTo(),
                "allocatedHours", person.getAllocatedHours(), "contractedHours", person.getContractedHours(),
                "status", status.getKey(),
                "riskScore", score, "activeTasks", tasks.findByAssigneeId(person.getId()).size(),
                "overdueTasks", person.getOverdueTasks(), "nextDeadline", person.getNextDeadline(),
                "project", person.getProject());
    }

    private Map<String, Object> taskDto(Task task) {
        return map("id", task.getId(), "title", task.getTitle(), "project", task.getProject(),
                "assigneeId", task.getAssignee() == null ? null : task.getAssignee().getId(),
                "assignee", task.getAssignee() == null ? null : task.getAssignee().getName(),
                "hours", task.getHours(), "due", task.getDue(), "status", task.getStatus(),
                "isSuggested", task.getIsSuggested(),
                "suggestedTo", task.getSuggestedTo() == null ? null : task.getSuggestedTo().getId());
    }

    private Map<String, Object> projectDto(Project project) {
        return map("id", project.getId(), "name", project.getName(), "subtitle", project.getSubtitle(),
                "status", project.getStatus(), "statusVariant", project.getStatusVariant(), "accentColor", project.getAccentColor(),
                "lead", project.getLeadName(), "leadInitials", project.getLeadInitials(),
                "weeklyAllocation", project.getWeeklyAllocation(), "weeklyCapacity", project.getWeeklyCapacity(),
                "percentage", project.getPercentage(), "completedTasks", project.getCompletedTasks(),
                "totalTasks", project.getTotalTasks(), "activeTasks", project.getActiveTasks(),
                "overdueTasks", project.getOverdueTasks(), "atRiskPeople", project.getAtRiskPeople(),
                "nextMilestone", project.getNextMilestone(), "projectDueDate", project.getProjectDueDate(),
                "contributors", project.getContributorsCsv() == null ? List.of() : Arrays.asList(project.getContributorsCsv().split(",")),
                "note", project.getNote());
    }

    private Map<String, Object> alertDto(Alert alert) {
        return map("id", alert.getId(), "category", alert.getCategory().getKey(), "severityLabel", alert.getSeverityLabel(),
                "sender", alert.getSender(), "time", alert.getTime(), "isRead", alert.getIsRead(),
                "isArchived", alert.getIsArchived(), "isSnoozed", alert.getIsSnoozed(), "snoozedUntil", alert.getSnoozedUntil(),
                "title", alert.getTitle(), "description", alert.getDescription(), "actionLabel", alert.getActionLabel(),
                "actionRoute", alert.getActionRoute(), "actionType", alert.getActionType(), "modalType", alert.getModalType(),
                "personId", alert.getPersonId(), "taskId", alert.getTaskId());
    }

    private Map<String, Object> ruleDto(AlertRule rule) {
        return map("id", rule.getId(), "name", rule.getName(), "threshold", rule.getThresholdPercent(),
                "severity", rule.getSeverity(), "active", rule.getActive());
    }

    private List<String> riskSignals(Employee person) {
        List<String> signals = new ArrayList<>();
        if (person.getConsecutiveLongWeeks() > 0) signals.add(person.getConsecutiveLongWeeks() + " weeks above capacity");
        int overtime = parseCsv(person.getOvertimeHistoryCsv()).stream().mapToInt(Integer::intValue).sum();
        if (overtime > 0) signals.add(overtime + " hrs overtime in recent weeks");
        if (person.getOverdueTasks() > 0) signals.add(person.getOverdueTasks() + " overdue task" + (person.getOverdueTasks() == 1 ? "" : "s"));
        if (person.getLeaveRecoveryDays() < 5) signals.add("Limited recovery time");
        if (signals.isEmpty()) signals.add("Balanced workload");
        return signals;
    }

    private String suggestedAction(Employee person) {
        if ("marcus-reed".equals(person.getId())) return "Reduce Beacon scope by 8 hrs";
        if ("asha-patel".equals(person.getId())) return "Move 6 hrs to Daniel; schedule a 1:1";
        if ("sofia-rivera".equals(person.getId())) return "Move 4 hrs of visual QA to Olivia";
        return "Review workload and protect recovery time";
    }

    private void moveTask(Task task, Employee from, Employee to) {
        adjustHours(from, -task.getHours());
        adjustHours(to, task.getHours());
        task.setAssignee(to);
        task.setIsSuggested(false);
        task.setSuggestedTo(null);
        tasks.save(task);
    }

    private void adjustHours(Employee person, int delta) {
        int previousUtilization = WorkloadLogic.utilization(person.getAllocatedHours(), person.getContractedHours());
        int previousOverdue = person.getOverdueTasks();
        int previousLongWeeks = person.getConsecutiveLongWeeks();
        person.setAllocatedHours(Math.max(0, person.getAllocatedHours() + delta));
        person.setStatus(WorkloadLogic.status(WorkloadLogic.utilization(person.getAllocatedHours(), person.getContractedHours()), configSettings()));
        person.setRiskScore(WorkloadLogic.burnoutScore(person));
        employees.save(person);
        createThresholdAlerts(person, previousUtilization, previousOverdue, previousLongWeeks);
    }

    private void createThresholdAlerts(Employee person, int previousUtilization, int previousOverdue, int previousLongWeeks) {
        int utilization = WorkloadLogic.utilization(person.getAllocatedHours(), person.getContractedHours());
        for (AlertRule rule : rules.findAll()) {
            if (!Boolean.TRUE.equals(rule.getActive())) continue;
            boolean crossed = switch (rule.getName().toLowerCase(Locale.ROOT)) {
                case String name when name.contains("workload") ->
                        previousUtilization < rule.getThresholdPercent() && utilization >= rule.getThresholdPercent();
                case String name when name.contains("overtime") ->
                        previousLongWeeks < rule.getThresholdPercent() && person.getConsecutiveLongWeeks() >= rule.getThresholdPercent();
                case String name when name.contains("overdue") ->
                        previousOverdue < rule.getThresholdPercent() && person.getOverdueTasks() >= rule.getThresholdPercent();
                default -> false;
            };
            if (crossed) createAlert(person, severity(rule.getSeverity()), rule.getName(),
                    person.getAllocatedHours() + " assigned hours against " + person.getContractedHours() + " contracted hours.");
        }
    }

    private void createAlert(Employee person, Severity severity, String ruleName, String description) {
        if (alerts.existsByPersonIdAndCategoryAndIsArchivedFalse(person.getId(), severity)) return;
        alerts.save(Alert.builder()
                .id("alert-" + UUID.randomUUID())
                .category(severity)
                .severityLabel(severity.getKey())
                .sender("Equipoise")
                .time("Just now")
                .title(person.getName() + " crossed alert rule: " + ruleName)
                .description(description)
                .actionLabel("Review workload")
                .actionRoute("/team/" + person.getId())
                .actionType("navigate")
                .personId(person.getId())
                .isRead(false)
                .isArchived(false)
                .isSnoozed(false)
                .build());
    }

    private static Severity severity(String value) {
        return switch (value.toLowerCase(Locale.ROOT)) {
            case "critical" -> Severity.CRITICAL;
            case "awareness" -> Severity.AWARENESS;
            default -> Severity.NEEDS_ATTENTION;
        };
    }

    private static int statusRank(StatusBand status) {
        return switch (status) {
            case SPARE -> 0;
            case BALANCED -> 1;
            case STRETCHED -> 2;
            case OVERLOADED -> 3;
            case CRITICAL -> 4;
        };
    }

    private Settings configSettings() {
        return settingsRepository.findById("default").orElseGet(() -> settingsRepository.save(Settings.builder().id("default").build()));
    }

    private Employee employee(String id) {
        return employees.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private List<Employee> defaultTeamPeople() {
        return employees.findAll().stream()
                .filter(person -> person.getTeam() != null && "design-team".equals(person.getTeam().getId()))
                .toList();
    }

    private static Map<String, Object> map(Object... pairs) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) result.put((String) pairs[i], pairs[i + 1]);
        return result;
    }

    private static int nonNegative(String value, int fallback) {
        if (value == null) return fallback;
        try {
            return Math.max(0, Integer.parseInt(value));
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Expected a non-negative integer, received: " + value);
        }
    }

    private static int number(Object value, String field) {
        try {
            int result = Integer.parseInt(Objects.toString(value, ""));
            if (result < 0) throw new IllegalArgumentException(field + " cannot be negative.");
            return result;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(field + " must be an integer.");
        }
    }

    private static String required(String value, String field) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(field + " must not be blank.");
        return value.trim();
    }

    private static String string(Object value) {
        return value == null ? null : value.toString();
    }

    private static String value(String text, String fallback) {
        return text == null || text.isBlank() ? fallback : text;
    }

    private static void setIfPresent(Map<String, ?> updates, String key, java.util.function.Consumer<String> setter) {
        if (updates.containsKey(key)) setter.accept(required(string(updates.get(key)), key));
    }

    private static void setNumberIfPresent(Map<String, Object> updates, String key, java.util.function.Consumer<Integer> setter) {
        if (updates.containsKey(key)) setter.accept(number(updates.get(key), key));
    }

    private static String percent(int value, int total) {
        return (total == 0 ? 0 : Math.round((float) value * 100 / total)) + "%";
    }

    private static double percentage(int value, int total) {
        return total == 0 ? 0 : (double) value * 100 / total;
    }

    private static boolean blank(String text) {
        return text == null || text.isBlank();
    }

    private static boolean contains(String haystack, String needle) {
        return haystack != null && needle != null && haystack.toLowerCase(Locale.ROOT).contains(needle.toLowerCase(Locale.ROOT));
    }

    private static List<Integer> parseCsv(String text) {
        if (blank(text)) return List.of();
        return Arrays.stream(text.split(",")).map(String::trim).map(Integer::parseInt).toList();
    }

    private static Map<String, Object> nestedMap(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null) return Map.of();
        if (!(value instanceof Map<?, ?> source)) throw new IllegalArgumentException(key + " must be an object.");
        Map<String, Object> result = new HashMap<>();
        source.forEach((k, v) -> result.put(Objects.toString(k), v));
        return result;
    }

    private static int upperThreshold(String range) {
        if (blank(range)) throw new IllegalArgumentException("Threshold range must not be blank.");
        Matcher matcher = Pattern.compile("(\\d+)").matcher(range);
        int upper = -1;
        while (matcher.find()) upper = Integer.parseInt(matcher.group(1));
        if (upper < 0 || upper > 1000) throw new IllegalArgumentException("Threshold range must include a valid percentage.");
        return upper;
    }

    private static void validateThresholds(Settings settings) {
        if (settings.getSpareThreshold() < 1 || settings.getSpareThreshold() >= settings.getBalancedThreshold()
                || settings.getBalancedThreshold() >= settings.getStretchedThreshold()
                || settings.getStretchedThreshold() >= settings.getOverloadedThreshold()
                || settings.getOverloadedThreshold() > 1000) {
            throw new IllegalArgumentException("Workload thresholds must be strictly increasing.");
        }
    }

    private static String initials(String name) {
        if (blank(name)) return "NM";
        return Arrays.stream(name.trim().split("\\s+")).limit(2).map(part -> part.substring(0, 1).toUpperCase(Locale.ROOT))
                .collect(Collectors.joining());
    }

    private static String slug(String text) {
        return text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private static String csv(Object text) {
        String value = Objects.toString(text, "");
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
