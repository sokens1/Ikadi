-- Vérifier la structure des tables et relations
-- À exécuter dans Supabase SQL Editor

-- 1. Structure de la table voters
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voters' 
ORDER BY ordinal_position;

-- 2. Structure de la table voting_centers
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voting_centers' 
ORDER BY ordinal_position;

-- 3. Structure de la table voting_bureaux
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voting_bureaux' 
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
  AND tc.table_name = 'voters';

-- 5. Voir quelques exemples de données
SELECT v.id, v.first_name, v.last_name, v.centers_id, v.bureau_id,
       vc.name as center_name, vb.name as bureau_name
FROM voters v
LEFT JOIN voting_centers vc ON v.centers_id = vc.id
LEFT JOIN voting_bureaux vb ON v.bureau_id = vb.id
LIMIT 5;




