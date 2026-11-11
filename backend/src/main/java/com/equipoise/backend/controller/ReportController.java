package com.equipoise.backend.controller;

import com.equipoise.backend.service.EquipoiseService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final EquipoiseService service;

    public ReportController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get(@RequestParam Map<String, String> params) {
        return service.getReport(params);
    }

    @GetMapping(value = "/export-csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(@RequestParam Map<String, String> params) {
        byte[] content = service.exportCsv(params).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=equipoise-workload-report.csv")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(content);
    }
}
