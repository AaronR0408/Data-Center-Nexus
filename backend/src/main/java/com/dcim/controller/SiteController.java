package com.dcim.controller;

import com.dcim.dto.SiteDto;
import com.dcim.service.SiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @GetMapping
    public List<SiteDto.Response> listSites() {
        return siteService.listSites();
    }

    @GetMapping("/{id}")
    public SiteDto.Response getSite(@PathVariable Long id) {
        return siteService.getSite(id);
    }

    @PostMapping
    public ResponseEntity<SiteDto.Response> createSite(@Valid @RequestBody SiteDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.createSite(request));
    }

    @PutMapping("/{id}")
    public SiteDto.Response updateSite(@PathVariable Long id, @Valid @RequestBody SiteDto.Request request) {
        return siteService.updateSite(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        siteService.deleteSite(id);
        return ResponseEntity.noContent().build();
    }
}
