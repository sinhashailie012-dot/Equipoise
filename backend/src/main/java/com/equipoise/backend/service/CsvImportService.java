package com.equipoise.backend.service;

import com.equipoise.backend.dto.ImportReport;
import com.equipoise.backend.entity.*;
import com.equipoise.backend.exception.ResourceNotFoundException;
import com.equipoise.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class CsvImportService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    private final EmployeeRepository employees;
    private final TeamRepository teams;
    private final TaskRepository tasks;
    private final ProjectRepository projects;
    private final SettingsRepository settingsRepository;

    public CsvImportService(
            EmployeeRepository employees,
            TeamRepository teams,
            TaskRepository tasks,
            ProjectRepository projects,
            SettingsRepository settingsRepository
    ) {
        this.employees = employees;
        this.teams = teams;
        this.tasks = tasks;
        this.projects = projects;
        this.settingsRepository = settingsRepository;
    }

    public String getEmployeeTemplate() {
        return "name,email,role,department,contractedHours,allocatedHours,project\n" +
                "Jane Doe,jane.doe@forma.studio,Product Designer,Design,40,36,Atlas redesign\n" +
                "Alex Smith,alex.smith@forma.studio,UX Researcher,Research,40,40,Insights hub\n";
    }

    public String getTaskTemplate() {
        return "title,employee,project,hours,status,due\n" +
                "Design checkout step,Jane Doe,Atlas redesign,8,In progress,2026-11-25\n" +
                "Conduct user tests,Alex Smith,Insights hub,6,To do,2026-11-30\n";
    }

    @Transactional(rollbackFor = Exception.class)
    public ImportReport importEmployees(MultipartFile file) {
        validateFile(file);
        ImportReport report = new ImportReport();
        List<String[]> rows;
        try {
            rows = parseCsv(file);
        } catch (Exception e) {
            report.addError(1, "Malformed CSV file: " + e.getMessage());
            return report;
        }

        if (rows.isEmpty()) {
            report.addError(1, "CSV file is empty.");
            return report;
        }

        String[] headers = rows.get(0);
        Map<String, Integer> headerMap = mapHeaders(headers);
        if (!headerMap.containsKey("name") || !headerMap.containsKey("email")) {
            report.addError(1, "Missing required headers. Headers must at least include 'name' and 'email'.");
            return report;
        }

        Set<String> seenEmailsInFile = new HashSet<>();
        List<Employee> toSave = new ArrayList<>();

        for (int i = 1; i < rows.size(); i++) {
            int lineNumber = i + 1;
            String[] row = rows.get(i);
            if (row.length == 0 || (row.length == 1 && row[0].trim().isEmpty())) {
                report.incrementSkipped();
                continue;
            }

            String name = getField(row, headerMap, "name");
            String email = getField(row, headerMap, "email");
            String role = getField(row, headerMap, "role");
            String department = getField(row, headerMap, "department");
            String contractedStr = getField(row, headerMap, "contractedhours");
            String allocatedStr = getField(row, headerMap, "allocatedhours");
            String project = getField(row, headerMap, "project");

            // Validations
            if (name.isBlank()) {
                report.addError(lineNumber, "Employee name is required.");
                continue;
            }
            if (email.isBlank()) {
                report.addError(lineNumber, "Email is required.");
                continue;
            }
            if (!EMAIL_PATTERN.matcher(email).matches()) {
                report.addError(lineNumber, "Invalid email format: " + email);
                continue;
            }

            String normalizedEmail = email.toLowerCase(Locale.ROOT);
            if (seenEmailsInFile.contains(normalizedEmail)) {
                report.addError(lineNumber, "Duplicate email in CSV file: " + email);
                continue;
            }
            if (employees.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
                report.addError(lineNumber, "Employee with email '" + email + "' already exists in database.");
                continue;
            }
            seenEmailsInFile.add(normalizedEmail);

            int contractedHours = 40;
            if (!contractedStr.isBlank()) {
                try {
                    contractedHours = Integer.parseInt(contractedStr);
                    if (contractedHours < 1 || contractedHours > 168) {
                        report.addError(lineNumber, "contractedHours must be between 1 and 168.");
                        continue;
                    }
                } catch (NumberFormatException e) {
                    report.addError(lineNumber, "contractedHours must be an integer.");
                    continue;
                }
            }

            int allocatedHours = 0;
            if (!allocatedStr.isBlank()) {
                try {
                    allocatedHours = Integer.parseInt(allocatedStr);
                    if (allocatedHours < 0 || allocatedHours > 168) {
                        report.addError(lineNumber, "allocatedHours must be between 0 and 168.");
                        continue;
                    }
                } catch (NumberFormatException e) {
                    report.addError(lineNumber, "allocatedHours must be an integer.");
                    continue;
                }
            }

            // Build ID & initials
            String id = name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
            if (id.isBlank()) id = "emp-" + UUID.randomUUID().toString().substring(0, 8);
            if (employees.existsById(id)) {
                id = id + "-" + UUID.randomUUID().toString().substring(0, 5);
            }

            String[] nameParts = name.trim().split("\\s+");
            String initials = nameParts.length >= 2
                    ? ("" + nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase(Locale.ROOT)
                    : name.substring(0, Math.min(2, name.length())).toUpperCase(Locale.ROOT);

            Team team = null;
            if (!department.isBlank()) {
                team = teams.findAll().stream()
                        .filter(t -> t.getDepartment().equalsIgnoreCase(department) || t.getName().equalsIgnoreCase(department))
                        .findFirst()
                        .orElse(null);
            }
            if (team == null) {
                team = teams.findById("design-team").orElse(null);
            }

            Employee employee = Employee.builder()
                    .id(id)
                    .name(name)
                    .initials(initials)
                    .email(email)
                    .role(role.isBlank() ? "Team Member" : role)
                    .department(department.isBlank() ? "Design" : department)
                    .reportsTo("Emma Chen")
                    .contractedHours(contractedHours)
                    .allocatedHours(allocatedHours)
                    .team(team)
                    .project(project.isBlank() ? null : project)
                    .weeklyAllocationCsv("0,0,0,0,0,0,0," + allocatedHours)
                    .overtimeHistoryCsv("0,0,0,0,0,0,0,0")
                    .consecutiveLongWeeks(0)
                    .weekendHours(0)
                    .leaveRecoveryDays(7)
                    .build();

            Settings settings = settingsRepository.findAll().stream().findFirst()
                    .orElse(Settings.builder().spareThreshold(80).balancedThreshold(100).stretchedThreshold(110).overloadedThreshold(125).build());
            employee.setStatus(WorkloadLogic.status(WorkloadLogic.utilization(employee.getAllocatedHours(), employee.getContractedHours()), settings));
            employee.setRiskScore(WorkloadLogic.burnoutScore(employee));

            toSave.add(employee);
        }

        // If there were any validation errors, do not persist anything and report
        if (report.hasErrors()) {
            return report;
        }

        for (Employee emp : toSave) {
            employees.save(emp);
            report.incrementCreated();
        }

        return report;
    }

    @Transactional(rollbackFor = Exception.class)
    public ImportReport importTasks(MultipartFile file) {
        validateFile(file);
        ImportReport report = new ImportReport();
        List<String[]> rows;
        try {
            rows = parseCsv(file);
        } catch (Exception e) {
            report.addError(1, "Malformed CSV file: " + e.getMessage());
            return report;
        }

        if (rows.isEmpty()) {
            report.addError(1, "CSV file is empty.");
            return report;
        }

        String[] headers = rows.get(0);
        Map<String, Integer> headerMap = mapHeaders(headers);
        if (!headerMap.containsKey("title")) {
            report.addError(1, "Missing required header: 'title'.");
            return report;
        }

        List<Task> toSave = new ArrayList<>();
        Map<Employee, Integer> employeeHourAdjustments = new HashMap<>();

        for (int i = 1; i < rows.size(); i++) {
            int lineNumber = i + 1;
            String[] row = rows.get(i);
            if (row.length == 0 || (row.length == 1 && row[0].trim().isEmpty())) {
                report.incrementSkipped();
                continue;
            }

            String title = getField(row, headerMap, "title");
            String employeeNameOrId = getField(row, headerMap, "employee");
            if (employeeNameOrId.isBlank()) {
                employeeNameOrId = getField(row, headerMap, "assignee");
            }
            String projectStr = getField(row, headerMap, "project");
            String hoursStr = getField(row, headerMap, "hours");
            String status = getField(row, headerMap, "status");
            String due = getField(row, headerMap, "due");

            if (title.isBlank()) {
                report.addError(lineNumber, "Task title is required.");
                continue;
            }

            Employee assignee = null;
            if (!employeeNameOrId.isBlank()) {
                final String targetEmp = employeeNameOrId;
                assignee = employees.findById(targetEmp)
                        .or(() -> employees.findByNameIgnoreCase(targetEmp))
                        .or(() -> employees.findByEmailIgnoreCase(targetEmp))
                        .orElse(null);

                if (assignee == null) {
                    report.addError(lineNumber, "Unknown employee: '" + targetEmp + "'.");
                    continue;
                }
            }

            int hours = 0;
            if (!hoursStr.isBlank()) {
                try {
                    hours = Integer.parseInt(hoursStr);
                    if (hours < 0 || hours > 168) {
                        report.addError(lineNumber, "Task hours must be between 0 and 168.");
                        continue;
                    }
                } catch (NumberFormatException e) {
                    report.addError(lineNumber, "Task hours must be an integer.");
                    continue;
                }
            }

            Project projectEntity = null;
            if (!projectStr.isBlank()) {
                projectEntity = projects.findAll().stream()
                        .filter(p -> p.getName().equalsIgnoreCase(projectStr) || p.getId().equalsIgnoreCase(projectStr))
                        .findFirst()
                        .orElse(null);
            }

            Task task = Task.builder()
                    .id("task-" + UUID.randomUUID().toString().substring(0, 8))
                    .title(title)
                    .project(projectEntity != null ? projectEntity.getName() : (projectStr.isBlank() ? "General" : projectStr))
                    .projectEntity(projectEntity)
                    .assignee(assignee)
                    .hours(hours)
                    .due(due.isBlank() ? "Upcoming" : due)
                    .status(status.isBlank() ? "To do" : status)
                    .isSuggested(false)
                    .build();

            toSave.add(task);
            if (assignee != null) {
                employeeHourAdjustments.merge(assignee, hours, Integer::sum);
            }
        }

        if (report.hasErrors()) {
            return report;
        }

        for (Task task : toSave) {
            tasks.save(task);
            report.incrementCreated();
        }

        // Adjust hours on affected employees
        Settings settings = settingsRepository.findAll().stream().findFirst()
                .orElse(Settings.builder().spareThreshold(80).balancedThreshold(100).stretchedThreshold(110).overloadedThreshold(125).build());

        for (Map.Entry<Employee, Integer> entry : employeeHourAdjustments.entrySet()) {
            Employee emp = entry.getKey();
            int addHours = entry.getValue();
            emp.setAllocatedHours(Math.max(0, emp.getAllocatedHours() + addHours));
            emp.setStatus(WorkloadLogic.status(WorkloadLogic.utilization(emp.getAllocatedHours(), emp.getContractedHours()), settings));
            emp.setRiskScore(WorkloadLogic.burnoutScore(emp));
            employees.save(emp);
        }

        return report;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be null or empty.");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 5MB limit.");
        }
    }

    private Map<String, Integer> mapHeaders(String[] headers) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            map.put(headers[i].trim().toLowerCase(Locale.ROOT).replace("_", "").replace("-", "").replace(" ", ""), i);
        }
        return map;
    }

    private String getField(String[] row, Map<String, Integer> headerMap, String field) {
        Integer idx = headerMap.get(field.toLowerCase(Locale.ROOT).replace("_", "").replace("-", "").replace(" ", ""));
        if (idx == null || idx >= row.length) {
            return "";
        }
        return row[idx].trim();
    }

    public List<String[]> parseCsv(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                // Ignore BOM if present
                if (!rows.isEmpty() || line.isEmpty() || line.charAt(0) != '\uFEFF') {
                    // standard line
                } else {
                    line = line.substring(1);
                }
                if (line.trim().isEmpty()) {
                    continue;
                }
                rows.add(parseLine(line));
            }
        }
        return rows;
    }

    public static String[] parseLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '\"') {
                    sb.append('\"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString());
        return tokens.toArray(new String[0]);
    }
}
