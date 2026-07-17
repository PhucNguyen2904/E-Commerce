# E-Commerce Microservices Platform

Dự án này là hệ thống E-Commerce được xây dựng bằng kiến trúc Microservices với Spring Boot, Kafka, và PostgreSQL.

## Kiến trúc
- **Config Server** (8888): Cung cấp cấu hình tập trung.
- **Discovery Server** (8761): Eureka Registry.
- **API Gateway** (8080): Cổng giao tiếp, xác thực JWT, định tuyến.
- **Auth Service** (8081): Đăng ký, Đăng nhập, JWT.
- **Product Service** (8082): Quản lý Sản phẩm, Danh mục.
- **Inventory Service** (8083): Quản lý Tồn kho, tham gia Saga.
- **Cart Service** (8084): Giỏ hàng.
- **Order Service** (8085): Điều phối Saga (Orchestrator).
- **Payment Service** (8086): Xử lý thanh toán (Mock Gateway).
- **Notification Service** (8087): Gửi Email qua Mailhog.

## Yêu cầu Hệ thống
- Docker & Docker Compose
- Maven 3.9+
- Java 21

## Hướng dẫn Chạy Hệ Thống bằng Docker Compose

### Bước 1: Build toàn bộ dự án
Mở terminal ở thư mục `backend/` và chạy lệnh build:
```bash
mvn clean install -DskipTests
```

### Bước 2: Khởi động Docker Compose
Tại thư mục `backend/`, chạy:
```bash
docker compose up -d --build
```
Lệnh này sẽ tải các image hạ tầng (Postgres, Kafka, Zookeeper, Mailhog) và build 10 image cho các service Spring Boot.

### Bước 3: Kiểm tra các service
- Mở **Eureka Dashboard**: `http://localhost:8761` để xem tất cả các service đã hiển thị trạng thái `UP` chưa (thường mất khoảng 1-2 phút sau khi container khởi động).
- Mở **Mailhog UI**: `http://localhost:8025` để xem hộp thư email giả lập.

## Hướng dẫn Chạy Kiểm thử End-to-End (E2E)

Khi toàn bộ các service trên Eureka đã xanh (`UP`), bạn có thể chạy kịch bản kiểm thử tự động.
Mở PowerShell tại thư mục `backend/` và chạy:
```powershell
.\e2e_test.ps1
```

Script này sẽ tự động:
1. Đăng ký tài khoản và ép quyền `ADMIN` trong DB.
2. Đăng nhập lấy JWT Token.
3. Tạo Danh mục & Sản phẩm mới.
4. Nhập 50 số lượng tồn kho.
5. Thêm sản phẩm vào Giỏ hàng.
6. Đặt hàng qua Order Service (kích hoạt Saga).
7. Chờ 5 giây và kiểm tra lại trạng thái Đơn hàng xem đã lên `CONFIRMED` hay chưa.

Nếu script báo `[SUCCESS]`, bạn có thể kiểm tra ở `http://localhost:8025` để thấy thư xác nhận đơn hàng!
