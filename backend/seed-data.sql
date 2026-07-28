-- Dọn dẹp các file rác và gộp chung thành 1 file chuẩn để seed data
-- Lưu ý: Chạy file này bằng lệnh psql (hoặc thông qua DBeaver/PgAdmin) SAU KHI các service đã khởi chạy và Flyway đã tạo xong bảng.
-- Ví dụ: psql -U ecommerce -h localhost -f seed-data.sql

----------------------------------------------------
-- AUTH DATABASE
----------------------------------------------------
\c auth_db;

-- Từ file fix_passwords.sql
UPDATE users SET password_hash = '$2a$10$8zoPaLPh/BeU70DC97qM5.aI9dEQeNdSB6SwClfYdH1KWIGGJstoG';


----------------------------------------------------
-- PRODUCT DATABASE
----------------------------------------------------
\c product_db;

-- Từ file seed_custom_products.sql
-- Insert Categories
INSERT INTO categories (id, name, slug) VALUES 
('11111111-1111-1111-1111-111111111111', 'Áo Sơ Mi', 'ao-so-mi'),
('22222222-2222-2222-2222-222222222222', 'Quần Tây', 'quan-tay'),
('33333333-3333-3333-3333-333333333333', 'Áo Khoác', 'ao-khoac'),
('44444444-4444-4444-4444-444444444444', 'Phụ Kiện', 'phu-kien')
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (id, name, slug, description, price, category_id, image_url, is_active, gender) VALUES
-- Áo Sơ Mi
('a1111111-1111-1111-1111-111111111111', 'Sơ Mi Trắng Egyptian Cotton', 'SM01', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 1850000, '11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=500&auto=format&fit=crop', true, 'Nam'),
('a1111111-1111-1111-1111-111111111112', 'Sơ Mi Chambray Casual', 'SM02', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 1450000, '11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?q=80&w=500&auto=format&fit=crop', true, 'Nam'),
('a1111111-1111-1111-1111-111111111113', 'Sơ Mi Sọc Xanh Navy', 'SM03', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 1650000, '11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?q=80&w=500&auto=format&fit=crop', true, 'Nam'),

-- Quần Tây
('a2222222-2222-2222-2222-222222222221', 'Quần Tây Slim-fit Classic', 'QT01', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 2100000, '22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop', true, 'Nam'),
('a2222222-2222-2222-2222-222222222222', 'Quần Tây Xếp Ly Cao Cấp', 'QT02', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 2350000, '22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=500&auto=format&fit=crop', true, 'Nam'),

-- Áo Khoác
('a3333333-3333-3333-3333-333333333331', 'Blazer Nam Tailored Navy', 'AK01', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 3450000, '33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=500&auto=format&fit=crop', true, 'Nam'),
('a3333333-3333-3333-3333-333333333332', 'Overcoat Lông Cừu Camel', 'AK02', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 5200000, '33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=500&auto=format&fit=crop', true, 'Nam'),
('a3333333-3333-3333-3333-333333333333', 'Áo Khoác Dạ Nữ Thanh Lịch', 'AK03', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 4800000, '33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=500&auto=format&fit=crop', true, 'Nữ'),

-- Phụ Kiện
('a4444444-4444-4444-4444-444444444441', 'Thắt Lưng Da Bò Classic', 'PK01', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 977500, '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=500&auto=format&fit=crop', true, 'Nam'),
('a4444444-4444-4444-4444-444444444442', 'Túi Da Cao Cấp Classic', 'PK02', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 4500000, '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=500&auto=format&fit=crop', true, 'Nữ'),
('a4444444-4444-4444-4444-444444444443', 'Đồng Hồ Bạc Tối Giản', 'PK03', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 3200000, '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=500&auto=format&fit=crop', true, 'Unisex'),
('a4444444-4444-4444-4444-444444444444', 'Cà Vạt Lụa Họa Tiết', 'PK04', 'Chất liệu cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho người mặc.', 650000, '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1589756823695-278bc923f962?q=80&w=500&auto=format&fit=crop', true, 'Nam');

-- Từ file fix_categories_and_products.sql
UPDATE categories SET name = 'Áo Sơ Mi' WHERE slug = 'ao-so-mi';
UPDATE categories SET name = 'Quần Tây' WHERE slug = 'quan-tay';
UPDATE categories SET name = 'Áo Khoác' WHERE slug = 'ao-khoac';
UPDATE categories SET name = 'Phụ Kiện' WHERE slug = 'phu-kien';
UPDATE categories SET name = 'Áo Thun' WHERE slug = 'ao-thun';
UPDATE categories SET name = 'Quần Jean' WHERE slug = 'quan-jean';
UPDATE categories SET name = 'Giày' WHERE slug = 'giay';

UPDATE products SET name = 'Sơ Mi Trắng Egyptian Cotton' WHERE slug = 'SM01';
UPDATE products SET name = 'Sơ Mi Chambray Casual' WHERE slug = 'SM02';
UPDATE products SET name = 'Sơ Mi Sọc Xanh Navy' WHERE slug = 'SM03';
UPDATE products SET name = 'Quần Tây Slim-fit Classic' WHERE slug = 'QT01';
UPDATE products SET name = 'Quần Tây Xếp Ly Cao Cấp' WHERE slug = 'QT02';
UPDATE products SET name = 'Blazer Nam Tailored Navy' WHERE slug = 'AK01';
UPDATE products SET name = 'Overcoat Lông Cừu Camel' WHERE slug = 'AK02';
UPDATE products SET name = 'Áo Khoác Dạ Nữ Thanh Lịch' WHERE slug = 'AK03';
UPDATE products SET name = 'Thắt Lưng Da Bò Classic' WHERE slug = 'PK01';
UPDATE products SET name = 'Túi Da Cao Cấp Classic' WHERE slug = 'PK02';
UPDATE products SET name = 'Đồng Hồ Bạc Tối Giản' WHERE slug = 'PK03';
UPDATE products SET name = 'Cà Vạt Lụa Họa Tiết' WHERE slug = 'PK04';

-- Từ file fix_accents.sql
UPDATE categories SET name = 'Áo thun' WHERE slug = 'ao-thun';
UPDATE categories SET name = 'Quần jean' WHERE slug = 'quan-jean';
UPDATE categories SET name = 'Áo khoác' WHERE slug = 'ao-khoac';

UPDATE products SET name = 'Áo thun nam basic màu trắng', description = 'Áo thun nam dáng cơ bản, chất liệu cotton 100% thoáng mát, màu trắng' WHERE slug = 'ao-thun-nam-basic-trang';
UPDATE products SET name = 'Áo thun nữ tay ngắn màu đen', description = 'Áo thun nữ tay ngắn cổ tròn, dễ phối đồ, màu đen' WHERE slug = 'ao-thun-nu-tay-ngan-den';
UPDATE products SET name = 'Quần jean nữ ống rộng xanh', description = 'Quần jean nữ dáng ống rộng thời trang, màu xanh nhạt' WHERE slug = 'quan-jean-nu-ong-rong-xanh';
UPDATE products SET name = 'Quần jean nam dáng đứng xám', description = 'Quần jean nam dáng đứng, chất liệu co giãn nhẹ, màu xám đậm' WHERE slug = 'quan-jean-nam-dang-dung-xam';
UPDATE products SET name = 'Áo khoác denim nam', description = 'Áo khoác bò nam phong cách vintage, màu xanh cổ điển' WHERE slug = 'ao-khoac-denim-nam';
UPDATE products SET name = 'Áo khoác da nữ cá tính', description = 'Áo khoác da nữ biker, chất liệu da PU cao cấp, màu đen' WHERE slug = 'ao-khoac-da-nu-ca-tinh';


----------------------------------------------------
-- INVENTORY DATABASE
----------------------------------------------------
\c inventory_db;

-- Từ file seed_custom_inventory.sql
INSERT INTO inventory (id, product_id, quantity_available, quantity_reserved) VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 50, 0),
('b1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111112', 30, 0),
('b1111111-1111-1111-1111-111111111113', 'a1111111-1111-1111-1111-111111111113', 25, 0),
('b2222222-2222-2222-2222-222222222221', 'a2222222-2222-2222-2222-222222222221', 40, 0),
('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 15, 0),
('b3333333-3333-3333-3333-333333333331', 'a3333333-3333-3333-3333-333333333331', 10, 0),
('b3333333-3333-3333-3333-333333333332', 'a3333333-3333-3333-3333-333333333332', 5, 0),
('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 20, 0),
('b4444444-4444-4444-4444-444444444441', 'a4444444-4444-4444-4444-444444444441', 100, 0),
('b4444444-4444-4444-4444-444444444442', 'a4444444-4444-4444-4444-444444444442', 20, 0),
('b4444444-4444-4444-4444-444444444443', 'a4444444-4444-4444-4444-444444444443', 15, 0),
('b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 60, 0);
