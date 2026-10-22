package com.nexus.devicecloud.dto;

import com.nexus.devicecloud.entity.Role;
import com.nexus.devicecloud.security.NexusPrincipal;
import java.util.UUID;

public record CurrentUserResponse(
        UUID id, String email, String displayName, Role role, UUID organizationId, String organizationName) {

    public static CurrentUserResponse from(NexusPrincipal principal) {
        return new CurrentUserResponse(
                principal.getUserId(),
                principal.getEmail(),
                principal.getDisplayName(),
                principal.getRole(),
                principal.getOrganizationId(),
                principal.getOrganizationName());
    }
}
