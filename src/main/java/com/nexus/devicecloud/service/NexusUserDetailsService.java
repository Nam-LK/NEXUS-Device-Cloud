package com.nexus.devicecloud.service;

import com.nexus.devicecloud.entity.AppUser;
import com.nexus.devicecloud.repository.UserRepository;
import com.nexus.devicecloud.security.NexusPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NexusUserDetailsService implements UserDetailsService {

    private final UserRepository users;

    public NexusUserDetailsService(UserRepository users) {
        this.users = users;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new NexusPrincipal(
                user.getId(),
                user.getOrganization().getId(),
                user.getOrganization().getName(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.isActive(),
                user.getPasswordHash());
    }
}
