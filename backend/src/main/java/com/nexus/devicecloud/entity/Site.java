package com.nexus.devicecloud.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

/** Địa điểm vật lý (chi nhánh, văn phòng) của một tổ chức. */
@Entity
@Table(name = "sites")
public class Site extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 120)
    private String city;

    @Column(nullable = false, length = 64)
    private String timezone;

    protected Site() {
        // JPA
    }

    public Site(UUID organizationId, String name, String city, String timezone) {
        this.organizationId = organizationId;
        this.name = name;
        this.city = city;
        this.timezone = timezone;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public String getName() {
        return name;
    }

    public String getCity() {
        return city;
    }

    public String getTimezone() {
        return timezone;
    }
}
