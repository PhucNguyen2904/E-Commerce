INSERT INTO users (id, email, password_hash, full_name, role, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@ecommerce.com',
    '$2a$10$8zoPaLPh/BeU70DC97qM5.aI9dEQeNdSB6SwClfYdH1KWIGGJstoG', -- BCrypt hash for 'password123'
    'System Admin',
    'ADMIN',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
