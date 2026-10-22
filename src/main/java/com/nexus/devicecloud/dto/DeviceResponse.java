package com.nexus.devicecloud.dto;

import com.nexus.devicecloud.entity.AdminStatus;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import com.nexus.devicecloud.entity.Device;
import com.nexus.devicecloud.entity.DeviceType;
import com.nexus.devicecloud.entity.ProvisioningStatus;
import com.nexus.devicecloud.entity.Site;
import java.time.Instant;
import java.util.UUID;

/** Hợp đồng API của thiết bị. Entity không bao giờ được trả trực tiếp ra ngoài. */
public record DeviceResponse(
        UUID id,
        UUID siteId,
        String siteName,
        String serialNumber,
        String name,
        String manufacturer,
        String model,
        DeviceType deviceType,
        String firmwareVersion,
        ProvisioningStatus provisioningStatus,
        AdminStatus adminStatus,
        ConnectivityStatus connectivityStatus,
        Instant lastHeartbeatAt,
        boolean demo,
        Instant createdAt,
        Instant updatedAt,
        long version) {

    public static DeviceResponse from(Device device) {
        Site site = device.getSite();
        return new DeviceResponse(
                device.getId(),
                site == null ? null : site.getId(),
                site == null ? null : site.getName(),
                device.getSerialNumber(),
                device.getName(),
                device.getManufacturer(),
                device.getModel(),
                device.getDeviceType(),
                device.getFirmwareVersion(),
                device.getProvisioningStatus(),
                device.getAdminStatus(),
                device.getConnectivityStatus(),
                device.getLastHeartbeatAt(),
                device.isDemo(),
                device.getCreatedAt(),
                device.getUpdatedAt(),
                device.getVersion());
    }
}
