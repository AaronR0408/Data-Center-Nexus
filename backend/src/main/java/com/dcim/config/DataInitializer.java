package com.dcim.config;

import com.dcim.entity.*;
import com.dcim.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final SiteRepository siteRepository;
    private final RoomRepository roomRepository;
    private final RackRepository rackRepository;
    private final AssetRepository assetRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedUsers();
        }
        if (siteRepository.count() == 0) {
            seedDemoData();
        }
    }

    private void seedUsers() {
        log.info("Seeding default users...");
        AppUser admin = new AppUser();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        userRepository.save(admin);

        AppUser user = new AppUser();
        user.setUsername("noc");
        user.setPassword(passwordEncoder.encode("noc123"));
        user.setRole("USER");
        userRepository.save(user);
        log.info("Default users created: admin/admin123, noc/noc123");
    }

    private void seedDemoData() {
        log.info("Seeding demo data...");

        // Site 1
        Site site1 = new Site();
        site1.setName("NYC-DC1");
        site1.setAddress("123 Broadway");
        site1.setCity("New York");
        site1.setCountry("USA");
        site1 = siteRepository.save(site1);

        // Site 2
        Site site2 = new Site();
        site2.setName("LAX-DC2");
        site2.setAddress("456 Sunset Blvd");
        site2.setCity("Los Angeles");
        site2.setCountry("USA");
        site2 = siteRepository.save(site2);

        // Rooms
        Room room1 = new Room();
        room1.setName("Server Room A");
        room1.setFloor("3rd Floor");
        room1.setSite(site1);
        room1 = roomRepository.save(room1);

        Room room2 = new Room();
        room2.setName("Network Room B");
        room2.setFloor("2nd Floor");
        room2.setSite(site1);
        room2 = roomRepository.save(room2);

        Room room3 = new Room();
        room3.setName("Main DC Floor");
        room3.setFloor("1st Floor");
        room3.setSite(site2);
        room3 = roomRepository.save(room3);

        // Racks
        Rack rack1 = new Rack();
        rack1.setName("RACK-A01");
        rack1.setRoom(room1);
        rack1.setTotalU(42);
        rack1.setDescription("Primary compute rack");
        rack1 = rackRepository.save(rack1);

        Rack rack2 = new Rack();
        rack2.setName("RACK-A02");
        rack2.setRoom(room1);
        rack2.setTotalU(42);
        rack2.setDescription("Secondary compute rack");
        rack2 = rackRepository.save(rack2);

        Rack rack3 = new Rack();
        rack3.setName("RACK-B01");
        rack3.setRoom(room2);
        rack3.setTotalU(42);
        rack3.setDescription("Network distribution rack");
        rack3 = rackRepository.save(rack3);

        Rack rack4 = new Rack();
        rack4.setName("RACK-LA01");
        rack4.setRoom(room3);
        rack4.setTotalU(48);
        rack4.setDescription("LAX primary rack");
        rack4 = rackRepository.save(rack4);

        // Assets in rack1
        createAsset("web-srv-01", Asset.AssetType.SERVER, "Dell", "PowerEdge R750", "SN-WEB01", "TAG-001",
                rack1, 40, 2, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2022, 3, 15), LocalDate.of(2025, 3, 15));

        createAsset("web-srv-02", Asset.AssetType.SERVER, "Dell", "PowerEdge R750", "SN-WEB02", "TAG-002",
                rack1, 38, 2, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2022, 3, 15), LocalDate.of(2025, 3, 15));

        createAsset("db-srv-01", Asset.AssetType.SERVER, "HP", "ProLiant DL380 Gen10", "SN-DB01", "TAG-003",
                rack1, 35, 2, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2021, 6, 1), LocalDate.of(2026, 6, 1));

        createAsset("pdu-rack-a01-top", Asset.AssetType.PDU, "APC", "AP8941", "SN-PDU01", "TAG-004",
                rack1, 42, 1, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2021, 1, 1), LocalDate.of(2026, 1, 1));

        // Assets in rack2
        createAsset("app-srv-01", Asset.AssetType.SERVER, "Cisco", "UCS C240 M5", "SN-APP01", "TAG-005",
                rack2, 40, 2, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2023, 1, 10), LocalDate.of(2026, 1, 10));

        createAsset("storage-01", Asset.AssetType.STORAGE, "NetApp", "AFF A400", "SN-STR01", "TAG-006",
                rack2, 35, 4, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2022, 8, 20), LocalDate.now().plusDays(45));

        createAsset("backup-srv-01", Asset.AssetType.SERVER, "HP", "ProLiant DL360 Gen10", "SN-BKP01", "TAG-007",
                rack2, 30, 1, Asset.AssetStatus.MAINTENANCE,
                LocalDate.of(2020, 5, 1), LocalDate.now().plusDays(20));

        // Assets in rack3 (network)
        createAsset("core-sw-01", Asset.AssetType.SWITCH, "Cisco", "Nexus 9336C-FX2", "SN-SW01", "TAG-008",
                rack3, 42, 1, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2022, 11, 1), LocalDate.of(2027, 11, 1));

        createAsset("core-sw-02", Asset.AssetType.SWITCH, "Cisco", "Nexus 9336C-FX2", "SN-SW02", "TAG-009",
                rack3, 41, 1, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2022, 11, 1), LocalDate.of(2027, 11, 1));

        createAsset("access-sw-01", Asset.AssetType.SWITCH, "Arista", "7050SX3-48YC12", "SN-SW03", "TAG-010",
                rack3, 38, 1, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2023, 3, 1), LocalDate.now().plusDays(60));

        // Assets in rack4 (LAX)
        createAsset("lax-srv-01", Asset.AssetType.SERVER, "Dell", "PowerEdge R640", "SN-LAX01", "TAG-011",
                rack4, 46, 2, Asset.AssetStatus.ACTIVE,
                LocalDate.of(2023, 7, 1), LocalDate.of(2026, 7, 1));

        createAsset("lax-sw-01", Asset.AssetType.SWITCH, "Juniper", "EX4300-48T", "SN-LAX02", "TAG-012",
                rack4, 44, 1, Asset.AssetStatus.INACTIVE,
                LocalDate.of(2021, 2, 1), LocalDate.of(2024, 2, 1));

        log.info("Demo data seeded successfully.");
    }

    private void createAsset(String name, Asset.AssetType type, String manufacturer, String model,
                              String serial, String tag, Rack rack, int uPos, int uHeight,
                              Asset.AssetStatus status, LocalDate installDate, LocalDate warrantyExp) {
        Asset asset = new Asset();
        asset.setName(name);
        asset.setType(type);
        asset.setManufacturer(manufacturer);
        asset.setModel(model);
        asset.setSerialNumber(serial);
        asset.setAssetTag(tag);
        asset.setRack(rack);
        asset.setUPosition(uPos);
        asset.setUHeight(uHeight);
        asset.setStatus(status);
        asset.setInstallDate(installDate);
        asset.setWarrantyExpiration(warrantyExp);
        assetRepository.save(asset);
    }
}
