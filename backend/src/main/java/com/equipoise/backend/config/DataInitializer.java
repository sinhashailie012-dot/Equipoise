package com.equipoise.backend.config;

import com.equipoise.backend.entity.*;
import com.equipoise.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@Configuration
@Profile("dev")
public class DataInitializer {
    private record EmployeeSeed(String id, String name, String initials, String role, String department,
                                int hours, int capacity, int risk, int overdue, String project,
                                String allocation, String overtime, int longWeeks, int weekendHours) {}

    @Bean
    CommandLineRunner seedDemoData(
            UserRepository users,
            TeamRepository teams,
            EmployeeRepository employees,
            ProjectRepository projects,
            TaskRepository tasks,
            LeaveRepository leaves,
            AlertRepository alerts,
            AlertRuleRepository rules,
            CheckInRepository checkIns,
            NoteRepository notes,
            SettingsRepository settingsRepository,
            PasswordEncoder encoder
    ) {
        return args -> {
            if (users.existsByEmail("manager@equipoise.com")) return;

            User manager = users.save(User.builder()
                    .id("emma-chen")
                    .name("Emma Chen")
                    .email("manager@equipoise.com")
                    .password(encoder.encode("Password@123"))
                    .role(Role.MANAGER)
                    .title("Design manager")
                    .initials("EC")
                    .workspace("Forma Studio")
                    .department("People Operations / Design Team")
                    .build());
            users.save(User.builder().id("admin").name("Equipoise Admin").email("admin@equipoise.com")
                    .password(encoder.encode("Password@123")).role(Role.ADMIN).title("Administrator")
                    .initials("EA").workspace("Forma Studio").department("Administration").build());

            Team design = teams.save(Team.builder().id("design-team").name("Design Team")
                    .department("Design").contractedHours(320).build());
            Team product = teams.save(Team.builder().id("product-team").name("Product Team")
                    .department("Product").contractedHours(120).build());
            Team research = teams.save(Team.builder().id("research-team").name("Research Team")
                    .department("Research").contractedHours(80).build());

            List<Project> projectList = projects.saveAll(List.of(
                    project("atlas-redesign", "Atlas redesign", "A simpler, more accessible checkout experience.", "Needs attention", "stretched", "Asha Patel", "AP", 112, 120, 93, 28, 44, 16, 2, 1, "Usability round 2 · 10 Nov", "20 Nov 2026", "AP,DK,JO"),
                    project("beacon-launch", "Beacon launch", "A confident launch for our new customer workspace.", "At risk", "overloaded", "Marcus Reed", "MR", 122, 120, 102, 34, 56, 17, 3, 2, "Content approval · 6 Nov", "27 Nov 2026", "MR,SR,OB"),
                    project("core-platform", "Core platform", "Shared foundations for a more consistent product.", "On track", "balanced", "Mei Tan", "MT", 72, 80, 90, 22, 31, 9, 0, 0, "Token library review · 9 Nov", "11 Dec 2026", "MT,NW"),
                    project("mobile-app", "Mobile app refresh", "A calmer mobile experience for returning customers.", "On track", "balanced", "Priya Shah", "PS", 46, 60, 77, 12, 24, 8, 0, 0, "Prototype review · 18 Nov", "18 Dec 2026", "PS,ER"),
                    project("insights-hub", "Insights hub", "A shared place for product and customer insights.", "Needs attention", "stretched", "Lena Fischer", "LF", 52, 48, 108, 8, 20, 12, 1, 1, "Research synthesis · 13 Nov", "4 Dec 2026", "LF,AK"),
                    project("design-ops", "Design operations", "Improve the rituals and tooling behind great work.", "On track", "balanced", "Noah Williams", "NW", 32, 40, 80, 6, 18, 8, 0, 0, "Quarterly planning · 24 Nov", "18 Dec 2026", "NW,MT")
            ));

            String[][] seedRows = {
                    {"marcus-reed","Marcus Reed","MR","Senior product designer","Design","52","40","88","2","Beacon launch","36,38,42,44,46,48,50,52","0,0,2,4,6,8,10,12","6","4"},
                    {"asha-patel","Asha Patel","AP","Senior product designer","Design","48","40","82","2","Atlas redesign","34,36,38,40,44,46,50,48","0,0,0,0,4,6,10,8","4","2"},
                    {"sofia-rivera","Sofia Rivera","SR","Content designer","Design","44","40","67","1","Beacon launch","32,34,36,38,40,42,44,44","0,0,0,0,0,2,4,4","3","1"},
                    {"mei-tan","Mei Tan","MT","Design systems lead","Design","40","40","42","0","Core platform","36,38,36,40,38,40,40,40","0,0,0,0,0,0,0,0","0","0"},
                    {"james-okafor","James Okafor","JO","UX researcher","Design","36","40","38","0","Atlas redesign","30,32,34,36,34,36,38,36","0,0,0,0,0,0,0,0","0","0"},
                    {"noah-williams","Noah Williams","NW","Product designer","Design","32","40","28","0","Core platform","28,30,30,32,34,32,34,32","0,0,0,0,0,0,0,0","0","0"},
                    {"daniel-kim","Daniel Kim","DK","Product designer","Design","28","40","24","0","Atlas redesign","32,30,34,32,30,28,30,28","0,0,0,0,0,0,0,0","0","0"},
                    {"olivia-brooks","Olivia Brooks","OB","Visual designer","Design","26","40","20","0","Beacon launch","32,30,28,30,28,26,28,26","0,0,0,0,0,0,0,0","0","0"},
                    {"priya-shah","Priya Shah","PS","Product manager","Product","38","40","45","0","Mobile app refresh","34,36,38,38,40,38,38,38","0,0,0,0,0,0,0,0","0","0"},
                    {"ethan-ross","Ethan Ross","ER","Mobile engineer","Product","42","40","62","1","Mobile app refresh","34,36,38,40,42,44,42,42","0,0,0,0,0,2,2,2","3","2"},
                    {"lena-fischer","Lena Fischer","LF","Research lead","Research","43","40","71","1","Insights hub","32,34,38,40,42,44,44,43","0,0,0,0,2,4,4,3","3","2"},
                    {"amir-khan","Amir Khan","AK","Data analyst","Product","24","40","22","0","Insights hub","26,28,26,24,28,26,24,24","0,0,0,0,0,0,0,0","0","0"},
                    {"grace-chen","Grace Chen","GC","Frontend engineer","Product","39","40","48","0","Core platform","36,38,38,40,42,40,38,39","0,0,0,0,0,0,0,0","1","0"},
                    {"mateo-silva","Mateo Silva","MS","Content strategist","Product","46","40","74","1","Beacon launch","34,36,40,42,44,46,48,46","0,0,0,2,4,6,8,6","4","3"},
                    {"zara-ahmed","Zara Ahmed","ZA","UX researcher","Research","30","40","32","0","Insights hub","28,30,32,34,32,30,30,30","0,0,0,0,0,0,0,0","0","0"}
            };
            List<Employee> employeeList = new ArrayList<>();
            for (String[] row : seedRows) {
                EmployeeSeed seed = new EmployeeSeed(row[0], row[1], row[2], row[3], row[4],
                        Integer.parseInt(row[5]), Integer.parseInt(row[6]), Integer.parseInt(row[7]),
                        Integer.parseInt(row[8]), row[9], row[10], row[11], Integer.parseInt(row[12]),
                        Integer.parseInt(row[13]));
                Team team = switch (seed.department()) {
                    case "Product" -> product;
                    case "Research" -> research;
                    default -> design;
                };
                Employee employee = Employee.builder()
                        .id(seed.id()).name(seed.name()).initials(seed.initials()).role(seed.role())
                        .email(seed.id().replace('-', '.') + "@forma.studio").department(seed.department())
                        .reportsTo(manager.getName()).allocatedHours(seed.hours()).contractedHours(seed.capacity())
                        .riskScore(seed.risk()).overdueTasks(seed.overdue()).activeTasks(3)
                        .project(seed.project()).weeklyAllocationCsv(seed.allocation())
                        .overtimeHistoryCsv(seed.overtime()).consecutiveLongWeeks(seed.longWeeks())
                        .weekendHours(seed.weekendHours()).leaveRecoveryDays(seed.risk() >= 60 ? 2 : 7)
                        .team(team).build();
                employee.setStatus(status(seed.hours(), seed.capacity()));
                employeeList.add(employees.save(employee));
            }

            seedInitialTasks(tasks, projects, employeeList);
            String[] taskNames = {"Review interaction states", "Prepare stakeholder notes", "Validate accessibility", "Refine prototype", "Document handoff"};
            int taskNumber = 17;
            List<Employee> additionalTaskOwners = employeeList.stream()
                    .filter(employee -> !List.of("asha-patel", "daniel-kim", "james-okafor").contains(employee.getId()))
                    .toList();
            for (int employeeIndex = 0; employeeIndex < additionalTaskOwners.size(); employeeIndex++) {
                Employee assignee = additionalTaskOwners.get(employeeIndex);
                Project project = projectList.stream()
                        .filter(item -> item.getName().equals(assignee.getProject())).findFirst().orElse(projectList.get(0));
                int taskCount = employeeIndex < 10 ? 3 : 2;
                int baseHours = assignee.getAllocatedHours() / taskCount;
                int remainder = assignee.getAllocatedHours() % taskCount;
                for (int index = 0; index < taskCount; index++) {
                    int taskId = taskNumber++;
                    tasks.save(Task.builder().id("task-" + taskId)
                            .title(taskNames[taskId % taskNames.length])
                            .project(project.getName()).projectEntity(project).assignee(assignee)
                            .hours(baseHours + (index < remainder ? 1 : 0)).due((6 + taskId % 20) + " Nov")
                            .status(taskId % 7 == 0 ? "Overdue" : taskId % 3 == 0 ? "In progress" : "To do")
                            .isSuggested(false).build());
                }
            }

            leaves.saveAll(List.of(
                    Leave.builder().id("leave-1").employee(employees.getReferenceById("asha-patel")).employeeName("Asha Patel").type("Annual leave").dates("16–17 Nov").hours("16 hrs").status("Approved").build(),
                    Leave.builder().id("leave-2").employee(employees.getReferenceById("olivia-brooks")).employeeName("Olivia Brooks").type("Annual leave").dates("27 Nov").hours("8 hrs").status("Approved").build(),
                    Leave.builder().id("leave-3").employee(employees.getReferenceById("james-okafor")).employeeName("James Okafor").type("Recovery day").dates("20 Nov").hours("8 hrs").status("Approved").build()
            ));

            alerts.saveAll(List.of(
                    alert("alert-1", Severity.CRITICAL, "Marcus Reed is at 130% capacity", "Six consecutive weeks above capacity with two overdue tasks.", "marcus-reed", "task-21"),
                    alert("alert-2", Severity.CRITICAL, "Asha has no recovery window", "Asha has recorded 24 hours of overtime across the last three weeks.", "asha-patel", "task-2"),
                    alert("alert-3", Severity.NEEDS_ATTENTION, "Beacon launch is over capacity", "The project is committed beyond its weekly capacity.", "marcus-reed", null),
                    alert("alert-4", Severity.NEEDS_ATTENTION, "Sofia has an overdue task", "One overdue task needs a revised owner or deadline.", "sofia-rivera", null),
                    alert("alert-5", Severity.AWARENESS, "Daniel has 12 hours available", "Daniel is a good match for Atlas research synthesis.", "daniel-kim", null),
                    alert("alert-6", Severity.AWARENESS, "Asha's leave is approved", "Annual leave is scheduled for 16–17 November.", "asha-patel", null)
            ));
            rules.saveAll(List.of(
                    AlertRule.builder().id("rule-1").name("Workload > 125%").thresholdPercent(125).severity("critical").active(true).build(),
                    AlertRule.builder().id("rule-2").name("Consecutive overtime >= 3 weeks").thresholdPercent(3).severity("critical").active(true).build(),
                    AlertRule.builder().id("rule-3").name("Overdue tasks >= 2").thresholdPercent(2).severity("needs-attention").active(true).build()
            ));
            notes.save(Note.builder().employee(employees.getReferenceById("asha-patel"))
                    .noteText("Asha is carrying both discovery and delivery for Atlas. Protect focus time and move synthesis support before Friday.")
                    .author("Emma Chen").build());
            checkIns.save(CheckIn.builder().id("checkin-1").employee(employees.getReferenceById("marcus-reed"))
                    .employeeName("Marcus Reed").date("Friday, 6 Nov 2026").time("11:00").duration("30 minutes")
                    .location("Google Meet").agenda("Review current workload and identify recovery time.")
                    .status("Scheduled").build());
            settingsRepository.save(Settings.builder().id("default").build());
        };
    }

    private static StatusBand status(int hours, int capacity) {
        int utilization = (int) Math.round((double) hours * 100 / capacity);
        if (utilization < 80) return StatusBand.SPARE;
        if (utilization <= 100) return StatusBand.BALANCED;
        if (utilization <= 110) return StatusBand.STRETCHED;
        if (utilization <= 125) return StatusBand.OVERLOADED;
        return StatusBand.CRITICAL;
    }

    private static Project project(String id, String name, String subtitle, String status, String variant,
                                   String lead, String initials, int allocation, int capacity, int percentage,
                                   int completed, int total, int active, int overdue, int risk,
                                   String milestone, String due, String contributors) {
        return Project.builder().id(id).name(name).subtitle(subtitle).status(status).statusVariant(variant)
                .leadName(lead).leadInitials(initials).weeklyAllocation(allocation).weeklyCapacity(capacity)
                .percentage(percentage).completedTasks(completed).totalTasks(total).activeTasks(active)
                .overdueTasks(overdue).atRiskPeople(risk).nextMilestone(milestone).projectDueDate(due)
                .contributorsCsv(contributors).build();
    }

    private static Alert alert(String id, Severity severity, String title, String description, String personId, String taskId) {
        return Alert.builder().id(id).category(severity).severityLabel(severity.name().toLowerCase().replace('_', '-'))
                .sender("Equipoise").time("Today · 9:15").title(title).description(description)
                .personId(personId).taskId(taskId).actionLabel("Review").actionRoute("/team/" + personId)
                .actionType("navigate").build();
    }

    private static void seedInitialTasks(TaskRepository tasks, ProjectRepository projects, List<Employee> employees) {
        String[][] rows = {
                {"task-1","Checkout interaction spec","asha-patel","12","6 Nov","In progress"},
                {"task-2","Research synthesis","asha-patel","6","6 Nov","To do"},
                {"task-3","Prototype usability fixes","asha-patel","10","4 Nov","Overdue"},
                {"task-4","Accessibility review","asha-patel","8","3 Nov","Overdue"},
                {"task-5","Stakeholder review","asha-patel","4","9 Nov","Scheduled"},
                {"task-6","Design QA","asha-patel","5","10 Nov","To do"},
                {"task-7","Team rituals & planning","asha-patel","3","6 Nov","Scheduled"},
                {"task-8","Component audit","daniel-kim","8","9 Nov","In progress"},
                {"task-9","Onboarding wireframes","daniel-kim","10","10 Nov","In progress"},
                {"task-10","Prototype support","daniel-kim","6","12 Nov","To do"},
                {"task-11","Team rituals & planning","daniel-kim","4","6 Nov","Scheduled"},
                {"task-12","Participant interviews","james-okafor","12","10 Nov","In progress"},
                {"task-13","Recruitment & screening","james-okafor","8","9 Nov","In progress"},
                {"task-14","Interview guide","james-okafor","6","11 Nov","To do"},
                {"task-15","Insight repository","james-okafor","6","12 Nov","To do"},
                {"task-16","Team rituals & planning","james-okafor","4","6 Nov","Scheduled"}
        };
        for (String[] row : rows) {
            Employee assignee = employees.stream().filter(item -> item.getId().equals(row[2])).findFirst().orElseThrow();
            boolean internalTask = List.of("task-7", "task-11", "task-16").contains(row[0]);
            Project project = internalTask ? null : projects.findById(assignee.getProject().equals("Atlas redesign")
                    ? "atlas-redesign" : assignee.getProject().equals("Beacon launch") ? "beacon-launch" : "core-platform").orElseThrow();
            tasks.save(Task.builder().id(row[0]).title(row[1]).project(internalTask ? "Internal" : project.getName()).projectEntity(project)
                    .assignee(assignee).hours(Integer.parseInt(row[3])).due(row[4]).status(row[5])
                    .isSuggested(row[0].equals("task-2")).suggestedTo(row[0].equals("task-2")
                            ? employees.stream().filter(item -> item.getId().equals("daniel-kim")).findFirst().orElse(null)
                            : null).build());
        }
    }
}
