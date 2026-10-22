package com.nexus.devicecloud.repository;

import com.nexus.devicecloud.entity.Site;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteRepository extends JpaRepository<Site, UUID> {

    List<Site> findByOrganizationIdOrderByNameAsc(UUID organizationId);

    Optional<Site> findByIdAndOrganizationId(UUID id, UUID organizationId);

    long countByOrganizationId(UUID organizationId);
}
