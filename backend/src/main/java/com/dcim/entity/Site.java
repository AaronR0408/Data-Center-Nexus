package com.dcim.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 500)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Room> rooms;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
