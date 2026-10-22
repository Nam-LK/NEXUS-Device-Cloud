package com.nexus.devicecloud.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/** PATCH: trường null nghĩa là "giữ nguyên". version bắt buộc để phát hiện sửa đồng thời (optimistic locking). */
public record UpdateDeviceRequest(
        @NotNull Long version,
        @Size(max = 120) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String name,
        UUID siteId) {
}
