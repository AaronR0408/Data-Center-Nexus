package com.dcim.controller;

import com.dcim.dto.AssetDto;
import com.dcim.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public List<AssetDto.Response> listAssets(
            @RequestParam(required = false) Long rackId,
            @RequestParam(required = false) String type) {
        return assetService.listAssets(rackId, type);
    }

    @GetMapping("/{id}")
    public AssetDto.Response getAsset(@PathVariable Long id) {
        return assetService.getAsset(id);
    }

    @PostMapping
    public ResponseEntity<AssetDto.Response> createAsset(@Valid @RequestBody AssetDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(request));
    }

    @PutMapping("/{id}")
    public AssetDto.Response updateAsset(@PathVariable Long id, @Valid @RequestBody AssetDto.Request request) {
        return assetService.updateAsset(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
