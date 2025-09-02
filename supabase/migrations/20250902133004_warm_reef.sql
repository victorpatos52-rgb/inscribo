-- Create admin user with correct password hash
-- This script creates the admin user directly in Supabase auth system

-- First, ensure the user doesn't already exist and delete if it does
DELETE FROM auth.users WHERE email = 'admin@inscribo.com';
DELETE FROM profiles WHERE email = 'admin@inscribo.com';

-- Create the admin user in auth.users with proper password hash
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@inscribo.com',
  '$2a$10$8K1p/a0dhrxSHxN5.WcaAOO.60RiYY4T6GdBrSxnvq5u5YjKzKzYG', -- bcrypt hash for 'admin123'
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NOW(),
  '',
  '',
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administrador Sistema"}',
  false,
  NOW(),
  NOW(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
);

-- Create the profile for the admin user
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  institution_id,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@inscribo.com',
  'Administrador Sistema',
  'admin',
  '00000000-0000-0000-0000-000000000001',
  null,
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'admin@inscribo.com';