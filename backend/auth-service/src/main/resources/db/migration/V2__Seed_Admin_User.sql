INSERT INTO users (id, email, password_hash, full_name, role, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@ecommerce.com',
    '$2a$10$r.M2j2Y3Q0P1t2L2D0a.1eVq.q5F9V0H/F5Y9gL9h/K3E8L0Q/3', -- Invalid hash, will not be used to login directly, E2E test will register a real admin
    'System Admin',
    'ADMIN',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
