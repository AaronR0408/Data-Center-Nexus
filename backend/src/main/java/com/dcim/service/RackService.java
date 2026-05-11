package com.dcim.service;

import com.dcim.dto.AssetDto;
import com.dcim.dto.RackDto;
import com.dcim.entity.Asset;
import com.dcim.entity.Rack;
import com.dcim.entity.Room;
import com.dcim.repository.AssetRepository;
import com.dcim.repository.RackRepository;
import com.dcim.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RackService {

    private final RackRepository rackRepository;
    private final RoomRepository roomRepository;
    private final AssetRepository assetRepository;
    private final AssetService assetService;

    public List<RackDto.Response> listRacks(Long roomId) {
        return rackRepository.findByRoomId(roomId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RackDto.Response getRack(Long id) {
        Rack rack = rackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rack not found: " + id));
        return toResponse(rack);
    }

    @Transactional
    public RackDto.Response createRack(Long roomId, RackDto.Request request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));
        Rack rack = new Rack();
        rack.setName(request.getName());
        rack.setRoom(room);
        rack.setTotalU(request.getTotalU() != null ? request.getTotalU() : 42);
        rack.setDescription(request.getDescription());
        return toResponse(rackRepository.save(rack));
    }

    @Transactional
    public RackDto.Response updateRack(Long id, RackDto.Request request) {
        Rack rack = rackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rack not found: " + id));
        rack.setName(request.getName());
        if (request.getTotalU() != null) rack.setTotalU(request.getTotalU());
        rack.setDescription(request.getDescription());
        return toResponse(rackRepository.save(rack));
    }

    @Transactional
    public void deleteRack(Long id) {
        rackRepository.deleteById(id);
    }

    public RackDto.RackView getRackView(Long id) {
        Rack rack = rackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rack not found: " + id));

        List<Asset> assets = assetRepository.findByRackIdOrderByUPosition(id);

        // Build a map of uPosition -> asset for occupied slots
        Map<Integer, Asset> occupiedSlots = new java.util.HashMap<>();
        for (Asset asset : assets) {
            for (int u = asset.getUPosition(); u < asset.getUPosition() + asset.getUHeight(); u++) {
                occupiedSlots.put(u, asset);
            }
        }

        // Build slots from totalU down to 1
        List<RackDto.SlotView> slots = new ArrayList<>();
        for (int u = rack.getTotalU(); u >= 1; u--) {
            RackDto.SlotView slot = new RackDto.SlotView();
            slot.setUPosition(u);
            Asset assetAtSlot = occupiedSlots.get(u);
            if (assetAtSlot != null) {
                slot.setOccupied(true);
                // Only set asset on the base uPosition slot
                if (assetAtSlot.getUPosition() == u) {
                    slot.setAsset(assetService.toResponse(assetAtSlot));
                }
            } else {
                slot.setOccupied(false);
            }
            slots.add(slot);
        }

        RackDto.RackView view = new RackDto.RackView();
        view.setRack(toResponse(rack));
        view.setSlots(slots);
        return view;
    }

    public RackDto.Response toResponse(Rack rack) {
        RackDto.Response resp = new RackDto.Response();
        resp.setId(rack.getId());
        resp.setName(rack.getName());
        resp.setRoomId(rack.getRoom() != null ? rack.getRoom().getId() : null);
        resp.setRoomName(rack.getRoom() != null ? rack.getRoom().getName() : null);
        resp.setTotalU(rack.getTotalU());
        resp.setDescription(rack.getDescription());
        resp.setCreatedAt(rack.getCreatedAt() != null ? rack.getCreatedAt().toString() : null);

        // Calculate used U
        List<Asset> assets = assetRepository.findByRackId(rack.getId());
        int usedU = assets.stream().mapToInt(a -> a.getUHeight() != null ? a.getUHeight() : 1).sum();
        resp.setUsedU(usedU);

        return resp;
    }
}
