package com.nexus.devicecloud.service;

import com.nexus.devicecloud.dto.CreateDeviceRequest;
import com.nexus.devicecloud.dto.DeviceCounts;
import com.nexus.devicecloud.dto.DeviceResponse;
import com.nexus.devicecloud.dto.DeviceSearchCriteria;
import com.nexus.devicecloud.dto.PageResponse;
import com.nexus.devicecloud.dto.UpdateDeviceRequest;
import com.nexus.devicecloud.entity.AdminStatus;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import com.nexus.devicecloud.entity.Device;
import com.nexus.devicecloud.entity.Site;
import com.nexus.devicecloud.exception.BadRequestException;
import com.nexus.devicecloud.exception.ConflictException;
import com.nexus.devicecloud.exception.NotFoundException;
import com.nexus.devicecloud.repository.DeviceRepository;
import com.nexus.devicecloud.repository.DeviceSpecifications;
import com.nexus.devicecloud.repository.SiteRepository;
import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Use case của thiết bị. organizationId luôn lấy từ session (CurrentUserProvider), không nhận từ client.
 * Thiết bị hoặc site của tổ chức khác được coi như "không tồn tại" (404) để không lộ sự tồn tại của dữ liệu.
 */
@Service
public class DeviceService {

    private static final String CAN_WRITE = "hasAnyRole('PLATFORM_ADMIN','ORG_ADMIN','NETWORK_OPERATOR')";
    private static final int MAX_PAGE_SIZE = 100;
    private static final Map<String, String> SORTABLE_FIELDS = Map.of(
            "name", "name",
            "serialNumber", "serialNumber",
            "createdAt", "createdAt",
            "connectivityStatus", "connectivityStatus",
            "lastHeartbeatAt", "lastHeartbeatAt");

    private final DeviceRepository devices;
    private final SiteRepository sites;
    private final CurrentUserProvider currentUser;

    public DeviceService(DeviceRepository devices, SiteRepository sites, CurrentUserProvider currentUser) {
        this.devices = devices;
        this.sites = sites;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public PageResponse<DeviceResponse> search(
            DeviceSearchCriteria criteria, int page, int size, String sortBy, String direction) {
        UUID organizationId = currentUser.organizationId();
        Pageable pageable = PageRequest.of(
                Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE), buildSort(sortBy, direction));
        return PageResponse.from(
                devices.findAll(DeviceSpecifications.matching(organizationId, criteria), pageable)
                        .map(DeviceResponse::from));
    }

    @Transactional(readOnly = true)
    public DeviceResponse get(UUID deviceId) {
        return DeviceResponse.from(load(deviceId));
    }

    @PreAuthorize(CAN_WRITE)
    @Transactional
    public DeviceResponse register(CreateDeviceRequest request) {
        UUID organizationId = currentUser.organizationId();
        String serialNumber = request.serialNumber().trim().toUpperCase(Locale.ROOT);

        if (devices.existsByOrganizationIdAndSerialNumber(organizationId, serialNumber)) {
            throw new ConflictException("A device with serial number " + serialNumber + " already exists.");
        }
        Site site = request.siteId() == null ? null : findSite(request.siteId(), organizationId);

        Device device = Device.register(
                organizationId,
                site,
                serialNumber,
                request.name().trim(),
                request.manufacturer().trim(),
                request.model().trim(),
                request.deviceType(),
                blankToNull(request.firmwareVersion()));
        return DeviceResponse.from(devices.saveAndFlush(device));
    }

    @PreAuthorize(CAN_WRITE)
    @Transactional
    public DeviceResponse update(UUID deviceId, UpdateDeviceRequest request) {
        UUID organizationId = currentUser.organizationId();
        Device device = load(deviceId);
        if (request.version() != device.getVersion()) {
            throw new ConflictException("The device was modified by someone else. Reload it and try again.");
        }
        if (request.name() != null) {
            device.rename(request.name().trim());
        }
        if (request.siteId() != null) {
            device.assignToSite(findSite(request.siteId(), organizationId));
        }
        return DeviceResponse.from(devices.saveAndFlush(device));
    }

    @PreAuthorize(CAN_WRITE)
    @Transactional
    public DeviceResponse activate(UUID deviceId) {
        Device device = load(deviceId);
        if (device.activate()) {
            devices.saveAndFlush(device);
        }
        return DeviceResponse.from(device);
    }

    @PreAuthorize(CAN_WRITE)
    @Transactional
    public DeviceResponse deactivate(UUID deviceId) {
        Device device = load(deviceId);
        if (device.deactivate()) {
            devices.saveAndFlush(device);
        }
        return DeviceResponse.from(device);
    }

    @Transactional(readOnly = true)
    public DeviceCounts countsForCurrentOrganization() {
        UUID organizationId = currentUser.organizationId();
        Map<ConnectivityStatus, Long> byConnectivity = new EnumMap<>(ConnectivityStatus.class);
        for (ConnectivityStatus status : ConnectivityStatus.values()) {
            byConnectivity.put(status, devices.countByOrganizationIdAndConnectivityStatus(organizationId, status));
        }
        Map<AdminStatus, Long> byAdminStatus = new EnumMap<>(AdminStatus.class);
        for (AdminStatus status : AdminStatus.values()) {
            byAdminStatus.put(status, devices.countByOrganizationIdAndAdminStatus(organizationId, status));
        }
        return new DeviceCounts(
                devices.countByOrganizationId(organizationId),
                devices.countByOrganizationIdAndDemoTrue(organizationId),
                byConnectivity,
                byAdminStatus);
    }

    private Device load(UUID deviceId) {
        return devices.findByIdAndOrganizationId(deviceId, currentUser.organizationId())
                .orElseThrow(() -> new NotFoundException("Device not found."));
    }

    private Site findSite(UUID siteId, UUID organizationId) {
        return sites.findByIdAndOrganizationId(siteId, organizationId)
                .orElseThrow(() -> new NotFoundException("Site not found."));
    }

    private static Sort buildSort(String sortBy, String direction) {
        String property = SORTABLE_FIELDS.get(sortBy);
        if (property == null) {
            throw new BadRequestException("sortBy must be one of " + SORTABLE_FIELDS.keySet());
        }
        Sort.Direction dir;
        if ("asc".equalsIgnoreCase(direction)) {
            dir = Sort.Direction.ASC;
        } else if ("desc".equalsIgnoreCase(direction)) {
            dir = Sort.Direction.DESC;
        } else {
            throw new BadRequestException("direction must be 'asc' or 'desc'.");
        }
        // Sắp xếp phụ theo id để phân trang ổn định khi giá trị sort trùng nhau.
        return Sort.by(dir, property).and(Sort.by(Sort.Direction.ASC, "id"));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
