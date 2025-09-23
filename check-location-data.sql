-- Script pour vérifier et corriger les données de localisation des élections

-- 1. Vérifier la structure de la table elections
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'elections' 
AND column_name LIKE '%province%' OR column_name LIKE '%department%' OR column_name LIKE '%commune%' OR column_name LIKE '%arrondissement%'
ORDER BY column_name;

-- 2. Vérifier les données actuelles des élections
SELECT 
    id, 
    title, 
    province_id, 
    department_id, 
    commune_id, 
    arrondissement_id,
    province_name,
    department_name,
    commune_name,
    arrondissement_name
FROM elections 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Vérifier les tables de localisation
SELECT 'provinces' as table_name, COUNT(*) as count FROM provinces
UNION ALL
SELECT 'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'communes' as table_name, COUNT(*) as count FROM communes
UNION ALL
SELECT 'arrondissements' as table_name, COUNT(*) as count FROM arrondissements;

-- 4. Vérifier les données de localisation disponibles
SELECT 'Provinces disponibles:' as info;
SELECT id, name FROM provinces ORDER BY name LIMIT 10;

SELECT 'Départements disponibles:' as info;
SELECT id, name FROM departments ORDER BY name LIMIT 10;

SELECT 'Communes disponibles:' as info;
SELECT id, name FROM communes ORDER BY name LIMIT 10;

SELECT 'Arrondissements disponibles:' as info;
SELECT id, name FROM arrondissements ORDER BY name LIMIT 10;
