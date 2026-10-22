package com.nexus.devicecloud.controller;

import com.nexus.devicecloud.dto.SiteResponse;
import com.nexus.devicecloud.service.SiteService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sites")
public class SiteController {

    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    @GetMapping
    public List<SiteResponse> list() {
        return siteService.listForCurrentOrganization();
    }
}
