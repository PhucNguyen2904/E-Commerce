-- Thêm các Category mới (bao gồm cả categories được tham chiếu bởi products bên dưới)
INSERT INTO categories (id, name, slug) VALUES 
('33333333-3333-3333-3333-333333333333', 'Áo Khoác', 'ao-khoac'),
('44444444-4444-4444-4444-444444444444', 'Phụ Kiện', 'phu-kien'),
('55555555-5555-5555-5555-555555555555', 'Áo Thun', 'ao-thun'),
('66666666-6666-6666-6666-666666666666', 'Quần Jean', 'quan-jean'),
('77777777-7777-7777-7777-777777777777', 'Giày', 'giay')
ON CONFLICT (id) DO NOTHING;

-- Thêm các sản phẩm Sale
INSERT INTO products (id, name, slug, description, original_price, price, discount_percentage, category_id, image_url, gender, is_active, created_at, updated_at) VALUES
('b1111111-1111-1111-1111-111111111111', 'Áo Thun Polo Basic', 'ao-thun-polo-basic', 'Chất liệu cao cấp, mang lại sự thoải mái.', 350000, 200000, 43, '55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=500&auto=format&fit=crop', 'Nam', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b2222222-2222-2222-2222-222222222222', 'Quần Jean Nam Skinny', 'quan-jean-nam-skinny', 'Chất liệu cao cấp, mang lại sự thoải mái.', 650000, 450000, 31, '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1542272604-780c8e5015e4?q=80&w=500&auto=format&fit=crop', 'Nam', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b3333333-3333-3333-3333-333333333333', 'Áo Khoác Bomber Kaki', 'ao-khoac-bomber-kaki', 'Chất liệu cao cấp, mang lại sự thoải mái.', 850000, 590000, 30, '33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop', 'Nam', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b4444444-4444-4444-4444-444444444444', 'Giày Sneaker Thể Thao', 'giay-sneaker-the-thao', 'Chất liệu cao cấp, mang lại sự thoải mái.', 1200000, 750000, 37, '77777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop', 'Nam', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b5555555-5555-5555-5555-555555555555', 'Ví Da Mini Nhỏ Gọn', 'vi-da-mini-nho-gon', 'Chất liệu cao cấp, mang lại sự thoải mái.', 400000, 250000, 38, '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=500&auto=format&fit=crop', 'Nữ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b6666666-6666-6666-6666-666666666666', 'Kính Râm Phân Cực', 'kinh-ram-phan-cuc', 'Chất liệu cao cấp, mang lại sự thoải mái.', 500000, 300000, 40, '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=500&auto=format&fit=crop', 'Nam', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b7777777-7777-7777-7777-777777777777', 'Mũ Lưỡi Trai Thể Thao', 'mu-luoi-trai-the-thao', 'Chất liệu cao cấp, mang lại sự thoải mái.', 250000, 150000, 40, '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=500&auto=format&fit=crop', 'Nam', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b8888888-8888-8888-8888-888888888888', 'Balo Laptop Đa Năng', 'balo-laptop-da-nang', 'Chất liệu cao cấp, mang lại sự thoải mái.', 900000, 550000, 39, '44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=500&auto=format&fit=crop', 'Nữ', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
