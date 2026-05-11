package com.dcim.controller;

import com.dcim.dto.AssetDto;
import com.dcim.dto.DashboardDto;
import com.dcim.service.AssetService;
import com.dcim.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AssetService assetService;

    @GetMapping("/api/dashboard")
    public DashboardDto.Summary getDashboard() {
        return dashboardService.getSummary();
    }

    @GetMapping("/api/warranty/expiring")
    public List<AssetDto.Response> getExpiringWarranties() {
        return assetService.getExpiringWarranties();
    }

    @GetMapping("/api/healthz")
    public java.util.Map<String, String> healthCheck() {
        return java.util.Map.of("status", "ok");
    }
}
