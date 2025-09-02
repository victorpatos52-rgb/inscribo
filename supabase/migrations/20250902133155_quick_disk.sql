@@ .. @@
 -- Criar usuário administrador padrão
 -- Senha: admin123 (hash bcrypt)
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
     role
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
     'authenticated'
-) ON CONFLICT (id) DO NOTHING;
+) ON CONFLICT (id) DO UPDATE SET
+    email = EXCLUDED.email,
+    encrypted_password = EXCLUDED.encrypted_password,
+    updated_at = NOW();
 
 -- Criar perfil para o usuário administrador
 INSERT INTO profiles (id, email, full_name, role, institution_id) 
 VALUES (
     '11111111-1111-1111-1111-111111111111',
     'admin@inscribo.com',
     'Administrador Sistema',
     'admin',
     '00000000-0000-0000-0000-000000000001'
-) ON CONFLICT (id) DO NOTHING;
+) ON CONFLICT (id) DO UPDATE SET
+    email = EXCLUDED.email,
+    full_name = EXCLUDED.full_name,
+    role = EXCLUDED.role,
+    updated_at = NOW();
 
 -- Verificar se o usuário foi criado corretamente
 SELECT 
     u.id,
     u.email,
     p.full_name,
     p.role
 FROM auth.users u
 JOIN profiles p ON u.id = p.id
 WHERE u.email = 'admin@inscribo.com';