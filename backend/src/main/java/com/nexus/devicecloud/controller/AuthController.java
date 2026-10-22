package com.nexus.devicecloud.controller;

import com.nexus.devicecloud.dto.CurrentUserResponse;
import com.nexus.devicecloud.dto.LoginRequest;
import com.nexus.devicecloud.security.NexusPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Đăng nhập bằng session phía server. Đăng xuất là POST /api/v1/auth/logout (cấu hình trong SecurityConfig). */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();
    private final SecurityContextHolderStrategy contextStrategy = SecurityContextHolder.getContextHolderStrategy();

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public CurrentUserResponse login(
            @Valid @RequestBody LoginRequest request, HttpServletRequest http, HttpServletResponse response) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                    request.email().trim().toLowerCase(Locale.ROOT), request.password()));
        } catch (AuthenticationException ex) {
            log.warn("Login failed ({})", ex.getClass().getSimpleName());
            throw ex;
        }

        // Chống session fixation: đổi session id nếu đã có session trước khi đăng nhập.
        if (http.getSession(false) != null) {
            http.changeSessionId();
        }
        SecurityContext context = contextStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        contextStrategy.setContext(context);
        securityContextRepository.saveContext(context, http, response);

        NexusPrincipal principal = (NexusPrincipal) authentication.getPrincipal();
        log.info("Login succeeded userId={} organizationId={}", principal.getUserId(), principal.getOrganizationId());
        return CurrentUserResponse.from(principal);
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal NexusPrincipal principal) {
        return CurrentUserResponse.from(principal);
    }
}
