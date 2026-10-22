package com.nexus.devicecloud.dto;

import com.nexus.devicecloud.entity.AdminStatus;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import java.util.Map;

/** Số liệu tổng hợp thiết bị của một tổ chức, phục vụ dashboard. */
public record DeviceCounts(
        long total,
        long demo,
        Map<ConnectivityStatus, Long> byConnectivity,
        Map<AdminStatus, Long> byAdminStatus) {
}
