package com.dcim.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

public class SiteDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String address;
        private String city;
        private String country;
        private String createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String name;
        private String address;
        @NotBlank
        private String city;
        @NotBlank
        private String country;
    }
}
