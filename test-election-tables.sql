-- Script de test pour vérifier les tables et permissions
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- 1. Vérifier que les tables existent
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('election_candidates', 'election_centers', 'elections', 'candidates', 'voting_centers')
ORDER BY table_name;

-- 2. Vérifier la structure des tables de liaison
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'election_candidates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'election_centers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('election_candidates', 'election_centers')
ORDER BY tablename, policyname;

-- 4. Tester l'insertion d'un enregistrement de test (remplacer par un vrai UUID d'élection)
-- SELECT 'Test insertion election_candidates' as test;
-- INSERT INTO election_candidates (election_id, candidate_id, is_our_candidate) 
-- VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', false)
-- ON CONFLICT DO NOTHING;

-- 5. Vérifier les données existantes
SELECT COUNT(*) as election_candidates_count FROM election_candidates;
SELECT COUNT(*) as election_centers_count FROM election_centers;
SELECT COUNT(*) as elections_count FROM elections;
SELECT COUNT(*) as candidates_count FROM candidates;
SELECT COUNT(*) as voting_centers_count FROM voting_centers;
