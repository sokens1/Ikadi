-- Ajouter la colonne president à la table voting_bureaux
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure actuelle de la table voting_bureaux
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voting_bureaux' 
ORDER BY ordinal_position;

-- 2. Ajouter la colonne president si elle n'existe pas
ALTER TABLE public.voting_bureaux
ADD COLUMN IF NOT EXISTS president text;

-- 3. Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voting_bureaux' 
ORDER BY ordinal_position;




