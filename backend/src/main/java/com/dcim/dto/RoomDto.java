package com.dcim.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

public class RoomDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String floor;
        private Long siteId;
        private String siteName;
        private String createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String name;
        private String floor;
    }
}
