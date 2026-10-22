package com.nexus.devicecloud.security;

import com.nexus.devicecloud.entity.Role;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Người dùng đã xác thực, lưu trong session. Mang theo organizationId để mọi truy vấn
 * dữ liệu được giới hạn theo tenant. Mật khẩu băm bị xóa khỏi bộ nhớ sau khi xác thực.
 */
public final class NexusPrincipal implements UserDetails, CredentialsContainer {

    private static final long serialVersionUID = 1L;

    private final UUID userId;
    private final UUID organizationId;
    private final String organizationName;
    private final String email;
    private final String displayName;
    private final Role role;
    private final boolean active;
    private String passwordHash;

    public NexusPrincipal(
            UUID userId,
            UUID organizationId,
            String organizationName,
            String email,
            String displayName,
            Role role,
            boolean active,
            String passwordHash) {
        this.userId = userId;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
        this.active = active;
        this.passwordHash = passwordHash;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Role getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    @Override
    public void eraseCredentials() {
        this.passwordHash = null;
    }
}
