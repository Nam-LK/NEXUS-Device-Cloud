# ADR 0001 — Xác thực bằng session phía server và modular monolith

**Quyết định:** dùng session phía server (Spring Security) + CSRF cookie; backend là một ứng dụng Spring Boot đơn khối, tổ chức theo MVC phân lớp (xem ARCHITECTURE.md).

**Lý do:** SPA cùng site với backend, cần thu hồi phiên ngay khi vô hiệu hóa user, không lưu token trong JavaScript. Một deployable đơn giản cho máy 16 GB.

**Đánh đổi:** session lưu trong bộ nhớ của tiến trình (mất khi restart, không scale ngang) — sẽ chuyển sang Spring Session (PostgreSQL/Redis) khi cần. JWT/OIDC phù hợp hơn nếu có client bên thứ ba.

**Thay thế đã loại:** JWT trong localStorage (rủi ro XSS), microservices ngay từ đầu (chi phí vận hành không cần thiết).
