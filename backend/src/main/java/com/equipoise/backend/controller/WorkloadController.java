package com.equipoise.backend.controller;

import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workload")
public class WorkloadController {
    private final EquipoiseService service;

    public WorkloadController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping("/overview")
    public Map<String, Object> overview(@RequestParam(defaultValue = "2-8 Nov 2026") String dateRange) {
        return service.getOverview(dateRange);
    }

    @GetMapping("/rebalancer")
    public Map<String, Object> rebalancer(@RequestParam(defaultValue = "atlas-redesign") String project) {
        return service.getRebalancer(project);
    }

    @PostMapping("/reassign")
    public Map<String, Object> reassign(@RequestBody Map<String, Object> body) {
        return service.reassignTask(body);
    }

    @PostMapping("/suggestions/{id}/accept")
    public Map<String, Object> accept(@PathVariable String id) {
        return service.suggestionAction(id, true);
    }

    @PostMapping("/suggestions/{id}/dismiss")
    public Map<String, Object> dismiss(@PathVariable String id) {
        return service.suggestionAction(id, false);
    }
}
