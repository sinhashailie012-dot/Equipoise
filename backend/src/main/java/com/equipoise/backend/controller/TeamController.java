package com.equipoise.backend.controller;

import com.equipoise.backend.dto.PageResponse;
import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/teams")
public class TeamController {
    private final EquipoiseService service;

    public TeamController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<Map<String, Object>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.getTeams(page, size);
    }
}
