package com.dcim.controller;

import com.dcim.dto.IncidentDto;
import com.dcim.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    public List<IncidentDto.Response> listIncidents(@RequestParam(required = false) String status) {
        return incidentService.listIncidents(status);
    }

    @GetMapping("/{id}")
    public IncidentDto.Response getIncident(@PathVariable Long id) {
        return incidentService.getIncident(id);
    }

    @PostMapping
    public ResponseEntity<IncidentDto.Response> createIncident(
            @Valid @RequestBody IncidentDto.Request request,
            Authentication auth) {
        String username = auth != null ? auth.getName() : "system";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incidentService.createIncident(request, username));
    }

    @PutMapping("/{id}")
    public IncidentDto.Response updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody IncidentDto.Request request) {
        return incidentService.updateIncident(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }
}
