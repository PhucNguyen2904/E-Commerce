# 🛒 E-Commerce Microservices Platform

Dự án này là một hệ thống thương mại điện tử (E-Commerce) toàn diện, được xây dựng dựa trên kiến trúc **Microservices** hiện đại và linh hoạt. Hệ thống chia thành hai phần chính: Frontend đẹp mắt với React/Vite và Backend mạnh mẽ với Spring Boot, Kafka, Elasticsearch và PostgreSQL.

## 🌟 Tổng quan dự án & Tính năng nổi bật

- **Kiến trúc Microservices**: Ứng dụng được phân chia thành các domain độc lập (Auth, Product, Order, Inventory, v.v.), giao tiếp đồng bộ qua REST API (thông qua API Gateway) và giao tiếp bất đồng bộ qua Apache Kafka.
- **Saga Pattern & Event-Driven**: Xử lý giao dịch phân tán (Distributed Transactions) đảm bảo tính toàn vẹn dữ liệu (Data Consistency) một cách mượt mà khi đặt hàng (Order -> Inventory -> Payment -> Notification) thông qua Message Broker Kafka.
- **Tích hợp Thanh toán VNPAY**: Tích hợp cổng thanh toán thực tế VNPAY cho phép khách hàng thanh toán qua thẻ ngân hàng/ví điện tử.
- **Tìm kiếm thông minh (Elasticsearch)**: Đồng bộ dữ liệu sản phẩm từ PostgreSQL sang Elasticsearch để cung cấp tính năng tìm kiếm sản phẩm tốc độ cao, hỗ trợ Full-text Search ưu việt.
- **Trợ lý ảo AI (Chatbot)**: Tích hợp Google Gemini AI API để cung cấp một trợ lý ảo thông minh, hỗ trợ giải đáp thắc mắc và tư vấn cho khách hàng ngay trên giao diện web.
- **Frontend Hiện đại**: Giao diện người dùng được phát triển bằng React, TypeScript, Vite thế hệ mới, kết hợp với Tailwind CSS mang lại trải nghiệm người dùng (UX) mượt mà và giao diện (UI) hiện đại, tương thích mọi thiết bị (Responsive).

## 🏗️ Kiến trúc Hệ thống

### Hệ sinh thái Backend (Spring Boot)
- **Config Server** (8888): Cung cấp và quản lý cấu hình (Configuration) tập trung cho toàn bộ các service.
- **Discovery Server** (8761): Eureka Registry giúp các service tự động đăng ký và tìm kiếm (Service Discovery) lẫn nhau.
- **API Gateway** (8080): Cổng giao tiếp duy nhất (Single entry point) của toàn bộ hệ thống backend. Xử lý xác thực JWT tập trung, định tuyến request và cân bằng tải.
- **Auth Service** (8081): Quản lý người dùng, xử lý đăng ký, đăng nhập, phân quyền và cấp phát/xác thực JWT Token.
- **Product Service** (8082): Quản lý thông tin sản phẩm, danh mục hàng hóa. Tự động publish event sang Kafka mỗi khi có sản phẩm mới để đồng bộ hóa dữ liệu.
- **Inventory Service** (8083): Quản lý số lượng tồn kho. Chịu trách nhiệm lock/unlock số lượng hàng hóa một cách an toàn trong chuỗi giao dịch phân tán khi có đơn hàng mới.
- **Cart Service** (8084): Quản lý giỏ hàng của người dùng.
- **Order Service** (8085): Điều phối và quản lý đơn hàng, đóng vai trò là Orchestrator chính trong luồng Saga Pattern.
- **Payment Service** (8086): Xử lý các giao dịch thanh toán (tích hợp VNPAY).
- **Notification Service** (8087): Lắng nghe event từ Kafka và tiến hành gửi Email thông báo (xác nhận đơn hàng thành công, v.v.) qua Mailhog.
- **Search Service** (8088): Lắng nghe event từ Kafka để index dữ liệu vào Elasticsearch, hỗ trợ API tìm kiếm sản phẩm tốc độ cao.
- **Chatbot Service** (8089): Tích hợp trực tiếp với API Google Gemini để làm trợ lý ảo tư vấn khách hàng.

### Công nghệ sử dụng
- **Backend:** Java 21, Spring Boot 3, Spring Cloud (Gateway, Config, Eureka), Spring Security, JWT.
- **Cơ sở dữ liệu:** PostgreSQL, Elasticsearch.
- **Message Broker:** Apache Kafka & Zookeeper.
- **Tích hợp bên thứ ba:** VNPAY API, Google Gemini AI.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS.
- **DevOps & Infra:** Docker, Docker Compose, Mailhog (Mock Email SMTP).

## 🚀 Yêu cầu Hệ thống

- [Docker & Docker Compose](https://www.docker.com/)
- [Java 21](https://jdk.java.net/21/)
- [Maven 3.9+](https://maven.apache.org/)
- [Node.js & npm](https://nodejs.org/) (dành cho Frontend)

## 🛠️ Hướng dẫn Cài đặt và Khởi chạy

### 1. Khởi chạy Backend bằng Docker Compose

Mở terminal tại thư mục `backend/` và thực hiện:

**Bước 1.1: Build toàn bộ mã nguồn Backend**
```bash
mvn clean install -DskipTests
```

**Bước 1.2: Khởi động hệ thống qua Docker Compose**
```bash
docker compose up -d --build
```
> **Lưu ý:** Lệnh này sẽ tự động tải các image hạ tầng (Postgres, Kafka, Zookeeper, Elasticsearch, Mailhog) và build các image cho từng service Spring Boot. Lần đầu tiên chạy có thể mất vài phút để hoàn thành.

**Bước 1.3: Khởi tạo dữ liệu mẫu (Seed Data)**
Sau khi tất cả các service đã chạy lên hoàn tất (và Flyway Migrations đã tự động tạo xong các bảng), bạn cần nạp dữ liệu mẫu ban đầu bằng cách chạy script `seed-data.sql` mới được cung cấp. Mở terminal tại thư mục `backend/` và chạy:
```bash
psql -U ecommerce -h localhost -f seed-data.sql
```
*(Lưu ý: Mật khẩu mặc định là `ecommerce`. Bạn cũng có thể dùng DBeaver hoặc PgAdmin kết nối vào Postgres localhost:5432 để chạy file này).*

**Bước 1.4: Kiểm tra trạng thái hệ thống**
- **Eureka Dashboard**: Truy cập `http://localhost:8761` để xem tất cả các service đã đăng ký và hiển thị trạng thái `UP`.
- **Mailhog UI**: Truy cập `http://localhost:8025` để xem hộp thư email giả lập.
- **Elasticsearch**: Truy cập `http://localhost:9200` để đảm bảo Node đang chạy.

### 2. Khởi chạy Frontend

Mở một terminal/command prompt mới tại thư mục `frontend/` và thực hiện:

```bash
# Cài đặt các dependencies
npm install

# Khởi chạy server phát triển
npm run dev
```
> Sau khi chạy thành công, truy cập đường dẫn hiển thị trên terminal (thường là `http://localhost:5173`) để trải nghiệm giao diện người dùng của hệ thống.

## 🧪 Hướng dẫn Chạy Kiểm thử End-to-End (E2E)

Khi toàn bộ các service trên Eureka Dashboard đã hiển thị trạng thái `UP`, bạn có thể chạy kịch bản kiểm thử tự động để kiểm tra luồng mua hàng thực tế (áp dụng Saga Pattern).

Mở PowerShell tại thư mục `backend/` và chạy:
```powershell
.\e2e_test.ps1
```

**Script này sẽ tự động thực hiện tuần tự các bước sau:**
1. Đăng ký tài khoản và cấp quyền `ADMIN` trong DB.
2. Đăng nhập hệ thống để lấy JWT Token.
3. Tạo Danh mục & Sản phẩm mới.
4. Nhập số lượng tồn kho (50 sản phẩm).
5. Thêm sản phẩm vào Giỏ hàng.
6. Đặt hàng qua Order Service (kích hoạt luồng Saga).
7. Chờ 5 giây và kiểm tra lại trạng thái Đơn hàng đã chuyển sang `CONFIRMED`.

✅ **Nếu script báo `[SUCCESS]`**: Luồng mua hàng hoạt động hoàn hảo! Bạn có thể kiểm tra hộp thư tại `http://localhost:8025` (Mailhog) để thấy thư xác nhận đơn hàng vừa được gửi.
