-- Script pour ajouter les colonnes de publication aux élections
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter la colonne is_published à la table elections
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- 2. Ajouter la colonne published_at à la table elections
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- 3. Ajouter un index sur is_published pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_elections_is_published ON elections(is_published);

-- 4. Ajouter un index sur published_at pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_elections_published_at ON elections(published_at);

-- 5. Commentaire sur l'utilisation
COMMENT ON COLUMN elections.is_published IS 'Indique si les résultats de cette élection ont été publiés publiquement';
COMMENT ON COLUMN elections.published_at IS 'Date et heure de publication des résultats';

-- 6. Exemple de mise à jour (optionnel)
-- UPDATE elections SET is_published = TRUE, published_at = NOW() WHERE id = 'votre-election-id';

-- 7. Vérification
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'elections' 
AND column_name IN ('is_published', 'published_at')
ORDER BY column_name;
