package com.nexus.devicecloud.repository;

import com.nexus.devicecloud.dto.DeviceSearchCriteria;
import com.nexus.devicecloud.entity.Device;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

/** Xây điều kiện lọc bằng Criteria API (tham số hóa, không nối chuỗi SQL). */
public final class DeviceSpecifications {

    private DeviceSpecifications() {
    }

    public static Specification<Device> matching(UUID organizationId, DeviceSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), organizationId));

            if (criteria.q() != null && !criteria.q().isBlank()) {
                String pattern = "%" + escapeLike(criteria.q().trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'),
                        cb.like(cb.lower(root.get("serialNumber")), pattern, '\\'),
                        cb.like(cb.lower(root.get("model")), pattern, '\\')));
            }
            if (criteria.siteId() != null) {
                predicates.add(cb.equal(root.get("site").get("id"), criteria.siteId()));
            }
            if (criteria.connectivity() != null) {
                predicates.add(cb.equal(root.get("connectivityStatus"), criteria.connectivity()));
            }
            if (criteria.adminStatus() != null) {
                predicates.add(cb.equal(root.get("adminStatus"), criteria.adminStatus()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /** Vô hiệu hóa ký tự đại diện của LIKE trong chuỗi người dùng nhập. */
    public static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
