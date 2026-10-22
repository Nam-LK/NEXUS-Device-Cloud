package com.nexus.devicecloud.entity;

import com.nexus.devicecloud.exception.ConflictException;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DeviceTest {

    private Device newDevice() {
        return Device.register(UUID.randomUUID(), null, "SN-1", "Router 1", "NEXUS Labs", "NX-R100",
                DeviceType.ROUTER, "1.0.0");
    }

    @Test
    void newDeviceStartsRegisteredEnabledAndUnknown() {
        Device device = newDevice();

        assertEquals(ProvisioningStatus.REGISTERED, device.getProvisioningStatus());
        assertEquals(AdminStatus.ENABLED, device.getAdminStatus());
        assertEquals(ConnectivityStatus.UNKNOWN, device.getConnectivityStatus());
        assertFalse(device.isDemo());
    }

    @Test
    void deactivateAndActivateAreIdempotent() {
        Device device = newDevice();

        assertTrue(device.deactivate());
        assertFalse(device.deactivate(), "second deactivate must be a no-op");
        assertEquals(AdminStatus.DISABLED, device.getAdminStatus());

        assertTrue(device.activate());
        assertFalse(device.activate(), "second activate must be a no-op");
        assertEquals(AdminStatus.ENABLED, device.getAdminStatus());
    }

    @Test
    void deactivatingDoesNotChangeConnectivity() {
        Device device = newDevice();
        device.applyDemoSnapshot(ProvisioningStatus.PROVISIONED, ConnectivityStatus.ONLINE, Instant.now());

        device.deactivate();

        assertEquals(ConnectivityStatus.ONLINE, device.getConnectivityStatus());
    }

    @Test
    void decommissionedDeviceCannotBeActivated() {
        Device device = newDevice();
        device.applyDemoSnapshot(ProvisioningStatus.DECOMMISSIONED, ConnectivityStatus.OFFLINE, null);
        device.deactivate();

        assertThrows(ConflictException.class, device::activate);
    }
}
