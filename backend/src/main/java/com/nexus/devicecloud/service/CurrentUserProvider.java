package com.nexus.devicecloud.service;

import com.nexus.devicecloud.security.NexusPrincipal;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Điểm truy cập duy nhất tới "ai đang gọi và thuộc tổ chức nào". Các module khác dùng lớp này
 * để lấy organizationId đáng tin cậy từ session, không bao giờ nhận organizationId từ client.
 */
@Component
public class CurrentUserProvider {

    public NexusPrincipal require() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof NexusPrincipal principal) {
            return principal;
        }
        throw new AuthenticationCredentialsNotFoundException("No authenticated user");
    }

    public UUID organizationId() {
        return require().getOrganizationId();
    }
}
