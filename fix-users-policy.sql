-- Corriger les politiques RLS de la table users
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can insert users" ON users;
DROP POLICY IF EXISTS "Super admins can update users" ON users;
DROP POLICY IF EXISTS "Super admins can delete users" ON users;

-- Créer de nouvelles politiques sans récursion
CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Super admins can view all users" ON users 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = 'sokensdigital@gmail.com'
    )
);

CREATE POLICY "Super admins can insert users" ON users 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = 'sokensdigital@gmail.com'
    )
);

CREATE POLICY "Super admins can update users" ON users 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = 'sokensdigital@gmail.com'
    )
);

CREATE POLICY "Super admins can delete users" ON users 
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = 'sokensdigital@gmail.com'
    )
);

-- Vérifier que les politiques sont créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
