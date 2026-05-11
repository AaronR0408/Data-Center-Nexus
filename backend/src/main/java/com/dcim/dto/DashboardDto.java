package com.dcim.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

public class DashboardDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Summary {
        private Long totalAssets;
        private Long totalRacks;
        private Long totalSites;
        private Long totalRooms;
        private Long activeAssets;
        private Long assetsInMaintenance;
        private Long expiringWarrantiesCount;
        private List<RackUtilization> rackUtilization;
        private List<AssetTypeCount> assetsByType;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RackUtilization {
        private Long rackId;
        private String rackName;
        private String roomName;
        private String siteName;
        private Integer totalU;
        private Integer usedU;
        private Double utilizationPct;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AssetTypeCount {
        private String type;
        private Long count;
    }
}
