-- Script pour forcer la création des politiques RLS
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- Supprimer toutes les politiques existantes pour recommencer
DROP POLICY IF EXISTS "Authenticated users can view election_centers" ON election_centers;
DROP POLICY IF EXISTS "Authenticated users can insert election_centers" ON election_centers;
DROP POLICY IF EXISTS "Authenticated users can update election_centers" ON election_centers;
DROP POLICY IF EXISTS "Authenticated users can delete election_centers" ON election_centers;

DROP POLICY IF EXISTS "Authenticated users can view election_candidates" ON election_candidates;
DROP POLICY IF EXISTS "Authenticated users can insert election_candidates" ON election_candidates;
DROP POLICY IF EXISTS "Authenticated users can update election_candidates" ON election_candidates;
DROP POLICY IF EXISTS "Authenticated users can delete election_candidates" ON election_candidates;

-- Créer des politiques plus permissives pour les tables de liaison
-- Politiques pour election_centers
CREATE POLICY "Allow all operations on election_centers for authenticated users" ON election_centers
    FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Politiques pour election_candidates  
CREATE POLICY "Allow all operations on election_candidates for authenticated users" ON election_candidates
    FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Vérifier que RLS est activé
ALTER TABLE election_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_candidates ENABLE ROW LEVEL SECURITY;

-- Afficher les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('election_candidates', 'election_centers')
ORDER BY tablename, policyname;
