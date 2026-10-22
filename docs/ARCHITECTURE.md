# Kiến trúc (Release 1)

## Kiến trúc MVC phân lớp (một ứng dụng Spring Boot)
Package gốc `com.nexus.devicecloud`, chia theo lớp:

| Package | Vai trò (MVC) | Nội dung |
|---|---|---|
| `controller` | Controller | `AuthController`, `DeviceController`, `SiteController`, `DashboardController`, `SystemController` — chỉ xử lý HTTP |
| `service` | Logic nghiệp vụ | `DeviceService`, `SiteService`, `DashboardService`, `CurrentUserProvider`, `NexusUserDetailsService` |
| `repository` | Truy cập dữ liệu | Spring Data JPA repository, `DeviceSpecifications` (bộ lọc Criteria) |
| `entity` | Model | `Device`, `Site`, `Organization`, `AppUser`, các enum trạng thái, `AuditedEntity` |
| `dto` | Hợp đồng API | Request/response (record); entity không bao giờ trả trực tiếp ra ngoài |
| `security` | Bảo mật | `NexusPrincipal` (người dùng trong session, mang `organizationId`) |
| `config` | Cấu hình | `SecurityConfig`, `CsrfCookieFilter`, `DemoDataSeeder` |
| `filter` | Servlet filter | `CorrelationIdFilter` |
| `exception` | Xử lý lỗi | Exception nghiệp vụ + `GlobalExceptionHandler` (RFC 9457) |

**View** là frontend React (`frontend/`), giao tiếp qua REST JSON `/api/v1`.

Quy tắc phụ thuộc: `controller → service → repository → entity`; `dto` dùng chung giữa controller và service; controller **không** gọi repository trực tiếp. Cấu trúc này đơn giản và quen thuộc, đổi lại ranh giới giữa các tính năng (devices, sites…) không còn thể hiện qua package; khi hệ thống lớn lên (Release 2+) có thể tách lại theo tính năng. Chưa có kiểm tra tự động quy tắc phụ thuộc (dự kiến ArchUnit).

## Xác thực, phân quyền, tenant
- **Xác thực**: `POST /api/v1/auth/login` tạo session phía server; cookie `JSESSIONID` HttpOnly + SameSite=Lax; cookie `XSRF-TOKEN` đọc được bởi SPA để gửi header `X-XSRF-TOKEN`.
- **Phân quyền**: `@PreAuthorize` trên service ghi (`PLATFORM_ADMIN`, `ORG_ADMIN`, `NETWORK_OPERATOR`). `SECURITY_AUDITOR` và `VIEWER` chỉ đọc. Nút bị ẩn trên UI chỉ là tiện lợi.
- **Tenant isolation**: `organizationId` luôn lấy từ session; repository chỉ có phương thức nhận `organizationId`. Tài nguyên của tổ chức khác trả **404**. DB có thêm khóa ngoại tổ hợp `(site_id, organization_id)` chặn gán thiết bị vào site của tổ chức khác.
- **Quyền sở hữu**: một thiết bị thuộc đúng một tổ chức và tùy chọn một site.

## Mô hình trạng thái thiết bị
- Cấp phát: `REGISTERED → PROVISIONED → DECOMMISSIONED` (cuối).
- Quản trị: `ENABLED ⇄ DISABLED` (kích hoạt/vô hiệu hóa idempotent; thiết bị DECOMMISSIONED không kích hoạt lại được).
- Kết nối: `UNKNOWN/ONLINE/OFFLINE/DEGRADED` — sẽ do bộ đánh giá heartbeat ghi (Release 2). Hiện chỉ dữ liệu demo có giá trị khác `UNKNOWN`.
- Firmware: hiện chỉ lưu `firmware_version`.

## API (`/api/v1`)
`POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /system/health`, `GET /sites`, `GET|POST /devices`, `GET|PATCH /devices/{id}`, `POST /devices/{id}/activation|deactivation`, `GET /dashboard/summary`.
Phân trang: `page` (từ 0), `size` (1–100), `sortBy` (whitelist), `direction`. Lỗi: `application/problem+json` có `correlationId`. PATCH yêu cầu `version`; sai version → 409.

## Dữ liệu
PostgreSQL + Flyway (`V1__init_schema.sql`): organizations, app_users, sites, devices. Hibernate chỉ `validate`, không tự sửa schema.

## Lộ trình
R2: EMQX + simulator + heartbeat + lệnh từ xa. R3: Kafka + ClickHouse + cảnh báo. R4: Flink + Prometheus/Grafana. R5: Airflow/Hadoop/Scylla (chỉ khi có bài toán cụ thể). Audit log là hạng mục kế tiếp ngay sau R1.
