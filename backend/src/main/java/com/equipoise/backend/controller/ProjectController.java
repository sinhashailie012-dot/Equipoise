package com.equipoise.backend.controller;

import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final EquipoiseService service;

    public ProjectController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam Map<String, String> params) {
        return service.getProjects(params);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable String id) {
        return service.getProject(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        return service.createProject(body);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return service.updateProject(id, body);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        return service.deleteProject(id);
    }
}
