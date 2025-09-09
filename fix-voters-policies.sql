-- Corriger les politiques RLS pour la table voters
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "All authenticated users can view voters" ON voters;
DROP POLICY IF EXISTS "Agents can insert voters" ON voters;
DROP POLICY IF EXISTS "Agents can update voters" ON voters;
DROP POLICY IF EXISTS "Agents can delete voters" ON voters;

-- Créer de nouvelles politiques simplifiées
-- 1. Politique pour SELECT (lecture)
CREATE POLICY "Authenticated users can view voters" ON voters 
FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Politique pour INSERT (ajout)
CREATE POLICY "Authenticated users can insert voters" ON voters 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Politique pour UPDATE (modification)
CREATE POLICY "Authenticated users can update voters" ON voters 
FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Politique pour DELETE (suppression)
CREATE POLICY "Authenticated users can delete voters" ON voters 
FOR DELETE USING (auth.role() = 'authenticated');

-- Vérifier que les politiques sont créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'voters';
