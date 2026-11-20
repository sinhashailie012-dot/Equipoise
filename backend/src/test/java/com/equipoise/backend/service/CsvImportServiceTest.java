package com.equipoise.backend.service;

import com.equipoise.backend.dto.ImportReport;
import com.equipoise.backend.entity.Employee;
import com.equipoise.backend.entity.Settings;
import com.equipoise.backend.entity.Task;
import com.equipoise.backend.repository.EmployeeRepository;
import com.equipoise.backend.repository.ProjectRepository;
import com.equipoise.backend.repository.SettingsRepository;
import com.equipoise.backend.repository.TaskRepository;
import com.equipoise.backend.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CsvImportServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private SettingsRepository settingsRepository;

    @InjectMocks
    private CsvImportService csvImportService;

    @BeforeEach
    void setup() {
        lenient().when(settingsRepository.findAll()).thenReturn(List.of(
                Settings.builder()
                        .spareThreshold(80)
                        .balancedThreshold(100)
                        .stretchedThreshold(110)
                        .overloadedThreshold(125)
                        .build()
        ));
    }

    @Test
    @DisplayName("Employee import fails when required headers are missing")
    void importEmployeesMissingHeaders() {
        String csv = "invalidHeader,anotherHeader\nval1,val2\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        ImportReport report = csvImportService.importEmployees(file);

        assertTrue(report.hasErrors());
        assertEquals(0, report.getRowsCreated());
        assertEquals("Missing required headers. Headers must at least include 'name' and 'email'.", report.getErrors().get(0).getMessage());
    }

    @Test
    @DisplayName("Employee import validates row missing name or email")
    void importEmployeesValidatesEmptyFields() {
        String csv = "name,email,role\n" +
                ",valid@forma.studio,Designer\n" +
                "Jane Doe,,Designer\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        ImportReport report = csvImportService.importEmployees(file);

        assertTrue(report.hasErrors());
        assertEquals(2, report.getErrors().size());
        assertEquals(2, report.getErrors().get(0).getLineNumber());
        assertTrue(report.getErrors().get(0).getMessage().contains("Employee name is required"));
        assertEquals(3, report.getErrors().get(1).getLineNumber());
        assertTrue(report.getErrors().get(1).getMessage().contains("Email is required"));
        verify(employeeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Employee import validates invalid email format and duplicate email in CSV")
    void importEmployeesValidatesEmails() {
        String csv = "name,email\n" +
                "User 1,not-an-email\n" +
                "User 2,dup@forma.studio\n" +
                "User 3,dup@forma.studio\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        ImportReport report = csvImportService.importEmployees(file);

        assertTrue(report.hasErrors());
        assertEquals(2, report.getErrors().size());
        assertTrue(report.getErrors().get(0).getMessage().contains("Invalid email format"));
        assertTrue(report.getErrors().get(1).getMessage().contains("Duplicate email in CSV file"));
        verify(employeeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Employee import validates existing email in database")
    void importEmployeesValidatesExistingDatabaseEmail() {
        when(employeeRepository.findByEmailIgnoreCase("existing@forma.studio"))
                .thenReturn(Optional.of(Employee.builder().id("existing").email("existing@forma.studio").build()));

        String csv = "name,email\n" +
                "Existing User,existing@forma.studio\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        ImportReport report = csvImportService.importEmployees(file);

        assertTrue(report.hasErrors());
        assertEquals(1, report.getErrors().size());
        assertTrue(report.getErrors().get(0).getMessage().contains("already exists in database"));
        verify(employeeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Employee import validates contracted and allocated number ranges")
    void importEmployeesValidatesNumberRanges() {
        String csv = "name,email,contractedHours,allocatedHours\n" +
                "User 1,user1@forma.studio,0,10\n" +
                "User 2,user2@forma.studio,40,-5\n" +
                "User 3,user3@forma.studio,40,200\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        ImportReport report = csvImportService.importEmployees(file);

        assertTrue(report.hasErrors());
        assertEquals(3, report.getErrors().size());
        assertTrue(report.getErrors().get(0).getMessage().contains("contractedHours must be between 1 and 168"));
        assertTrue(report.getErrors().get(1).getMessage().contains("allocatedHours must be between 0 and 168"));
        assertTrue(report.getErrors().get(2).getMessage().contains("allocatedHours must be between 0 and 168"));
        verify(employeeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Employee import succeeds when all rows are valid")
    void importEmployeesSuccess() {
        String csv = "name,email,contractedHours,allocatedHours\n" +
                "Alice Smith,alice@forma.studio,40,35\n" +
                "Bob Jones,bob@forma.studio,38,42\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(employeeRepository.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());

        ImportReport report = csvImportService.importEmployees(file);

        assertFalse(report.hasErrors());
        assertEquals(2, report.getRowsCreated());
        assertEquals(0, report.getRowsSkipped());
        verify(employeeRepository, times(2)).save(any(Employee.class));
    }

    @Test
    @DisplayName("Task import validates missing title and unknown employee")
    void importTasksValidatesTitleAndEmployee() {
        String csv = "title,employee,hours\n" +
                ",Jane Doe,5\n" +
                "Valid Title,NonExistentEmployee,6\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(employeeRepository.findById("NonExistentEmployee")).thenReturn(Optional.empty());
        when(employeeRepository.findByNameIgnoreCase("NonExistentEmployee")).thenReturn(Optional.empty());
        when(employeeRepository.findByEmailIgnoreCase("NonExistentEmployee")).thenReturn(Optional.empty());

        ImportReport report = csvImportService.importTasks(file);

        assertTrue(report.hasErrors());
        assertEquals(2, report.getErrors().size());
        assertTrue(report.getErrors().get(0).getMessage().contains("Task title is required"));
        assertTrue(report.getErrors().get(1).getMessage().contains("Unknown employee"));
        verify(taskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Task import validates hours range and non-integers")
    void importTasksValidatesHours() {
        String csv = "title,hours\n" +
                "Task 1,-1\n" +
                "Task 2,abc\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        ImportReport report = csvImportService.importTasks(file);

        assertTrue(report.hasErrors());
        assertEquals(2, report.getErrors().size());
        assertTrue(report.getErrors().get(0).getMessage().contains("Task hours must be between 0 and 168"));
        assertTrue(report.getErrors().get(1).getMessage().contains("Task hours must be an integer"));
        verify(taskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Task import succeeds and updates employee allocated hours")
    void importTasksSuccess() {
        Employee emp = Employee.builder()
                .id("jane-doe")
                .name("Jane Doe")
                .allocatedHours(20)
                .contractedHours(40)
                .build();

        when(employeeRepository.findById("Jane Doe")).thenReturn(Optional.empty());
        when(employeeRepository.findByNameIgnoreCase("Jane Doe")).thenReturn(Optional.of(emp));

        String csv = "title,employee,hours,status\n" +
                "Design home,Jane Doe,10,In progress\n";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        ImportReport report = csvImportService.importTasks(file);

        assertFalse(report.hasErrors());
        assertEquals(1, report.getRowsCreated());
        verify(taskRepository, times(1)).save(any(Task.class));
        assertEquals(30, emp.getAllocatedHours());
        verify(employeeRepository, times(1)).save(emp);
    }
}
