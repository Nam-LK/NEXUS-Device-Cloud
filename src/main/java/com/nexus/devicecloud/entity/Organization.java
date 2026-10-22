package com.nexus.devicecloud.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

/** Tenant: ranh giới cô lập dữ liệu. Mọi dữ liệu nghiệp vụ thuộc về đúng một tổ chức. */
@Entity
@Table(name = "organizations")
public class Organization extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 60)
    private String slug;

    protected Organization() {
        // JPA
    }

    public Organization(String name, String slug) {
        this.name = name;
        this.slug = slug;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }
}
