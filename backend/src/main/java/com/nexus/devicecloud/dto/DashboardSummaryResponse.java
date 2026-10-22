package com.nexus.devicecloud.dto;

import com.nexus.devicecloud.entity.AdminStatus;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import java.time.Instant;
import java.util.Map;

public record DashboardSummaryResponse(
        long totalDevices,
        long demoDevices,
        long siteCount,
        Map<ConnectivityStatus, Long> connectivity,
        Map<AdminStatus, Long> adminStatus,
        boolean includesDemoData,
        Instant generatedAt) {
}
