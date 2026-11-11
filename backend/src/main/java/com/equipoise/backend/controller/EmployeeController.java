package com.equipoise.backend.controller;

import com.equipoise.backend.dto.PageResponse;
import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EquipoiseService service;

    public EmployeeController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<Map<String, Object>> list(@RequestParam Map<String, String> params) {
        return service.getEmployees(params);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable String id) {
        return service.getEmployee(id);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return service.updateEmployee(id, body);
    }

    @PostMapping("/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> addNote(@PathVariable String id, @RequestBody Map<String, String> body) {
        return service.addNote(id, body);
    }
}
