package com.nexus.devicecloud.dto;

import com.nexus.devicecloud.entity.DeviceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateDeviceRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 64)
        @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "may contain only letters, digits, '.', '_' and '-'")
        String serialNumber,
        @NotBlank @Size(max = 80) String manufacturer,
        @NotBlank @Size(max = 80) String model,
        @NotNull DeviceType deviceType,
        UUID siteId,
        @Size(max = 40) String firmwareVersion) {
}
