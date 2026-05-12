package com.dcim.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

public class IncidentDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private String severity;
        private String status;
        private Long assetId;
        private String assetName;
        private String assignedTo;
        private String createdBy;
        private String createdAt;
        private String updatedAt;
        private String resolvedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String title;
        private String description;
        private String severity;
        private String status;
        private Long assetId;
        private String assignedTo;
    }
}
