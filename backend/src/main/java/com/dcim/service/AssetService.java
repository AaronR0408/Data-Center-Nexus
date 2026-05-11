package com.dcim.service;

import com.dcim.dto.AssetDto;
import com.dcim.entity.Asset;
import com.dcim.entity.Rack;
import com.dcim.repository.AssetRepository;
import com.dcim.repository.RackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final RackRepository rackRepository;

    public List<AssetDto.Response> listAssets(Long rackId, String type) {
        List<Asset> assets;
        if (rackId != null) {
            assets = assetRepository.findByRackId(rackId);
        } else if (type != null) {
            assets = assetRepository.findByType(Asset.AssetType.valueOf(type));
        } else {
            assets = assetRepository.findAll();
        }
        return assets.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AssetDto.Response getAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + id));
        return toResponse(asset);
    }

    @Transactional
    public AssetDto.Response createAsset(AssetDto.Request request) {
        Rack rack = rackRepository.findById(request.getRackId())
                .orElseThrow(() -> new RuntimeException("Rack not found: " + request.getRackId()));

        // Check for slot conflicts
        int uStart = request.getUPosition();
        int uEnd = uStart + request.getUHeight() - 1;
        if (uEnd > rack.getTotalU()) {
            throw new IllegalArgumentException("Asset exceeds rack height (" + rack.getTotalU() + "U)");
        }

        List<Asset> conflicts = assetRepository.findConflictingAssets(rack.getId(), uStart, uEnd, -1L);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Slot conflict: slots " + uStart + "-" + uEnd + " are already occupied");
        }

        Asset asset = buildAsset(new Asset(), request, rack);
        return toResponse(assetRepository.save(asset));
    }

    @Transactional
    public AssetDto.Response updateAsset(Long id, AssetDto.Request request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + id));

        Rack rack = rackRepository.findById(request.getRackId())
                .orElseThrow(() -> new RuntimeException("Rack not found: " + request.getRackId()));

        int uStart = request.getUPosition();
        int uEnd = uStart + request.getUHeight() - 1;
        if (uEnd > rack.getTotalU()) {
            throw new IllegalArgumentException("Asset exceeds rack height (" + rack.getTotalU() + "U)");
        }

        List<Asset> conflicts = assetRepository.findConflictingAssets(rack.getId(), uStart, uEnd, id);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Slot conflict: slots " + uStart + "-" + uEnd + " are already occupied");
        }

        buildAsset(asset, request, rack);
        return toResponse(assetRepository.save(asset));
    }

    @Transactional
    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }

    public List<AssetDto.Response> getExpiringWarranties() {
        LocalDate now = LocalDate.now();
        LocalDate cutoff = now.plusDays(90);
        return assetRepository.findExpiringWarranties(now, cutoff)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private Asset buildAsset(Asset asset, AssetDto.Request request, Rack rack) {
        asset.setName(request.getName());
        asset.setType(Asset.AssetType.valueOf(request.getType()));
        asset.setManufacturer(request.getManufacturer());
        asset.setModel(request.getModel());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setAssetTag(request.getAssetTag());
        asset.setRack(rack);
        asset.setUPosition(request.getUPosition());
        asset.setUHeight(request.getUHeight());
        if (request.getStatus() != null) {
            asset.setStatus(Asset.AssetStatus.valueOf(request.getStatus()));
        } else {
            asset.setStatus(Asset.AssetStatus.ACTIVE);
        }
        if (request.getInstallDate() != null && !request.getInstallDate().isBlank()) {
            asset.setInstallDate(LocalDate.parse(request.getInstallDate()));
        }
        if (request.getWarrantyExpiration() != null && !request.getWarrantyExpiration().isBlank()) {
            asset.setWarrantyExpiration(LocalDate.parse(request.getWarrantyExpiration()));
        }
        return asset;
    }

    public AssetDto.Response toResponse(Asset asset) {
        AssetDto.Response resp = new AssetDto.Response();
        resp.setId(asset.getId());
        resp.setName(asset.getName());
        resp.setType(asset.getType() != null ? asset.getType().name() : null);
        resp.setManufacturer(asset.getManufacturer());
        resp.setModel(asset.getModel());
        resp.setSerialNumber(asset.getSerialNumber());
        resp.setAssetTag(asset.getAssetTag());
        resp.setRackId(asset.getRack() != null ? asset.getRack().getId() : null);
        resp.setRackName(asset.getRack() != null ? asset.getRack().getName() : null);
        resp.setUPosition(asset.getUPosition());
        resp.setUHeight(asset.getUHeight());
        resp.setStatus(asset.getStatus() != null ? asset.getStatus().name() : null);
        resp.setInstallDate(asset.getInstallDate() != null ? asset.getInstallDate().toString() : null);
        resp.setWarrantyExpiration(asset.getWarrantyExpiration() != null ? asset.getWarrantyExpiration().toString() : null);
        resp.setCreatedAt(asset.getCreatedAt() != null ? asset.getCreatedAt().toString() : null);
        return resp;
    }
}
