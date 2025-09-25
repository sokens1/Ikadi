-- Script pour vérifier la structure de la base de données

-- 1. Vérifier la structure de la table elections
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'elections'
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table election_candidates
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'election_candidates'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table election_centers
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'election_centers'
ORDER BY ordinal_position;

-- 4. Vérifier les contraintes de clés étrangères
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('elections', 'election_candidates', 'election_centers');

-- 5. Vérifier les données existantes
SELECT 'elections' as table_name, COUNT(*) as count FROM elections
UNION ALL
SELECT 'election_candidates' as table_name, COUNT(*) as count FROM election_candidates
UNION ALL
SELECT 'election_centers' as table_name, COUNT(*) as count FROM election_centers
UNION ALL
SELECT 'candidates' as table_name, COUNT(*) as count FROM candidates
UNION ALL
SELECT 'voting_centers' as table_name, COUNT(*) as count FROM voting_centers;
