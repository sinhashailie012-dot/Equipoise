package com.equipoise.backend.controller;

import com.equipoise.backend.dto.ImportReport;
import com.equipoise.backend.dto.PageResponse;
import com.equipoise.backend.service.CsvImportService;
import com.equipoise.backend.service.EquipoiseService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final EquipoiseService service;
    private final CsvImportService csvImportService;

    public TaskController(EquipoiseService service, CsvImportService csvImportService) {
        this.service = service;
        this.csvImportService = csvImportService;
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportReport> importTasks(@RequestParam("file") MultipartFile file) {
        ImportReport report = csvImportService.importTasks(file);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] bytes = csvImportService.getTaskTemplate().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tasks_template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping
    public PageResponse<Map<String, Object>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String employeeId
    ) {
        return service.getTasks(page, size, search, status, employeeId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        return service.createTask(body);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return service.updateTask(id, body);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        return service.deleteTask(id);
    }
}
