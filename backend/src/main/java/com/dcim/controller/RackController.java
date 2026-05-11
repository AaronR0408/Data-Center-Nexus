package com.dcim.controller;

import com.dcim.dto.RackDto;
import com.dcim.service.RackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RackController {

    private final RackService rackService;

    @GetMapping("/api/rooms/{roomId}/racks")
    public List<RackDto.Response> listRacks(@PathVariable Long roomId) {
        return rackService.listRacks(roomId);
    }

    @PostMapping("/api/rooms/{roomId}/racks")
    public ResponseEntity<RackDto.Response> createRack(
            @PathVariable Long roomId,
            @Valid @RequestBody RackDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rackService.createRack(roomId, request));
    }

    @GetMapping("/api/racks/{id}")
    public RackDto.Response getRack(@PathVariable Long id) {
        return rackService.getRack(id);
    }

    @PutMapping("/api/racks/{id}")
    public RackDto.Response updateRack(@PathVariable Long id, @Valid @RequestBody RackDto.Request request) {
        return rackService.updateRack(id, request);
    }

    @DeleteMapping("/api/racks/{id}")
    public ResponseEntity<Void> deleteRack(@PathVariable Long id) {
        rackService.deleteRack(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/racks/{id}/view")
    public RackDto.RackView getRackView(@PathVariable Long id) {
        return rackService.getRackView(id);
    }
}
