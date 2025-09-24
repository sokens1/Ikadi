-- Script pour corriger les données de localisation des élections

-- 1. Ajouter des données de test pour les tables de localisation si elles sont vides

-- Provinces
INSERT INTO provinces (id, name, created_at, updated_at) 
VALUES 
    (gen_random_uuid(), 'Haut-Ogooué', NOW(), NOW()),
    (gen_random_uuid(), 'Estuaire', NOW(), NOW()),
    (gen_random_uuid(), 'Moyen-Ogooué', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Départements
INSERT INTO departments (id, name, created_at, updated_at) 
VALUES 
    (gen_random_uuid(), 'Moanda', NOW(), NOW()),
    (gen_random_uuid(), 'Libreville', NOW(), NOW()),
    (gen_random_uuid(), 'Lambaréné', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Communes
INSERT INTO communes (id, name, created_at, updated_at) 
VALUES 
    (gen_random_uuid(), 'Moanda', NOW(), NOW()),
    (gen_random_uuid(), 'Libreville', NOW(), NOW()),
    (gen_random_uuid(), 'Lambaréné', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Arrondissements
INSERT INTO arrondissements (id, name, created_at, updated_at) 
VALUES 
    (gen_random_uuid(), '1er Arrondissement', NOW(), NOW()),
    (gen_random_uuid(), '2ème Arrondissement', NOW(), NOW()),
    (gen_random_uuid(), '3ème Arrondissement', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. Mettre à jour les élections existantes avec des données de localisation
UPDATE elections 
SET 
    province_id = (SELECT id FROM provinces WHERE name = 'Haut-Ogooué' LIMIT 1),
    department_id = (SELECT id FROM departments WHERE name = 'Moanda' LIMIT 1),
    commune_id = (SELECT id FROM communes WHERE name = 'Moanda' LIMIT 1),
    arrondissement_id = (SELECT id FROM arrondissements WHERE name = '1er Arrondissement' LIMIT 1),
    province_name = 'Haut-Ogooué',
    department_name = 'Moanda',
    commune_name = 'Moanda',
    arrondissement_name = '1er Arrondissement'
WHERE province_id IS NULL OR department_id IS NULL OR commune_id IS NULL;

-- 3. Vérifier les résultats
SELECT 
    id, 
    title, 
    province_name,
    department_name,
    commune_name,
    arrondissement_name
FROM elections 
ORDER BY created_at DESC;
