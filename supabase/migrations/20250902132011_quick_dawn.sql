-- Create admin user in Supabase Auth
-- This script creates the admin user directly in the auth.users table

-- First, ensure we have the default institution
INSERT INTO institutions (id, name, primary_color, secondary_color) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Escola Exemplo', '#8B5CF6', '#06B6D4')
ON CONFLICT (id) DO NOTHING;

-- Create the admin user in auth.users table
-- Password: admin123 (bcrypt hash)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'admin@inscribo.com',
    '$2a$10$8K1p/a0dhrxSHxN5.WcaAOO.60RiYY4T6GdBrSxnvq5u5YjKzKzYG',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador Sistema"}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    ''
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Create the profile for the admin user
INSERT INTO profiles (id, email, full_name, role, institution_id) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@inscribo.com',
    'Administrador Sistema',
    'admin',
    '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    institution_id = EXCLUDED.institution_id;

-- Create identity record for the user
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "admin@inscribo.com"}',
    'email',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    identity_data = EXCLUDED.identity_data,
    last_sign_in_at = EXCLUDED.last_sign_in_at;