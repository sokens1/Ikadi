-- Script pour ajouter les champs manquants aux bureaux de vote
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter la colonne election_id à la table voting_bureaux si elle n'existe pas
ALTER TABLE voting_bureaux 
ADD COLUMN IF NOT EXISTS election_id UUID REFERENCES elections(id) ON DELETE CASCADE;

-- 2. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_voting_bureaux_election_id ON voting_bureaux(election_id);

-- 3. Commentaire sur la colonne
COMMENT ON COLUMN voting_bureaux.election_id IS 'ID de l''élection associée à ce bureau de vote';

-- 4. Vérification de la structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'voting_bureaux' 
AND column_name = 'election_id';
