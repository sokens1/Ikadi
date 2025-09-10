-- Créer les données administratives de base pour Moanda
-- À exécuter dans Supabase SQL Editor

-- 1. Province Haut-Ogooué (si elle n'existe pas)
INSERT INTO provinces (name, code) 
VALUES ('Haut-Ogooué', 'HO') 
ON CONFLICT (name) DO NOTHING;

-- 2. Département Mpassa (si il n'existe pas)
INSERT INTO departments (name, code, province_id) 
SELECT 'Mpassa', 'MP', p.id 
FROM provinces p 
WHERE p.name = 'Haut-Ogooué'
ON CONFLICT (code) DO NOTHING;

-- 3. Commune de Moanda (si elle n'existe pas)
INSERT INTO communes (name, code, department_id) 
SELECT 'Moanda', 'MO', d.id 
FROM departments d 
WHERE d.name = 'Mpassa'
ON CONFLICT (code) DO NOTHING;

-- 4. 1er arrondissement de Moanda (si il n'existe pas)
INSERT INTO arrondissements (name, code, commune_id) 
SELECT '1er Arrondissement', 'MO-01', c.id 
FROM communes c 
WHERE c.name = 'Moanda'
ON CONFLICT (code) DO NOTHING;

-- 5. Vérifier que tout a été créé
SELECT 
  'Données créées avec succès' as status,
  (SELECT count(*) FROM provinces WHERE name = 'Haut-Ogooué') as provinces,
  (SELECT count(*) FROM departments WHERE name = 'Mpassa') as departments,
  (SELECT count(*) FROM communes WHERE name = 'Moanda') as communes,
  (SELECT count(*) FROM arrondissements WHERE name = '1er Arrondissement') as arrondissements;
