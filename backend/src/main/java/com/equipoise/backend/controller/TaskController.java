package com.equipoise.backend.controller;

import com.equipoise.backend.dto.PageResponse;
import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final EquipoiseService service;

    public TaskController(EquipoiseService service) {
        this.service = service;
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
