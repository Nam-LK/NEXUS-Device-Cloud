# Trạng thái triển khai

**Phát hành hiện tại:** Release 1 (nền tảng full-stack) — bản đầu tiên, **chưa được xác minh trên máy chạy thật**.

## Đã viết
- Backend (cấu trúc MVC phân lớp): 45 file Java chính + 3 lớp test; `pom.xml`; `application.yml`; Flyway `V1__init_schema.sql`.
- Frontend: React/TS strict, 4 file test Vitest, cấu hình Vite/Tailwind/PostCSS.
- Hạ tầng: `docker-compose.yml` (chỉ PostgreSQL), `.env.example`, `.gitignore`, 7 script PowerShell.
- Tài liệu: README (tiếng Việt), ARCHITECTURE, ADR 0001.

## Đã xác minh (thực sự chạy)
| Kiểm tra | Kết quả |
|---|---|
| Quét lỗi cú pháp TypeScript (`tsc`, chỉ mã lỗi TS1xxx) trên mọi file `.ts/.tsx` | Không có lỗi cú pháp |

## CHƯA xác minh (cần bạn chạy và báo kết quả)
| Hạng mục | Cách kiểm tra | Kết quả |
|---|---|---|
| Biên dịch backend (Java/Maven, tải dependency) | `.\scripts\test.ps1` | _chưa chạy_ |
| JUnit: `DeviceTest`, `DeviceServiceTest`, `DeviceSpecificationsTest` | như trên | _chưa chạy_ |
| Khởi động Spring Boot, Flyway V1, Hibernate `validate` | `.\scripts\start-backend.ps1` | _chưa chạy_ |
| Đăng nhập, CSRF, 401/403/404/409 | UI + `.\scripts\check.ps1` | _chưa chạy_ |
| `npm install`, kiểm tra kiểu (`tsc`), `vite build`, Vitest | `.\scripts\test.ps1` | _chưa chạy_ |
| Docker Compose + PostgreSQL healthy | `.\scripts\start-db.ps1` | _chưa chạy_ |
| Giao diện trên trình duyệt | mở http://localhost:5173 | _chưa chạy_ |

Lưu ý: không có `package-lock.json` (không tạo được khi không có mạng). `npm install` sẽ tạo; hãy commit file đó.
Phiên bản npm dùng dấu `^`, nên có thể khác nhẹ so với lúc viết.

## Thay đổi gần nhất
- Backend được chuyển từ package theo tính năng sang MVC phân lớp (`controller/service/repository/entity/dto/...`). Việc chuyển được làm bằng script; đã kiểm tra bằng script rằng package khớp thư mục và mọi import đều đủ, nhưng **chưa biên dịch**.

## Giới hạn đã biết
- Chưa có audit log, giới hạn tốc độ đăng nhập, quản lý user/org/site qua UI, đổi mật khẩu.
- Chưa có test tích hợp (Testcontainers) cho tenant isolation và bảo mật; mới có test đơn vị.
- Session lưu trong bộ nhớ; Swagger công khai khi `NEXUS_OPENAPI_ENABLED=true`; seed demo chỉ cho dev.
- `PLATFORM_ADMIN` hiện vẫn bị giới hạn trong tổ chức của mình.
- Trạng thái kết nối chỉ là dữ liệu demo cho tới khi có heartbeat (Release 2).
- Chưa thể bỏ gán site của thiết bị đã gán.

## Bước tiếp theo
1. Chạy `.\scripts\setup.ps1`, `start-db.ps1`, `test.ps1` và gửi toàn bộ output (kể cả lỗi).
2. Sửa lỗi cụ thể phát sinh, cập nhật bảng "CHƯA xác minh" bằng kết quả thật.
3. Sau khi Release 1 được xác minh: thêm audit log + test tích hợp tenant isolation, rồi mới sang Release 2.
