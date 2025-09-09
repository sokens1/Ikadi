-- Vérifier la table voters et ses données
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table voters
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'voters' 
ORDER BY ordinal_position;

-- 2. Vérifier les données dans la table voters
SELECT * FROM voters ORDER BY created_at DESC LIMIT 10;

-- 3. Vérifier les politiques RLS sur la table voters
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'voters';

-- 4. Vérifier les centres de vote et bureaux
SELECT * FROM voting_centers LIMIT 5;
SELECT * FROM voting_bureaux LIMIT 5;
