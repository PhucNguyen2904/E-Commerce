
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
