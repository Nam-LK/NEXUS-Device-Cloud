# NEXUS Device Cloud

Nền tảng quản lý thiết bị mạng (router, switch, access point, firewall) trên cloud — **Release 1: nền tảng full-stack**.

## Đã có trong bản này
- Đăng nhập bằng session phía server (cookie HttpOnly, bảo vệ CSRF), phân quyền theo vai trò ở backend.
- Cô lập dữ liệu theo tổ chức (tenant): mọi truy vấn thiết bị/site đều lọc theo tổ chức của người đăng nhập.
- Quản lý thiết bị: danh sách (tìm kiếm, lọc, sắp xếp, phân trang), đăng ký, xem chi tiết, sửa tên/site (khóa lạc quan bằng `version`), kích hoạt/vô hiệu hóa.
- Bốn trục trạng thái tách biệt: cấp phát, quản trị, kết nối, firmware.
- Dashboard lấy số liệu thật từ database. Dữ liệu mẫu được đánh dấu **Demo data**.
- Flyway migration, lỗi theo RFC 9457 kèm correlationId, OpenAPI/Swagger, Actuator health.

## Chưa có (có chủ đích, theo lộ trình)
MQTT/EMQX, simulator, telemetry, lệnh từ xa, firmware, cấu hình, cảnh báo, audit log, Redis, Kafka, ClickHouse. Xem `docs/ARCHITECTURE.md`.

## Yêu cầu
Windows 10/11, Java 21 (JDK), Node.js 20+ (LTS), Docker Desktop, Git. Maven **không cần cài**: script sẽ tự tải Maven 3.9.9 vào `.tools\` (có kiểm tra checksum).

## Chạy lần đầu (3 cửa sổ PowerShell, đều ở thư mục gốc dự án)

**Cửa sổ 1 — chuẩn bị và database**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup.ps1        # kiểm tra công cụ, tạo .env, in mật khẩu admin demo
.\scripts\start-db.ps1     # chạy PostgreSQL, đợi healthy
```
**Cửa sổ 2 — backend** (giữ mở): `.\scripts\start-backend.ps1`
Thành công khi log có `Started NexusDeviceCloudApplication` và `Seeded demo organization`.

**Cửa sổ 3 — frontend** (giữ mở): `.\scripts\start-frontend.ps1`

Mở http://localhost:5173 và đăng nhập: `admin@demo.local` + mật khẩu do `setup.ps1` in ra (cũng nằm trong `.env`).

## Kiểm tra
```powershell
.\scripts\check.ps1   # database, Flyway, health, 401 khi chưa đăng nhập, frontend
.\scripts\test.ps1    # docker compose config + mvn test + vitest + tsc/build
```
Swagger UI: http://localhost:8080/swagger-ui.html · Health: http://localhost:8080/actuator/health

## Dừng / log / dọn dẹp
- Dừng backend/frontend: `Ctrl+C` trong cửa sổ tương ứng.
- Dừng database (giữ dữ liệu): `docker compose stop`. Xem log: `docker compose logs -f postgres`.
- Xóa toàn bộ dữ liệu database: `docker compose down -v` (rồi chạy lại `start-db.ps1`; backend sẽ seed lại).

## Lỗi thường gặp
| Hiện tượng | Cách xử lý |
|---|---|
| `running scripts is disabled` | Chạy `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` trong cửa sổ đó |
| `POSTGRES_PASSWORD` báo thiếu | Chạy `.\scripts\setup.ps1` để tạo `.env` |
| Cổng 5432 bị chiếm | Đặt `POSTGRES_PORT=5433` trong `.env`, chạy lại `start-db.ps1` rồi backend |
| Backend lỗi `password authentication failed` | Bạn đổi mật khẩu trong `.env` sau khi volume đã tạo: `docker compose down -v` rồi chạy lại |
| Backend lỗi `NEXUS_SEED_ADMIN_PASSWORD` | Mật khẩu admin demo trống/ngắn hơn 12 ký tự trong `.env` |
| Backend lỗi Flyway/Hibernate `validate` | Gửi nguyên văn lỗi; không sửa tay schema |
| Frontend báo "Backend unreachable" | Backend chưa chạy hoặc đang ở cổng khác (`VITE_API_PROXY_TARGET`) |
| Đăng nhập báo sai dù đúng mật khẩu | Mật khẩu chỉ được ghi vào DB lần seed đầu; xem mục `down -v` ở trên |

## Cấu trúc
```
backend/    Spring Boot MVC (com.nexus.devicecloud): controller, service, repository, entity, dto, security, config, filter, exception
frontend/   React + TypeScript + Vite + Tailwind
docs/       ARCHITECTURE.md, IMPLEMENTATION_STATUS.md, adr/
scripts/    setup, start-db, start-backend, start-frontend, check, test
```
Phiên bản : Java 21, Spring Boot 3.5.6, springdoc 2.8.9, PostgreSQL 16, React 18.3, Vite 6, Tailwind 3.4, Vitest 3, TypeScript 5.7.

## Bảo mật (môi trường dev)
`.env` bị Git bỏ qua; PostgreSQL chỉ mở cho `127.0.0.1`; mật khẩu sinh ngẫu nhiên. Dữ liệu demo và Swagger công khai chỉ dành cho máy phát triển — xem "Giới hạn đã biết" trong `docs/IMPLEMENTATION_STATUS.md` trước khi triển khai thật.
