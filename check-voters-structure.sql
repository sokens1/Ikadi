-- Vérifier la structure de la table voters
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Structure de la table voters
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'voters' 
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes
SELECT constraint_name, constraint_type, column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'voters';

-- 3. Vérifier les données existantes
SELECT COUNT(*) as total_voters FROM voters;

-- 4. Vérifier les centres de vote
SELECT id, name FROM voting_centers LIMIT 5;

-- 5. Vérifier les bureaux de vote
SELECT id, name FROM voting_bureaux LIMIT 5;

