-- Vérifier et corriger la structure de la table voting_bureaux
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'voting_bureaux' 
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes si nécessaire
ALTER TABLE public.voting_bureaux
ADD COLUMN IF NOT EXISTS president text,
ADD COLUMN IF NOT EXISTS registered_voters integer DEFAULT 0;

-- 3. Vérifier les contraintes de clés étrangères
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
  AND tc.table_name = 'voting_bureaux';

-- 4. Vérifier les données existantes
SELECT COUNT(*) as total_bureaux FROM voting_bureaux;
SELECT * FROM voting_bureaux LIMIT 5;




