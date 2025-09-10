-- Ajouter les données administratives pour le 1er arrondissement de Moanda
-- À exécuter dans Supabase SQL Editor

-- 1. Province Haut-Ogooué (gérer les conflits sur name et code)
INSERT INTO provinces (name, code) 
VALUES ('Haut-Ogooué', 'HO') 
ON CONFLICT (name) DO NOTHING
ON CONFLICT (code) DO NOTHING;

-- 2. Département Mpassa
INSERT INTO departments (name, code, province_id) 
SELECT 'Mpassa', 'MP', p.id 
FROM provinces p 
WHERE p.name = 'Haut-Ogooué'
ON CONFLICT (code) DO NOTHING;

-- 3. Commune de Moanda
INSERT INTO communes (name, code, department_id) 
SELECT 'Moanda', 'MO', d.id 
FROM departments d 
WHERE d.name = 'Mpassa'
ON CONFLICT (code) DO NOTHING;

-- 4. 1er arrondissement de Moanda
INSERT INTO arrondissements (name, code, commune_id) 
SELECT '1er Arrondissement', 'MO-01', c.id 
FROM communes c 
WHERE c.name = 'Moanda'
ON CONFLICT (code) DO NOTHING;

-- 5. Quelques centres de vote d'exemple
INSERT INTO voting_centers (name, address, contact_name, contact_phone, province_id, department_id, commune_id, arrondissement_id)
SELECT 
  'Collège Moanda',
  'Quartier Centre, Moanda',
  'M. Kassa',
  '+241 01 23 45 67',
  p.id, d.id, c.id, a.id
FROM provinces p, departments d, communes c, arrondissements a
WHERE p.code = 'HO' AND d.code = 'MP' AND c.code = 'MO' AND a.code = 'MO-01'
ON CONFLICT DO NOTHING;

INSERT INTO voting_centers (name, address, contact_name, contact_phone, province_id, department_id, commune_id, arrondissement_id)
SELECT 
  'École Publique 1',
  'Quartier Moukoundou, Moanda',
  'Mme. Ondo',
  '+241 01 34 56 78',
  p.id, d.id, c.id, a.id
FROM provinces p, departments d, communes c, arrondissements a
WHERE p.code = 'HO' AND d.code = 'MP' AND c.code = 'MO' AND a.code = 'MO-01'
ON CONFLICT DO NOTHING;

-- 6. Quelques bureaux de vote d'exemple
INSERT INTO voting_bureaux (name, center_id)
SELECT 'Bureau 01', vc.id
FROM voting_centers vc
WHERE vc.name = 'Collège Moanda'
ON CONFLICT DO NOTHING;

INSERT INTO voting_bureaux (name, center_id)
SELECT 'Bureau 02', vc.id
FROM voting_centers vc
WHERE vc.name = 'Collège Moanda'
ON CONFLICT DO NOTHING;

INSERT INTO voting_bureaux (name, center_id)
SELECT 'Bureau 01', vc.id
FROM voting_centers vc
WHERE vc.name = 'École Publique 1'
ON CONFLICT DO NOTHING;

-- 7. Vérifier les données créées
SELECT 
  vc.name as centre,
  vc.address,
  p.name as province,
  d.name as departement,
  c.name as commune,
  a.name as arrondissement,
  COUNT(vb.id) as nb_bureaux
FROM voting_centers vc
LEFT JOIN provinces p ON vc.province_id = p.id
LEFT JOIN departments d ON vc.department_id = d.id
LEFT JOIN communes c ON vc.commune_id = c.id
LEFT JOIN arrondissements a ON vc.arrondissement_id = a.id
LEFT JOIN voting_bureaux vb ON vc.id = vb.center_id
GROUP BY vc.id, vc.name, vc.address, p.name, d.name, c.name, a.name;
