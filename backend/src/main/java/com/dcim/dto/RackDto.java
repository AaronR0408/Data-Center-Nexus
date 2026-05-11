package com.dcim.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

public class RackDto {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private Long roomId;
        private String roomName;
        private Integer totalU;
        private Integer usedU;
        private String description;
        private String createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String name;
        private Integer totalU;
        private String description;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SlotView {
        private Integer uPosition;
        private Boolean occupied;
        private AssetDto.Response asset;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RackView {
        private Response rack;
        private java.util.List<SlotView> slots;
    }
}
