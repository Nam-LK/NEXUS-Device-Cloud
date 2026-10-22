package com.nexus.devicecloud.config;

import com.nexus.devicecloud.entity.AppUser;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import com.nexus.devicecloud.entity.Device;
import com.nexus.devicecloud.entity.DeviceType;
import com.nexus.devicecloud.entity.Organization;
import com.nexus.devicecloud.entity.ProvisioningStatus;
import com.nexus.devicecloud.entity.Role;
import com.nexus.devicecloud.entity.Site;
import com.nexus.devicecloud.repository.DeviceRepository;
import com.nexus.devicecloud.repository.OrganizationRepository;
import com.nexus.devicecloud.repository.SiteRepository;
import com.nexus.devicecloud.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Nạp dữ liệu DEMO cho môi trường phát triển (chỉ khi NEXUS_SEED_ENABLED=true).
 * Thiết bị demo mang cờ demo=true và trạng thái kết nối là giá trị gán sẵn, không phải đo đạc thật.
 * Mật khẩu admin lấy từ biến môi trường, không nằm trong source code.
 */
@Component
@ConditionalOnProperty(prefix = "nexus.seed", name = "enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String DEMO_ORG_SLUG = "demo-org";
    private static final int MIN_PASSWORD_LENGTH = 12;

    private record DeviceSpec(
            String serial, String name, String model, DeviceType type, String firmware,
            int siteIndex, ConnectivityStatus connectivity, long heartbeatAgoSeconds) {
    }

    private static final List<DeviceSpec> DEVICES = List.of(
            new DeviceSpec("NX-0001", "HN-RTR-01", "NX-R100", DeviceType.ROUTER, "2.4.1", 0, ConnectivityStatus.ONLINE, 12),
            new DeviceSpec("NX-0002", "HN-SW-01", "NX-S24", DeviceType.SWITCH, "2.4.1", 0, ConnectivityStatus.ONLINE, 20),
            new DeviceSpec("NX-0003", "HN-AP-01", "NX-AP6", DeviceType.ACCESS_POINT, "2.3.9", 0, ConnectivityStatus.DEGRADED, 55),
            new DeviceSpec("NX-0004", "HN-FW-01", "NX-FW10", DeviceType.FIREWALL, "2.4.1", 0, ConnectivityStatus.ONLINE, 8),
            new DeviceSpec("NX-0005", "DN-RTR-01", "NX-R100", DeviceType.ROUTER, "2.4.0", 1, ConnectivityStatus.ONLINE, 15),
            new DeviceSpec("NX-0006", "DN-AP-01", "NX-AP6", DeviceType.ACCESS_POINT, "2.3.9", 1, ConnectivityStatus.OFFLINE, 7200),
            new DeviceSpec("NX-0007", "DN-AP-02", "NX-AP6", DeviceType.ACCESS_POINT, "2.3.9", 1, ConnectivityStatus.OFFLINE, 86400),
            new DeviceSpec("NX-0008", "DN-SW-01", "NX-S24", DeviceType.SWITCH, "2.4.0", 1, ConnectivityStatus.ONLINE, 31),
            new DeviceSpec("NX-0009", "SG-RTR-01", "NX-R100", DeviceType.ROUTER, "2.4.1", 2, ConnectivityStatus.ONLINE, 9),
            new DeviceSpec("NX-0010", "SG-AP-01", "NX-AP6", DeviceType.ACCESS_POINT, "2.4.1", 2, ConnectivityStatus.DEGRADED, 48),
            new DeviceSpec("NX-0011", "SG-FW-01", "NX-FW10", DeviceType.FIREWALL, "2.4.0", 2, ConnectivityStatus.ONLINE, 17),
            new DeviceSpec("NX-0012", "SG-SW-01", "NX-S24", DeviceType.SWITCH, "2.4.1", 2, ConnectivityStatus.UNKNOWN, -1));

    private final OrganizationRepository organizations;
    private final SiteRepository sites;
    private final UserRepository users;
    private final DeviceRepository devices;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DemoDataSeeder(
            OrganizationRepository organizations,
            SiteRepository sites,
            UserRepository users,
            DeviceRepository devices,
            PasswordEncoder passwordEncoder,
            @Value("${nexus.seed.admin-email}") String adminEmail,
            @Value("${nexus.seed.admin-password:}") String adminPassword) {
        this.organizations = organizations;
        this.sites = sites;
        this.users = users;
        this.devices = devices;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (organizations.findBySlug(DEMO_ORG_SLUG).isPresent()) {
            log.info("Demo data already present; skipping seed.");
            return;
        }
        if (adminPassword == null || adminPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException("NEXUS_SEED_ENABLED=true requires NEXUS_SEED_ADMIN_PASSWORD "
                    + "with at least " + MIN_PASSWORD_LENGTH + " characters. Run scripts/setup.ps1 to generate .env.");
        }

        Organization organization = organizations.save(new Organization("Demo Organization", DEMO_ORG_SLUG));
        users.save(new AppUser(
                organization, adminEmail, passwordEncoder.encode(adminPassword), "Demo Admin", Role.ORG_ADMIN));

        List<Site> createdSites = sites.saveAll(List.of(
                new Site(organization.getId(), "Hanoi HQ", "Hanoi", "Asia/Ho_Chi_Minh"),
                new Site(organization.getId(), "Da Nang Branch", "Da Nang", "Asia/Ho_Chi_Minh"),
                new Site(organization.getId(), "Ho Chi Minh City Branch", "Ho Chi Minh City", "Asia/Ho_Chi_Minh")));

        Instant now = Instant.now();
        List<Device> demoDevices = DEVICES.stream().map(spec -> {
            Device device = Device.register(
                    organization.getId(), createdSites.get(spec.siteIndex()), spec.serial(), spec.name(),
                    "NEXUS Labs", spec.model(), spec.type(), spec.firmware());
            Instant heartbeat = spec.heartbeatAgoSeconds() < 0 ? null : now.minusSeconds(spec.heartbeatAgoSeconds());
            device.applyDemoSnapshot(ProvisioningStatus.PROVISIONED, spec.connectivity(), heartbeat);
            return device;
        }).toList();
        devices.saveAll(demoDevices);

        log.info("Seeded demo organization '{}' with {} sites and {} DEMO devices; admin user {}.",
                DEMO_ORG_SLUG, createdSites.size(), demoDevices.size(), adminEmail);
    }
}
