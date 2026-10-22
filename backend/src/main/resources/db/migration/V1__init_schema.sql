-- V1: schema nền tảng cho Release 1 (tổ chức, người dùng, site, thiết bị).
-- Mọi bảng thuộc tenant đều có organization_id. Trạng thái dùng VARCHAR + CHECK (không dùng ENUM của PostgreSQL)
-- để dễ migrate về sau.

CREATE TABLE organizations (
    id          UUID PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(60)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    CONSTRAINT ux_organizations_slug UNIQUE (slug)
);

CREATE TABLE app_users (
    id               UUID PRIMARY KEY,
    organization_id  UUID         NOT NULL REFERENCES organizations (id),
    email            VARCHAR(254) NOT NULL,
    password_hash    VARCHAR(100) NOT NULL,
    display_name     VARCHAR(120) NOT NULL,
    role             VARCHAR(30)  NOT NULL,
    active           BOOLEAN      NOT NULL DEFAULT TRUE,
    version          BIGINT       NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ  NOT NULL,
    updated_at       TIMESTAMPTZ  NOT NULL,
    CONSTRAINT ck_app_users_role CHECK (role IN
        ('PLATFORM_ADMIN', 'ORG_ADMIN', 'NETWORK_OPERATOR', 'SECURITY_AUDITOR', 'VIEWER'))
);
CREATE UNIQUE INDEX ux_app_users_email ON app_users (lower(email));
CREATE INDEX ix_app_users_organization ON app_users (organization_id);

CREATE TABLE sites (
    id               UUID PRIMARY KEY,
    organization_id  UUID         NOT NULL REFERENCES organizations (id),
    name             VARCHAR(120) NOT NULL,
    city             VARCHAR(120),
    timezone         VARCHAR(64)  NOT NULL DEFAULT 'UTC',
    created_at       TIMESTAMPTZ  NOT NULL,
    updated_at       TIMESTAMPTZ  NOT NULL,
    CONSTRAINT ux_sites_org_name UNIQUE (organization_id, name),
    -- Cặp (id, organization_id) để bảng devices tham chiếu: DB tự chặn gán thiết bị vào site của tổ chức khác.
    CONSTRAINT ux_sites_id_org UNIQUE (id, organization_id)
);

CREATE TABLE devices (
    id                   UUID PRIMARY KEY,
    organization_id      UUID         NOT NULL REFERENCES organizations (id),
    site_id              UUID,
    serial_number        VARCHAR(64)  NOT NULL,
    name                 VARCHAR(120) NOT NULL,
    manufacturer         VARCHAR(80)  NOT NULL,
    model                VARCHAR(80)  NOT NULL,
    device_type          VARCHAR(20)  NOT NULL,
    firmware_version     VARCHAR(40),
    provisioning_status  VARCHAR(20)  NOT NULL DEFAULT 'REGISTERED',
    admin_status         VARCHAR(20)  NOT NULL DEFAULT 'ENABLED',
    connectivity_status  VARCHAR(20)  NOT NULL DEFAULT 'UNKNOWN',
    last_heartbeat_at    TIMESTAMPTZ,
    demo                 BOOLEAN      NOT NULL DEFAULT FALSE,
    version              BIGINT       NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ  NOT NULL,
    updated_at           TIMESTAMPTZ  NOT NULL,
    CONSTRAINT ux_devices_org_serial UNIQUE (organization_id, serial_number),
    CONSTRAINT fk_devices_site_same_org FOREIGN KEY (site_id, organization_id)
        REFERENCES sites (id, organization_id),
    CONSTRAINT ck_devices_type CHECK (device_type IN ('ROUTER', 'SWITCH', 'ACCESS_POINT', 'FIREWALL', 'OTHER')),
    CONSTRAINT ck_devices_provisioning CHECK (provisioning_status IN ('REGISTERED', 'PROVISIONED', 'DECOMMISSIONED')),
    CONSTRAINT ck_devices_admin CHECK (admin_status IN ('ENABLED', 'DISABLED')),
    CONSTRAINT ck_devices_connectivity CHECK (connectivity_status IN ('UNKNOWN', 'ONLINE', 'OFFLINE', 'DEGRADED'))
);
CREATE INDEX ix_devices_org_name ON devices (organization_id, name);
CREATE INDEX ix_devices_org_site ON devices (organization_id, site_id);
CREATE INDEX ix_devices_org_connectivity ON devices (organization_id, connectivity_status);
