package com.nexus.devicecloud.service;

import com.nexus.devicecloud.dto.DashboardSummaryResponse;
import com.nexus.devicecloud.dto.DeviceCounts;
import java.time.Instant;
import org.springframework.stereotype.Service;

/** Ghép số liệu từ các module qua interface công khai của chúng (không truy cập repository của module khác). */
@Service
public class DashboardService {

    private final DeviceService deviceService;
    private final SiteService siteService;

    public DashboardService(DeviceService deviceService, SiteService siteService) {
        this.deviceService = deviceService;
        this.siteService = siteService;
    }

    public DashboardSummaryResponse summary() {
        DeviceCounts counts = deviceService.countsForCurrentOrganization();
        return new DashboardSummaryResponse(
                counts.total(),
                counts.demo(),
                siteService.countForCurrentOrganization(),
                counts.byConnectivity(),
                counts.byAdminStatus(),
                counts.demo() > 0,
                Instant.now());
    }
}
