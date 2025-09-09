-- Script pour créer l'utilisateur admin dans Supabase Auth
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer l'utilisateur dans auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'directeur@ewana.ga',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 2. Vérifier que l'utilisateur a été créé
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'directeur@ewana.ga';

-- 3. Vérifier que l'utilisateur existe dans notre table users
SELECT * FROM users WHERE email = 'directeur@ewana.ga';
