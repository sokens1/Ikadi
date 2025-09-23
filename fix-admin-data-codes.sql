-- Script pour corriger les données administratives avec codes manquants
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer les données existantes avec codes NULL (si nécessaire)
DELETE FROM arrondissements WHERE code IS NULL;
DELETE FROM communes WHERE code IS NULL;
DELETE FROM departments WHERE code IS NULL;
DELETE FROM provinces WHERE code IS NULL;

-- 2. Insérer les provinces avec codes
INSERT INTO provinces (name, code) VALUES 
('Estuaire', 'EST'), 
('Ogooué-Maritime', 'OGM'), 
('Haut-Ogooué', 'HOG'), 
('Ngounié', 'NGO'), 
('Nyanga', 'NYA'), 
('Ogooué-Ivindo', 'OGI'), 
('Ogooué-Lolo', 'OGL'), 
('Woleu-Ntem', 'WNT')
ON CONFLICT (name) DO NOTHING;

-- 3. Insérer les départements avec codes
INSERT INTO departments (name, code, province_id) VALUES 
('Libreville', 'LIB', (SELECT id FROM provinces WHERE name = 'Estuaire')),
('Owendo', 'OWE', (SELECT id FROM provinces WHERE name = 'Estuaire')),
('Port-Gentil', 'PGL', (SELECT id FROM provinces WHERE name = 'Ogooué-Maritime')),
('Franceville', 'FRV', (SELECT id FROM provinces WHERE name = 'Haut-Ogooué')),
('Moanda', 'MOA', (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'))
ON CONFLICT (name) DO NOTHING;

-- 4. Insérer les communes avec codes
INSERT INTO communes (name, code, department_id) VALUES 
('Libreville', 'LIB', (SELECT id FROM departments WHERE name = 'Libreville')),
('Owendo', 'OWE', (SELECT id FROM departments WHERE name = 'Owendo')),
('Port-Gentil', 'PGL', (SELECT id FROM departments WHERE name = 'Port-Gentil')),
('Franceville', 'FRV', (SELECT id FROM departments WHERE name = 'Franceville')),
('Moanda', 'MOA', (SELECT id FROM departments WHERE name = 'Moanda'))
ON CONFLICT (name) DO NOTHING;

-- 5. Insérer les arrondissements avec codes
INSERT INTO arrondissements (name, code, commune_id) VALUES 
('Centre', 'CTR', (SELECT id FROM communes WHERE name = 'Libreville')),
('Nord', 'NORD', (SELECT id FROM communes WHERE name = 'Libreville')),
('Sud', 'SUD', (SELECT id FROM communes WHERE name = 'Libreville')),
('1er Arrondissement', '1ER', (SELECT id FROM communes WHERE name = 'Moanda')),
('2ème Arrondissement', '2EM', (SELECT id FROM communes WHERE name = 'Moanda'))
ON CONFLICT (name) DO NOTHING;

-- 6. Vérifier les données créées
SELECT 
  'Provinces' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN code IS NULL THEN 1 END) as null_codes
FROM provinces
UNION ALL
SELECT 
  'Departments' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN code IS NULL THEN 1 END) as null_codes
FROM departments
UNION ALL
SELECT 
  'Communes' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN code IS NULL THEN 1 END) as null_codes
FROM communes
UNION ALL
SELECT 
  'Arrondissements' as table_name,
  COUNT(*) as count,
  COUNT(CASE WHEN code IS NULL THEN 1 END) as null_codes
FROM arrondissements;

-- 7. Afficher toutes les données avec codes
SELECT 
  p.name as province,
  p.code as province_code,
  d.name as department,
  d.code as department_code,
  c.name as commune,
  c.code as commune_code,
  a.name as arrondissement,
  a.code as arrondissement_code
FROM provinces p
LEFT JOIN departments d ON d.province_id = p.id
LEFT JOIN communes c ON c.department_id = d.id
LEFT JOIN arrondissements a ON a.commune_id = c.id
ORDER BY p.name, d.name, c.name, a.name;
