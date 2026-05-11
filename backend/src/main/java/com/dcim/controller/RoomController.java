package com.dcim.controller;

import com.dcim.dto.RoomDto;
import com.dcim.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/api/sites/{siteId}/rooms")
    public List<RoomDto.Response> listRooms(@PathVariable Long siteId) {
        return roomService.listRooms(siteId);
    }

    @PostMapping("/api/sites/{siteId}/rooms")
    public ResponseEntity<RoomDto.Response> createRoom(
            @PathVariable Long siteId,
            @Valid @RequestBody RoomDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(siteId, request));
    }

    @GetMapping("/api/rooms/{id}")
    public RoomDto.Response getRoom(@PathVariable Long id) {
        return roomService.getRoom(id);
    }

    @PutMapping("/api/rooms/{id}")
    public RoomDto.Response updateRoom(@PathVariable Long id, @Valid @RequestBody RoomDto.Request request) {
        return roomService.updateRoom(id, request);
    }

    @DeleteMapping("/api/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
