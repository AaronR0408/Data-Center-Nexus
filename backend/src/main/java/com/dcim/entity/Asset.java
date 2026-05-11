package com.dcim.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AssetType type;

    @Column(length = 255)
    private String manufacturer;

    @Column(length = 255)
    private String model;

    @Column(name = "serial_number", length = 255, unique = true)
    private String serialNumber;

    @Column(name = "asset_tag", length = 255, unique = true)
    private String assetTag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rack_id", nullable = false)
    private Rack rack;

    @Column(name = "u_position", nullable = false)
    private Integer uPosition;

    @Column(name = "u_height", nullable = false)
    private Integer uHeight = 1;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AssetStatus status = AssetStatus.ACTIVE;

    @Column(name = "install_date")
    private LocalDate installDate;

    @Column(name = "warranty_expiration")
    private LocalDate warrantyExpiration;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = AssetStatus.ACTIVE;
        if (uHeight == null) uHeight = 1;
    }

    public enum AssetType {
        SERVER, SWITCH, PDU, UPS, STORAGE, OTHER
    }

    public enum AssetStatus {
        ACTIVE, INACTIVE, MAINTENANCE
    }
}
