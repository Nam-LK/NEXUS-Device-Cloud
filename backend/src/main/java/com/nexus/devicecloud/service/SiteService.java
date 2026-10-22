package com.nexus.devicecloud.service;

import com.nexus.devicecloud.dto.SiteResponse;
import com.nexus.devicecloud.repository.SiteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SiteService {

    private final SiteRepository sites;
    private final CurrentUserProvider currentUser;

    public SiteService(SiteRepository sites, CurrentUserProvider currentUser) {
        this.sites = sites;
        this.currentUser = currentUser;
    }

    /** Chỉ trả về site của tổ chức đang đăng nhập (tenant isolation). */
    @Transactional(readOnly = true)
    public List<SiteResponse> listForCurrentOrganization() {
        return sites.findByOrganizationIdOrderByNameAsc(currentUser.organizationId()).stream()
                .map(SiteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countForCurrentOrganization() {
        return sites.countByOrganizationId(currentUser.organizationId());
    }
}
