package com.nexus.devicecloud.entity;

import com.nexus.devicecloud.exception.ConflictException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;

/**
 * Thiết bị mạng. Bốn trục trạng thái tách biệt: cấp phát, quản trị, kết nối, firmware.
 * Quy tắc nghiệp vụ nằm trong entity để không bị lặp ở các tầng khác.
 */
@Entity
@Table(name = "devices")
public class Device extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;

    @Column(name = "serial_number", nullable = false, length = 64)
    private String serialNumber;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 80)
    private String manufacturer;

    @Column(nullable = false, length = 80)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false, length = 20)
    private DeviceType deviceType;

    @Column(name = "firmware_version", length = 40)
    private String firmwareVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "provisioning_status", nullable = false, length = 20)
    private ProvisioningStatus provisioningStatus = ProvisioningStatus.REGISTERED;

    @Enumerated(EnumType.STRING)
    @Column(name = "admin_status", nullable = false, length = 20)
    private AdminStatus adminStatus = AdminStatus.ENABLED;

    @Enumerated(EnumType.STRING)
    @Column(name = "connectivity_status", nullable = false, length = 20)
    private ConnectivityStatus connectivityStatus = ConnectivityStatus.UNKNOWN;

    @Column(name = "last_heartbeat_at")
    private Instant lastHeartbeatAt;

    @Column(nullable = false)
    private boolean demo;

    @Version
    @Column(nullable = false)
    private long version;

    protected Device() {
        // JPA
    }

    public static Device register(
            UUID organizationId,
            Site site,
            String serialNumber,
            String name,
            String manufacturer,
            String model,
            DeviceType deviceType,
            String firmwareVersion) {
        Device device = new Device();
        device.organizationId = organizationId;
        device.site = site;
        device.serialNumber = serialNumber;
        device.name = name;
        device.manufacturer = manufacturer;
        device.model = model;
        device.deviceType = deviceType;
        device.firmwareVersion = firmwareVersion;
        return device;
    }

    /** Dữ liệu demo: trạng thái do seeder gán, KHÔNG phải đo đạc thật. Đánh dấu demo=true. */
    public void applyDemoSnapshot(
            ProvisioningStatus provisioning, ConnectivityStatus connectivity, Instant lastHeartbeat) {
        this.demo = true;
        this.provisioningStatus = provisioning;
        this.connectivityStatus = connectivity;
        this.lastHeartbeatAt = lastHeartbeat;
    }

    public void rename(String newName) {
        this.name = newName;
    }

    public void assignToSite(Site newSite) {
        this.site = newSite;
    }

    /** Idempotent: kích hoạt thiết bị đang ENABLED không đổi gì. Thiết bị đã DECOMMISSIONED không thể kích hoạt lại. */
    public boolean activate() {
        if (provisioningStatus == ProvisioningStatus.DECOMMISSIONED) {
            throw new ConflictException("A decommissioned device cannot be activated.");
        }
        if (adminStatus == AdminStatus.ENABLED) {
            return false;
        }
        adminStatus = AdminStatus.ENABLED;
        return true;
    }

    /** Idempotent. Trả về true nếu trạng thái thực sự thay đổi. */
    public boolean deactivate() {
        if (adminStatus == AdminStatus.DISABLED) {
            return false;
        }
        adminStatus = AdminStatus.DISABLED;
        return true;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public Site getSite() {
        return site;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getName() {
        return name;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public String getModel() {
        return model;
    }

    public DeviceType getDeviceType() {
        return deviceType;
    }

    public String getFirmwareVersion() {
        return firmwareVersion;
    }

    public ProvisioningStatus getProvisioningStatus() {
        return provisioningStatus;
    }

    public AdminStatus getAdminStatus() {
        return adminStatus;
    }

    public ConnectivityStatus getConnectivityStatus() {
        return connectivityStatus;
    }

    public Instant getLastHeartbeatAt() {
        return lastHeartbeatAt;
    }

    public boolean isDemo() {
        return demo;
    }

    public long getVersion() {
        return version;
    }
}
