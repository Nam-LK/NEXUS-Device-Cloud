package com.nexus.devicecloud.entity;

/** Vai trò của người dùng. Quyền thật sự được kiểm tra ở backend (@PreAuthorize), không phải ở giao diện. */
public enum Role {
    PLATFORM_ADMIN,
    ORG_ADMIN,
    NETWORK_OPERATOR,
    SECURITY_AUDITOR,
    VIEWER
}
