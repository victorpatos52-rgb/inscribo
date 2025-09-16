/*
  # Criar usuário administrador

  1. Remove usuário existente se houver
  2. Cria novo usuário admin com senha correta
  3. Cria perfil associado
  4. Verifica se foi criado corretamente
*/

-- Remover usuário existente se houver
DELETE FROM auth.users WHERE email = 'admin@inscribo.com';
DELETE FROM profiles WHERE email = 'admin@inscribo.com';

-- Criar usuário administrador
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
    aud
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
    'authenticated'
);

-- Criar perfil para o usuário admin
INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    role, 
    institution_id
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@inscribo.com',
    'Administrador Sistema',
    'admin',
    '00000000-0000-0000-0000-000000000001'
);

-- Verificar se foi criado
SELECT 
    u.email,
    u.email_confirmed_at,
    p.full_name,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@inscribo.com';