package com.dcim.service;

import com.dcim.dto.DashboardDto;
import com.dcim.entity.Asset;
import com.dcim.entity.Rack;
import com.dcim.repository.AssetRepository;
import com.dcim.repository.RackRepository;
import com.dcim.repository.RoomRepository;
import com.dcim.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SiteRepository siteRepository;
    private final RoomRepository roomRepository;
    private final RackRepository rackRepository;
    private final AssetRepository assetRepository;

    public DashboardDto.Summary getSummary() {
        DashboardDto.Summary summary = new DashboardDto.Summary();

        summary.setTotalSites(siteRepository.count());
        summary.setTotalRooms(roomRepository.count());
        summary.setTotalRacks(rackRepository.count());
        summary.setTotalAssets(assetRepository.count());
        summary.setActiveAssets(assetRepository.countByStatus(Asset.AssetStatus.ACTIVE));
        summary.setAssetsInMaintenance(assetRepository.countByStatus(Asset.AssetStatus.MAINTENANCE));

        LocalDate now = LocalDate.now();
        LocalDate cutoff = now.plusDays(90);
        summary.setExpiringWarrantiesCount((long) assetRepository.findExpiringWarranties(now, cutoff).size());

        // Rack utilization
        List<Rack> allRacks = rackRepository.findAllWithRoomAndSite();
        List<DashboardDto.RackUtilization> utilList = allRacks.stream().map(rack -> {
            List<Asset> assets = assetRepository.findByRackId(rack.getId());
            int usedU = assets.stream().mapToInt(a -> a.getUHeight() != null ? a.getUHeight() : 1).sum();
            int totalU = rack.getTotalU() != null ? rack.getTotalU() : 42;
            double pct = totalU > 0 ? (usedU * 100.0 / totalU) : 0;
            DashboardDto.RackUtilization util = new DashboardDto.RackUtilization();
            util.setRackId(rack.getId());
            util.setRackName(rack.getName());
            util.setRoomName(rack.getRoom() != null ? rack.getRoom().getName() : null);
            util.setSiteName(rack.getRoom() != null && rack.getRoom().getSite() != null
                    ? rack.getRoom().getSite().getName() : null);
            util.setTotalU(totalU);
            util.setUsedU(usedU);
            util.setUtilizationPct(Math.round(pct * 10.0) / 10.0);
            return util;
        }).collect(Collectors.toList());
        summary.setRackUtilization(utilList);

        // Assets by type
        List<Object[]> typeCounts = assetRepository.countByType();
        List<DashboardDto.AssetTypeCount> assetsByType = typeCounts.stream().map(row -> {
            DashboardDto.AssetTypeCount atc = new DashboardDto.AssetTypeCount();
            atc.setType(row[0].toString());
            atc.setCount((Long) row[1]);
            return atc;
        }).collect(Collectors.toList());
        summary.setAssetsByType(assetsByType);

        return summary;
    }
}
