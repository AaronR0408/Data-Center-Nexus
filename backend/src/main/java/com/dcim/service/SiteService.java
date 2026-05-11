package com.dcim.service;

import com.dcim.dto.SiteDto;
import com.dcim.entity.Site;
import com.dcim.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;

    public List<SiteDto.Response> listSites() {
        return siteRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SiteDto.Response getSite(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found: " + id));
        return toResponse(site);
    }

    @Transactional
    public SiteDto.Response createSite(SiteDto.Request request) {
        Site site = new Site();
        site.setName(request.getName());
        site.setAddress(request.getAddress());
        site.setCity(request.getCity());
        site.setCountry(request.getCountry());
        return toResponse(siteRepository.save(site));
    }

    @Transactional
    public SiteDto.Response updateSite(Long id, SiteDto.Request request) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found: " + id));
        site.setName(request.getName());
        site.setAddress(request.getAddress());
        site.setCity(request.getCity());
        site.setCountry(request.getCountry());
        return toResponse(siteRepository.save(site));
    }

    @Transactional
    public void deleteSite(Long id) {
        siteRepository.deleteById(id);
    }

    public SiteDto.Response toResponse(Site site) {
        SiteDto.Response resp = new SiteDto.Response();
        resp.setId(site.getId());
        resp.setName(site.getName());
        resp.setAddress(site.getAddress());
        resp.setCity(site.getCity());
        resp.setCountry(site.getCountry());
        resp.setCreatedAt(site.getCreatedAt() != null ? site.getCreatedAt().toString() : null);
        return resp;
    }
}
