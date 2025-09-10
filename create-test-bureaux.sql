-- Créer des bureaux de test pour les centres existants
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les centres existants
SELECT id, name FROM voting_centers LIMIT 5;

-- 2. Créer des bureaux de test pour chaque centre (sans president pour l'instant)
INSERT INTO voting_bureaux (name, center_id, registered_voters)
SELECT 
  'Bureau 01',
  vc.id,
  350
FROM voting_centers vc
WHERE NOT EXISTS (
  SELECT 1 FROM voting_bureaux vb 
  WHERE vb.center_id = vc.id AND vb.name = 'Bureau 01'
)
LIMIT 1;

INSERT INTO voting_bureaux (name, center_id, registered_voters)
SELECT 
  'Bureau 02',
  vc.id,
  345
FROM voting_centers vc
WHERE NOT EXISTS (
  SELECT 1 FROM voting_bureaux vb 
  WHERE vb.center_id = vc.id AND vb.name = 'Bureau 02'
)
LIMIT 1;

-- 3. Vérifier les bureaux créés
SELECT 
  vb.name as bureau,
  vc.name as centre,
  vb.registered_voters
FROM voting_bureaux vb
JOIN voting_centers vc ON vb.center_id = vc.id
ORDER BY vc.name, vb.name;
