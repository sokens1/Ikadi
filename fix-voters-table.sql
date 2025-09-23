-- Corriger la structure de la table voters selon les relations
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure actuelle de la table voters
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voters' 
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE public.voters
ADD COLUMN IF NOT EXISTS center_id uuid REFERENCES voting_centers(id),
ADD COLUMN IF NOT EXISTS bureau_id uuid REFERENCES voting_bureaux(id);

-- 3. Supprimer les anciennes colonnes si elles existent (optionnel)
-- ALTER TABLE public.voters DROP COLUMN IF EXISTS centers_id;
-- ALTER TABLE public.voters DROP COLUMN IF EXISTS center;
-- ALTER TABLE public.voters DROP COLUMN IF EXISTS bureau;

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




