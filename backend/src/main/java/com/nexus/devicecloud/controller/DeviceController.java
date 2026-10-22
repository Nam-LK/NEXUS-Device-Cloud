package com.nexus.devicecloud.controller;

import com.nexus.devicecloud.dto.CreateDeviceRequest;
import com.nexus.devicecloud.dto.DeviceResponse;
import com.nexus.devicecloud.dto.DeviceSearchCriteria;
import com.nexus.devicecloud.dto.PageResponse;
import com.nexus.devicecloud.dto.UpdateDeviceRequest;
import com.nexus.devicecloud.entity.AdminStatus;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import com.nexus.devicecloud.service.DeviceService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping
    public PageResponse<DeviceResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID siteId,
            @RequestParam(required = false) ConnectivityStatus connectivity,
            @RequestParam(required = false) AdminStatus adminStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return deviceService.search(
                new DeviceSearchCriteria(q, siteId, connectivity, adminStatus), page, size, sortBy, direction);
    }

    @PostMapping
    public ResponseEntity<DeviceResponse> create(@Valid @RequestBody CreateDeviceRequest request) {
        DeviceResponse created = deviceService.register(request);
        return ResponseEntity.created(URI.create("/api/v1/devices/" + created.id())).body(created);
    }

    @GetMapping("/{deviceId}")
    public DeviceResponse get(@PathVariable UUID deviceId) {
        return deviceService.get(deviceId);
    }

    @PatchMapping("/{deviceId}")
    public DeviceResponse update(@PathVariable UUID deviceId, @Valid @RequestBody UpdateDeviceRequest request) {
        return deviceService.update(deviceId, request);
    }

    @PostMapping("/{deviceId}/activation")
    public DeviceResponse activate(@PathVariable UUID deviceId) {
        return deviceService.activate(deviceId);
    }

    @PostMapping("/{deviceId}/deactivation")
    public DeviceResponse deactivate(@PathVariable UUID deviceId) {
        return deviceService.deactivate(deviceId);
    }
}
