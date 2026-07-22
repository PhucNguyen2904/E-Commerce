# LuxeRetail Frontend

Frontend cho hệ thống E-commerce LuxeRetail, được xây dựng với kiến trúc Agentic và các công nghệ hiện đại.

## Công nghệ sử dụng
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: Zustand (Global state), TanStack React Query (Server state)
- **Routing**: React Router v6
- **Forms & Validation**: React Hook Form, Zod
- **Networking**: Axios

## Cấu trúc thư mục
Dự án được phân chia theo kiến trúc Feature-based:
- `/src/app`: Khởi tạo ứng dụng, cấu hình Router (`AppRouter.tsx`).
- `/src/features`: Các module chức năng chính:
  - `/account`: Hồ sơ người dùng, lịch sử đơn hàng.
  - `/admin`: Khu vực quản trị viên (Dashboard, Tồn kho, Sản phẩm, Đơn hàng...).
  - `/auth`: Đăng nhập, Đăng ký.
  - `/storefront`: Giao diện khách hàng (Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Checkout).
- `/src/shared`: Các thành phần dùng chung (Components, Hooks, Utils, API Client).
- `/src/stores`: Các Zustand store (ví dụ: `authStore`, `cartStore`).

## Biến môi trường (.env)
Dự án sử dụng các biến môi trường sau để kết nối với Backend. Bạn có thể thiết lập thông qua file `.env.development` (hoặc `.env.production`):
```env
# Địa chỉ API của Backend (Ví dụ: http://localhost:8080)
VITE_API_BASE_URL=http://localhost:8080
```
*Lưu ý: Vite đã được cấu hình proxy ở chế độ development (`vite.config.ts`) để điều hướng mọi request `/api` sang `target` tránh lỗi CORS.*

## Hướng dẫn chạy dự án

### 1. Cài đặt thư viện
Yêu cầu Node.js >= 18.
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Dự án sẽ khởi chạy mặc định tại `http://localhost:5173`.

### 3. Build & Preview cho Môi trường Production
```bash
npm run build
npm run preview
```

## Kiểm thử E2E (End-to-End Testing) thủ công
Dự án đã được thiết lập để test trọn vẹn luồng sau:
1. Đăng ký & Đăng nhập tài khoản.
2. Tìm kiếm, xem chi tiết sản phẩm.
3. Thêm vào Giỏ hàng -> Checkout -> Lịch sử mua hàng.
4. Truy cập `/admin` với tài khoản có quyền `ADMIN`.
5. Tạo mới Danh mục, Sản phẩm.
6. Quản lý Tồn kho & Quản lý Đơn hàng (Cập nhật trực tiếp không cần F5).
7. Phân quyền Người dùng (Role Management).
*Các khu vực không có quyền hạn sẽ tự động bị điều hướng về `/403` hoặc `/404`.*
