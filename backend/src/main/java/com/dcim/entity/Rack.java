package com.dcim.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "racks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "total_u", nullable = false)
    private Integer totalU = 42;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "rack", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Asset> assets;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (totalU == null) totalU = 42;
    }
}
