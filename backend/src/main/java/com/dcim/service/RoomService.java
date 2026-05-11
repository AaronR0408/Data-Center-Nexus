package com.dcim.service;

import com.dcim.dto.RoomDto;
import com.dcim.entity.Room;
import com.dcim.entity.Site;
import com.dcim.repository.RoomRepository;
import com.dcim.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final SiteRepository siteRepository;

    public List<RoomDto.Response> listRooms(Long siteId) {
        return roomRepository.findBySiteId(siteId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RoomDto.Response getRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found: " + id));
        return toResponse(room);
    }

    @Transactional
    public RoomDto.Response createRoom(Long siteId, RoomDto.Request request) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found: " + siteId));
        Room room = new Room();
        room.setName(request.getName());
        room.setFloor(request.getFloor());
        room.setSite(site);
        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomDto.Response updateRoom(Long id, RoomDto.Request request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found: " + id));
        room.setName(request.getName());
        room.setFloor(request.getFloor());
        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    public RoomDto.Response toResponse(Room room) {
        RoomDto.Response resp = new RoomDto.Response();
        resp.setId(room.getId());
        resp.setName(room.getName());
        resp.setFloor(room.getFloor());
        resp.setSiteId(room.getSite() != null ? room.getSite().getId() : null);
        resp.setSiteName(room.getSite() != null ? room.getSite().getName() : null);
        resp.setCreatedAt(room.getCreatedAt() != null ? room.getCreatedAt().toString() : null);
        return resp;
    }
}
