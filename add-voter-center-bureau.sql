-- Ajouter les colonnes center et bureau à la table voters
-- À exécuter dans Supabase SQL Editor

-- Ajouter les colonnes manquantes
ALTER TABLE public.voters
ADD COLUMN IF NOT EXISTS center text,
ADD COLUMN IF NOT EXISTS bureau text;

-- Mettre à jour les enregistrements existants avec des valeurs par défaut si nécessaire
UPDATE public.voters 
SET center = 'Non assigné', bureau = 'Non assigné' 
WHERE center IS NULL OR bureau IS NULL;




