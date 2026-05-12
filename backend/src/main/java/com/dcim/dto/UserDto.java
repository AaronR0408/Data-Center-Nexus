package com.dcim.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

public class UserDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String username;
        private String role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String username;
        private String password;
        @NotBlank
        private String role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CurrentUser {
        private Long id;
        private String username;
        private String role;
    }
}
