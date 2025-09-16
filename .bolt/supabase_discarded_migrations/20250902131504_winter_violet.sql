@@ .. @@
 -- Função para criar perfil automaticamente quando usuário se registra
 CREATE OR REPLACE FUNCTION handle_new_user()
 RETURNS TRIGGER AS $$
 BEGIN
     INSERT INTO profiles (id, email, full_name, role, institution_id)
     VALUES (
         NEW.id,
         NEW.email,
         COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
-        'user'
+        'user',
+        '00000000-0000-0000-0000-000000000001'
     );
     RETURN NEW;
 END;