-- Corriger les politiques RLS pour permettre l'authentification
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;

-- Créer de nouvelles politiques pour l'authentification
CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT USING (auth.uid()::text = id::text);

-- Politique temporaire pour permettre la récupération d'utilisateur par email
-- (nécessaire pour l'authentification)
CREATE POLICY "Allow user lookup by email for auth" ON users 
FOR SELECT USING (
    -- Permettre la récupération par email pour l'authentification
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR
    -- Permettre aux super-admins de voir tous les utilisateurs
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = 'sokensdigital@gmail.com'
    )
);

-- Vérifier que les politiques sont créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'users';
