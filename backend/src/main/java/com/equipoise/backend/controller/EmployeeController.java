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
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EquipoiseService service;
    private final CsvImportService csvImportService;

    public EmployeeController(EquipoiseService service, CsvImportService csvImportService) {
        this.service = service;
        this.csvImportService = csvImportService;
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportReport> importEmployees(@RequestParam("file") MultipartFile file) {
        ImportReport report = csvImportService.importEmployees(file);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] bytes = csvImportService.getEmployeeTemplate().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"employees_template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping
    public PageResponse<Map<String, Object>> list(@RequestParam Map<String, String> params) {
        return service.getEmployees(params);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        return service.createEmployee(body);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable String id) {
        return service.getEmployee(id);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return service.updateEmployee(id, body);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        return service.deleteEmployee(id);
    }

    @PostMapping("/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> addNote(@PathVariable String id, @RequestBody Map<String, String> body) {
        return service.addNote(id, body);
    }
}
