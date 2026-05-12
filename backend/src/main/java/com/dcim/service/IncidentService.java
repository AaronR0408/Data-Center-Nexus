package com.dcim.service;

import com.dcim.dto.IncidentDto;
import com.dcim.entity.Asset;
import com.dcim.entity.Incident;
import com.dcim.repository.AssetRepository;
import com.dcim.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final AssetRepository assetRepository;

    public List<IncidentDto.Response> listIncidents(String status) {
        List<Incident> incidents;
        if (status != null && !status.isBlank()) {
            incidents = incidentRepository.findByStatusOrderByCreatedAtDesc(Incident.Status.valueOf(status));
        } else {
            incidents = incidentRepository.findAllByOrderByCreatedAtDesc();
        }
        return incidents.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public IncidentDto.Response getIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + id));
        return toResponse(incident);
    }

    @Transactional
    public IncidentDto.Response createIncident(IncidentDto.Request request, String createdBy) {
        Incident incident = new Incident();
        applyRequest(incident, request);
        incident.setCreatedBy(createdBy);
        return toResponse(incidentRepository.save(incident));
    }

    @Transactional
    public IncidentDto.Response updateIncident(Long id, IncidentDto.Request request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + id));
        Incident.Status oldStatus = incident.getStatus();
        applyRequest(incident, request);
        if (incident.getStatus() == Incident.Status.RESOLVED && oldStatus != Incident.Status.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
        } else if (incident.getStatus() != Incident.Status.RESOLVED) {
            incident.setResolvedAt(null);
        }
        return toResponse(incidentRepository.save(incident));
    }

    @Transactional
    public void deleteIncident(Long id) {
        incidentRepository.deleteById(id);
    }

    private void applyRequest(Incident incident, IncidentDto.Request request) {
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        if (request.getSeverity() != null && !request.getSeverity().isBlank()) {
            incident.setSeverity(Incident.Severity.valueOf(request.getSeverity()));
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            incident.setStatus(Incident.Status.valueOf(request.getStatus()));
        }
        incident.setAssignedTo(request.getAssignedTo());
        if (request.getAssetId() != null) {
            Asset asset = assetRepository.findById(request.getAssetId())
                    .orElseThrow(() -> new RuntimeException("Asset not found: " + request.getAssetId()));
            incident.setAsset(asset);
        } else {
            incident.setAsset(null);
        }
    }

    public IncidentDto.Response toResponse(Incident incident) {
        IncidentDto.Response resp = new IncidentDto.Response();
        resp.setId(incident.getId());
        resp.setTitle(incident.getTitle());
        resp.setDescription(incident.getDescription());
        resp.setSeverity(incident.getSeverity() != null ? incident.getSeverity().name() : null);
        resp.setStatus(incident.getStatus() != null ? incident.getStatus().name() : null);
        resp.setAssetId(incident.getAsset() != null ? incident.getAsset().getId() : null);
        resp.setAssetName(incident.getAsset() != null ? incident.getAsset().getName() : null);
        resp.setAssignedTo(incident.getAssignedTo());
        resp.setCreatedBy(incident.getCreatedBy());
        resp.setCreatedAt(incident.getCreatedAt() != null ? incident.getCreatedAt().toString() : null);
        resp.setUpdatedAt(incident.getUpdatedAt() != null ? incident.getUpdatedAt().toString() : null);
        resp.setResolvedAt(incident.getResolvedAt() != null ? incident.getResolvedAt().toString() : null);
        return resp;
    }
}
