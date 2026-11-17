package com.equipoise.backend.controller;

import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/capacity")
public class CapacityController {
    private final EquipoiseService service;

    public CapacityController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get(@RequestParam(defaultValue = "weeks") String view) {
        return service.getCapacity(view);
    }

    @PostMapping("/leave")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> addLeave(@RequestBody Map<String, Object> body) {
        return service.addLeave(body);
    }

    @PutMapping("/leave/{id}")
    public Map<String, Object> updateLeave(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return service.updateLeave(id, body);
    }

    @DeleteMapping("/leave/{id}")
    public Map<String, Object> deleteLeave(@PathVariable String id) {
        return service.deleteLeave(id);
    }

    @PostMapping("/allocations")
    public Map<String, Object> addAllocation(@RequestBody Map<String, Object> body) {
        return service.addAllocation(body);
    }
}
