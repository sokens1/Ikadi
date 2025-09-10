-- Vérifier la structure des tables pour corriger les requêtes
-- À exécuter dans Supabase SQL Editor

-- 1. Structure de la table voting_centers
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voting_centers' 
ORDER BY ordinal_position;

-- 2. Structure de la table voting_bureaux
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voting_bureaux' 
ORDER BY ordinal_position;

-- 3. Structure de la table candidates
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'candidates' 
ORDER BY ordinal_position;

-- 4. Vérifier les contraintes de clés étrangères
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('voting_centers', 'voting_bureaux', 'candidates');

-- 5. Voir quelques exemples de données
SELECT * FROM voting_centers LIMIT 3;
SELECT * FROM voting_bureaux LIMIT 3;
SELECT * FROM candidates LIMIT 3;
