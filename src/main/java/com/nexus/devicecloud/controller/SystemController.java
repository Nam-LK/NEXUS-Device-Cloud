package com.nexus.devicecloud.controller;

import java.time.Instant;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoint công khai, tối giản: chỉ cho biết backend và database có phản hồi hay không (không lộ chi tiết nội bộ). */
@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    private static final Logger log = LoggerFactory.getLogger(SystemController.class);

    private final JdbcTemplate jdbcTemplate;

    public SystemController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean databaseUp = isDatabaseUp();
        Map<String, Object> body = Map.of(
                "status", databaseUp ? "UP" : "DEGRADED",
                "database", databaseUp ? "UP" : "DOWN",
                "timestamp", Instant.now().toString());
        return ResponseEntity.status(databaseUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    private boolean isDatabaseUp() {
        try {
            Integer result = jdbcTemplate.queryForObject("select 1", Integer.class);
            return result != null && result == 1;
        } catch (RuntimeException ex) {
            log.warn("Database health check failed: {}", ex.getClass().getSimpleName());
            return false;
        }
    }
}
