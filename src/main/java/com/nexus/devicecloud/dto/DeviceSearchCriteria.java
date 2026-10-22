package com.nexus.devicecloud.dto;

import com.nexus.devicecloud.entity.AdminStatus;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import java.util.UUID;

public record DeviceSearchCriteria(String q, UUID siteId, ConnectivityStatus connectivity, AdminStatus adminStatus) {
}
