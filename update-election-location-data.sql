-- Script pour mettre à jour les données de localisation des élections

-- 1. Vérifier la structure actuelle de la table elections
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'elections' 
AND (column_name LIKE '%province%' OR column_name LIKE '%department%' OR column_name LIKE '%commune%' OR column_name LIKE '%arrondissement%')
ORDER BY column_name;

-- 2. Ajouter les colonnes de localisation si elles n'existent pas
ALTER TABLE elections 
ADD COLUMN IF NOT EXISTS province_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS department_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS commune_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS arrondissement_name VARCHAR(255);

-- 3. Mettre à jour les élections existantes avec des données de localisation par défaut
UPDATE elections 
SET 
    province_name = 'Haut-Ogooué',
    department_name = 'Moanda',
    commune_name = 'Moanda',
    arrondissement_name = '1er Arrondissement'
WHERE province_name IS NULL OR province_name = '';

-- 4. Vérifier les résultats
SELECT 
    id, 
    title, 
    province_name,
    department_name,
    commune_name,
    arrondissement_name,
    created_at
FROM elections 
ORDER BY created_at DESC;
