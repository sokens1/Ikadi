-- Vérifier et créer les données administratives manquantes
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les données existantes
SELECT 'PROVINCES' as table_name, count(*) as count FROM provinces
UNION ALL
SELECT 'DEPARTMENTS', count(*) FROM departments  
UNION ALL
SELECT 'COMMUNES', count(*) FROM communes
UNION ALL
SELECT 'ARRONDISSEMENTS', count(*) FROM arrondissements
UNION ALL
SELECT 'VOTING_CENTERS', count(*) FROM voting_centers
UNION ALL
SELECT 'VOTING_BUREAUX', count(*) FROM voting_bureaux;

-- 2. Vérifier les données spécifiques à Moanda
SELECT 'Province Haut-Ogooué' as check_name, 
       CASE WHEN EXISTS(SELECT 1 FROM provinces WHERE name = 'Haut-Ogooué') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'Département Mpassa', 
       CASE WHEN EXISTS(SELECT 1 FROM departments WHERE name = 'Mpassa') 
            THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 'Commune Moanda', 
       CASE WHEN EXISTS(SELECT 1 FROM communes WHERE name = 'Moanda') 
            THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT '1er Arrondissement', 
       CASE WHEN EXISTS(SELECT 1 FROM arrondissements WHERE name = '1er Arrondissement') 
            THEN 'EXISTS' ELSE 'MISSING' END;

-- 3. Créer les données manquantes (sans conflit)
INSERT INTO provinces (name, code) 
VALUES ('Haut-Ogooué', 'HO') 
ON CONFLICT (name) DO NOTHING;

-- 4. Créer le département Mpassa
INSERT INTO departments (name, code, province_id) 
SELECT 'Mpassa', 'MP', p.id 
FROM provinces p 
WHERE p.name = 'Haut-Ogooué'
ON CONFLICT (code) DO NOTHING;

-- 5. Créer la commune de Moanda
INSERT INTO communes (name, code, department_id) 
SELECT 'Moanda', 'MO', d.id 
FROM departments d 
WHERE d.name = 'Mpassa'
ON CONFLICT (code) DO NOTHING;

-- 6. Créer le 1er arrondissement de Moanda
INSERT INTO arrondissements (name, code, commune_id) 
SELECT '1er Arrondissement', 'MO-01', c.id 
FROM communes c 
WHERE c.name = 'Moanda'
ON CONFLICT (code) DO NOTHING;

-- 7. Vérifier le résultat final
SELECT 
  a.name as arrondissement,
  c.name as commune,
  d.name as departement,
  p.name as province
FROM arrondissements a
JOIN communes c ON a.commune_id = c.id
JOIN departments d ON c.department_id = d.id
JOIN provinces p ON d.province_id = p.id
WHERE a.name = '1er Arrondissement';




