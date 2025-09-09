-- Ajouter l'utilisateur existant dans la table users
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter l'utilisateur dans notre table users
INSERT INTO users (
    id,
    email,
    name,
    role,
    is_active
) VALUES (
    '2b86f6e5-bc7a-4055-b50b-125fff91fc04', -- ID de votre utilisateur auth
    'sokensdigital@gmail.com',
    'Directeur de Campagne',
    'super-admin',
    true
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- 2. Vérifier que l'utilisateur a été ajouté
SELECT * FROM users WHERE email = 'sokensdigital@gmail.com';

-- 3. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'users';
