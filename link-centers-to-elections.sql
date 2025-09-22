-- Script pour lier les centres de vote aux élections existantes
-- À exécuter dans Supabase SQL Editor

-- 1. Mettre à jour les élections existantes avec des IDs géographiques si manquants
UPDATE elections 
SET 
  province_id = (SELECT id FROM provinces WHERE name = 'Estuaire' LIMIT 1),
  department_id = (SELECT id FROM departments WHERE name = 'Libreville' LIMIT 1),
  commune_id = (SELECT id FROM communes WHERE name = 'Libreville' LIMIT 1),
  arrondissement_id = (SELECT id FROM arrondissements WHERE name = 'Centre' LIMIT 1)
WHERE province_id IS NULL 
  AND title ILIKE '%Libreville%';

UPDATE elections 
SET 
  province_id = (SELECT id FROM provinces WHERE name = 'Haut-Ogooué' LIMIT 1),
  department_id = (SELECT id FROM departments WHERE name = 'Moanda' LIMIT 1),
  commune_id = (SELECT id FROM communes WHERE name = 'Moanda' LIMIT 1),
  arrondissement_id = (SELECT id FROM arrondissements WHERE name = '1er Arrondissement' LIMIT 1)
WHERE province_id IS NULL 
  AND title ILIKE '%Moanda%';

UPDATE elections 
SET 
  province_id = (SELECT id FROM provinces WHERE name = 'Ogooué-Maritime' LIMIT 1),
  department_id = (SELECT id FROM departments WHERE name = 'Port-Gentil' LIMIT 1),
  commune_id = (SELECT id FROM communes WHERE name = 'Port-Gentil' LIMIT 1)
WHERE province_id IS NULL 
  AND title ILIKE '%Port-Gentil%';

-- 2. Vérifier les élections avec leurs localisations
SELECT 
  e.id,
  e.title,
  p.name as province,
  d.name as department,
  c.name as commune,
  a.name as arrondissement
FROM elections e
LEFT JOIN provinces p ON p.id = e.province_id
LEFT JOIN departments d ON d.id = e.department_id
LEFT JOIN communes c ON c.id = e.commune_id
LEFT JOIN arrondissements a ON a.id = e.arrondissement_id
ORDER BY e.created_at DESC;

-- 3. Vérifier quels centres de vote correspondent à chaque élection
SELECT 
  e.title as election,
  vc.name as centre,
  vc.address,
  COUNT(vb.id) as nb_bureaux
FROM elections e
LEFT JOIN voting_centers vc ON (
  (e.arrondissement_id IS NOT NULL AND vc.arrondissement_id = e.arrondissement_id) OR
  (e.arrondissement_id IS NULL AND e.commune_id IS NOT NULL AND vc.commune_id = e.commune_id) OR
  (e.arrondissement_id IS NULL AND e.commune_id IS NULL AND e.department_id IS NOT NULL AND vc.department_id = e.department_id) OR
  (e.arrondissement_id IS NULL AND e.commune_id IS NULL AND e.department_id IS NULL AND e.province_id IS NOT NULL AND vc.province_id = e.province_id)
)
LEFT JOIN voting_bureaux vb ON vb.center_id = vc.id
GROUP BY e.id, e.title, vc.id, vc.name, vc.address
ORDER BY e.title, vc.name;

-- 4. Si aucune correspondance n'est trouvée, créer des centres génériques pour les élections
INSERT INTO voting_centers (name, address, contact_name, contact_phone, province_id, department_id, commune_id, arrondissement_id)
SELECT 
  'Centre ' || e.title as name,
  'Adresse à définir' as address,
  'Responsable à nommer' as contact_name,
  '+241 00 00 00 00' as contact_phone,
  e.province_id,
  e.department_id,
  e.commune_id,
  e.arrondissement_id
FROM elections e
WHERE NOT EXISTS (
  SELECT 1 FROM voting_centers vc WHERE (
    (e.arrondissement_id IS NOT NULL AND vc.arrondissement_id = e.arrondissement_id) OR
    (e.arrondissement_id IS NULL AND e.commune_id IS NOT NULL AND vc.commune_id = e.commune_id) OR
    (e.arrondissement_id IS NULL AND e.commune_id IS NULL AND e.department_id IS NOT NULL AND vc.department_id = e.department_id) OR
    (e.arrondissement_id IS NULL AND e.commune_id IS NULL AND e.department_id IS NULL AND e.province_id IS NOT NULL AND vc.province_id = e.province_id)
  )
)
ON CONFLICT DO NOTHING;

-- 5. Créer un bureau par défaut pour chaque centre créé
INSERT INTO voting_bureaux (name, center_id, registered_voters)
SELECT 
  'Bureau 001' as name,
  vc.id as center_id,
  500 as registered_voters
FROM voting_centers vc
WHERE NOT EXISTS (
  SELECT 1 FROM voting_bureaux vb WHERE vb.center_id = vc.id
)
ON CONFLICT DO NOTHING;
