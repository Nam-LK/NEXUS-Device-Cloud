package com.nexus.devicecloud.dto;

import java.util.List;
import org.springframework.data.domain.Page;

/** Hợp đồng phân trang chung của API: page bắt đầu từ 0. */
public record PageResponse<T>(List<T> items, int page, int size, long totalElements, int totalPages) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
