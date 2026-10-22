package com.nexus.devicecloud.service;

import com.nexus.devicecloud.dto.CreateDeviceRequest;
import com.nexus.devicecloud.dto.DeviceResponse;
import com.nexus.devicecloud.dto.DeviceSearchCriteria;
import com.nexus.devicecloud.dto.UpdateDeviceRequest;
import com.nexus.devicecloud.entity.AdminStatus;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import com.nexus.devicecloud.entity.Device;
import com.nexus.devicecloud.entity.DeviceType;
import com.nexus.devicecloud.exception.BadRequestException;
import com.nexus.devicecloud.exception.ConflictException;
import com.nexus.devicecloud.exception.NotFoundException;
import com.nexus.devicecloud.repository.DeviceRepository;
import com.nexus.devicecloud.repository.SiteRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeviceServiceTest {

    @Mock
    private DeviceRepository devices;
    @Mock
    private SiteRepository sites;
    @Mock
    private CurrentUserProvider currentUser;

    private DeviceService service;
    private final UUID organizationId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        lenient().when(currentUser.organizationId()).thenReturn(organizationId);
        service = new DeviceService(devices, sites, currentUser);
    }

    private CreateDeviceRequest request(String serial, UUID siteId) {
        return new CreateDeviceRequest(" Router 1 ", serial, "NEXUS Labs", "NX-R100", DeviceType.ROUTER, siteId, "  ");
    }

    @Test
    void registerNormalizesSerialAndStartsInSafeDefaultStates() {
        when(devices.saveAndFlush(any(Device.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeviceResponse response = service.register(request(" sn-1 ", null));

        assertEquals("SN-1", response.serialNumber());
        assertEquals("Router 1", response.name());
        assertEquals(ConnectivityStatus.UNKNOWN, response.connectivityStatus());
        assertEquals(AdminStatus.ENABLED, response.adminStatus());
        assertEquals(null, response.firmwareVersion(), "blank firmware must be stored as null");
    }

    @Test
    void registerRejectsDuplicateSerialWithinOrganization() {
        when(devices.existsByOrganizationIdAndSerialNumber(organizationId, "SN-1")).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.register(request("sn-1", null)));
        verify(devices, never()).saveAndFlush(any());
    }

    @Test
    void registerRejectsSiteFromAnotherOrganization() {
        UUID foreignSiteId = UUID.randomUUID();
        // Repository is queried with the caller's organization, so a foreign site is "not found".
        when(sites.findByIdAndOrganizationId(foreignSiteId, organizationId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.register(request("SN-2", foreignSiteId)));
        verify(devices, never()).saveAndFlush(any());
    }

    @Test
    void getReturnsNotFoundForDeviceOutsideCallerOrganization() {
        UUID deviceId = UUID.randomUUID();
        when(devices.findByIdAndOrganizationId(deviceId, organizationId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.get(deviceId));
    }

    @Test
    void updateRejectsStaleVersion() {
        UUID deviceId = UUID.randomUUID();
        Device existing = Device.register(organizationId, null, "SN-1", "Old", "NEXUS Labs", "NX-R100",
                DeviceType.ROUTER, null);
        when(devices.findByIdAndOrganizationId(deviceId, organizationId)).thenReturn(Optional.of(existing));

        UpdateDeviceRequest stale = new UpdateDeviceRequest(existing.getVersion() + 5, "New", null);

        assertThrows(ConflictException.class, () -> service.update(deviceId, stale));
        verify(devices, never()).saveAndFlush(any());
    }

    @Test
    void updateAppliesNameWhenVersionMatches() {
        UUID deviceId = UUID.randomUUID();
        Device existing = Device.register(organizationId, null, "SN-1", "Old", "NEXUS Labs", "NX-R100",
                DeviceType.ROUTER, null);
        when(devices.findByIdAndOrganizationId(deviceId, organizationId)).thenReturn(Optional.of(existing));
        when(devices.saveAndFlush(existing)).thenReturn(existing);

        DeviceResponse response = service.update(deviceId, new UpdateDeviceRequest(existing.getVersion(), " New ", null));

        assertEquals("New", response.name());
    }

    @Test
    void searchRejectsUnknownSortField() {
        assertThrows(BadRequestException.class, () -> service.search(
                new DeviceSearchCriteria(null, null, null, null), 0, 20, "passwordHash", "asc"));
    }

    @Test
    void searchRejectsUnknownDirection() {
        assertThrows(BadRequestException.class, () -> service.search(
                new DeviceSearchCriteria(null, null, null, null), 0, 20, "name", "sideways"));
    }
}
