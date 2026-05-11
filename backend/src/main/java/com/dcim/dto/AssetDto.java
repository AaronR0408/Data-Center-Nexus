package com.dcim.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class AssetDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String type;
        private String manufacturer;
        private String model;
        private String serialNumber;
        private String assetTag;
        private Long rackId;
        private String rackName;
        private Integer uPosition;
        private Integer uHeight;
        private String status;
        private String installDate;
        private String warrantyExpiration;
        private String createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String name;
        @NotBlank
        private String type;
        private String manufacturer;
        private String model;
        private String serialNumber;
        private String assetTag;
        @NotNull
        private Long rackId;
        @NotNull
        @Min(1)
        private Integer uPosition;
        @NotNull
        @Min(1)
        private Integer uHeight;
        private String status;
        private String installDate;
        private String warrantyExpiration;
    }
}
