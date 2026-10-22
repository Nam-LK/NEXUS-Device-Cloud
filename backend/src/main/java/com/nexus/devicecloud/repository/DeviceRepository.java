package com.nexus.devicecloud.repository;

import com.nexus.devicecloud.entity.AdminStatus;
import com.nexus.devicecloud.entity.ConnectivityStatus;
import com.nexus.devicecloud.entity.Device;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/** Mọi phương thức truy vấn đều nhận organizationId: không có cách tìm thiết bị "xuyên tenant". */
public interface DeviceRepository extends JpaRepository<Device, UUID>, JpaSpecificationExecutor<Device> {

    @Override
    @EntityGraph(attributePaths = "site")
    Page<Device> findAll(Specification<Device> spec, Pageable pageable);

    Optional<Device> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationIdAndSerialNumber(UUID organizationId, String serialNumber);

    long countByOrganizationId(UUID organizationId);

    long countByOrganizationIdAndDemoTrue(UUID organizationId);

    long countByOrganizationIdAndConnectivityStatus(UUID organizationId, ConnectivityStatus status);

    long countByOrganizationIdAndAdminStatus(UUID organizationId, AdminStatus status);
}
