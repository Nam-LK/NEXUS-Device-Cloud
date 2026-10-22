package com.nexus.devicecloud.dto;

import com.nexus.devicecloud.entity.Site;
import java.util.UUID;

public record SiteResponse(UUID id, String name, String city, String timezone) {

    public static SiteResponse from(Site site) {
        return new SiteResponse(site.getId(), site.getName(), site.getCity(), site.getTimezone());
    }
}
