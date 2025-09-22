-- Script pour ajouter les champs manquants aux procès-verbaux
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter la colonne election_id à la table procès_verbaux si elle n'existe pas
ALTER TABLE procès_verbaux 
ADD COLUMN IF NOT EXISTS election_id UUID REFERENCES elections(id) ON DELETE CASCADE;

-- 2. Ajouter la colonne bureau_id à la table procès_verbaux si elle n'existe pas
ALTER TABLE procès_verbaux 
ADD COLUMN IF NOT EXISTS bureau_id UUID REFERENCES voting_bureaux(id) ON DELETE CASCADE;

-- 3. Ajouter la colonne entered_by à la table procès_verbaux si elle n'existe pas
ALTER TABLE procès_verbaux 
ADD COLUMN IF NOT EXISTS entered_by VARCHAR(255);

-- 4. Ajouter la colonne entered_at à la table procès_verbaux si elle n'existe pas
ALTER TABLE procès_verbaux 
ADD COLUMN IF NOT EXISTS entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Ajouter la colonne validation_comment à la table procès_verbaux si elle n'existe pas
ALTER TABLE procès_verbaux 
ADD COLUMN IF NOT EXISTS validation_comment TEXT;

-- 6. Ajouter la colonne anomalies à la table procès_verbaux si elle n'existe pas
ALTER TABLE procès_verbaux 
ADD COLUMN IF NOT EXISTS anomalies TEXT;

-- 7. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pv_election_id ON procès_verbaux(election_id);
CREATE INDEX IF NOT EXISTS idx_pv_bureau_id ON procès_verbaux(bureau_id);
CREATE INDEX IF NOT EXISTS idx_pv_status ON procès_verbaux(status);
CREATE INDEX IF NOT EXISTS idx_pv_entered_at ON procès_verbaux(entered_at);

-- 8. Commentaires sur les colonnes
COMMENT ON COLUMN procès_verbaux.election_id IS 'ID de l''élection associée à ce PV';
COMMENT ON COLUMN procès_verbaux.bureau_id IS 'ID du bureau de vote associé à ce PV';
COMMENT ON COLUMN procès_verbaux.entered_by IS 'Nom de l''agent qui a saisi le PV';
COMMENT ON COLUMN procès_verbaux.entered_at IS 'Date et heure de saisie du PV';
COMMENT ON COLUMN procès_verbaux.validation_comment IS 'Commentaire du validateur lors de la validation/rejet';
COMMENT ON COLUMN procès_verbaux.anomalies IS 'Description des anomalies détectées dans le PV';

-- 9. Vérification de la structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'procès_verbaux' 
AND column_name IN ('election_id', 'bureau_id', 'entered_by', 'entered_at', 'validation_comment', 'anomalies')
ORDER BY column_name;
