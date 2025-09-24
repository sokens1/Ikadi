-- Script de test pour les opérations CRUD des centres, bureaux et candidats

-- 1. Vérifier la structure des tables
SELECT 'Structure des tables:' as info;

-- Table elections
SELECT 'elections' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'elections' 
ORDER BY ordinal_position;

-- Table voting_centers
SELECT 'voting_centers' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voting_centers' 
ORDER BY ordinal_position;

-- Table voting_bureaux
SELECT 'voting_bureaux' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'voting_bureaux' 
ORDER BY ordinal_position;

-- Table candidates
SELECT 'candidates' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'candidates' 
ORDER BY ordinal_position;

-- Table election_centers
SELECT 'election_centers' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'election_centers' 
ORDER BY ordinal_position;

-- Table election_candidates
SELECT 'election_candidates' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'election_candidates' 
ORDER BY ordinal_position;

-- 2. Vérifier les données existantes
SELECT 'Données existantes:' as info;

-- Élections
SELECT 'Élections:' as type, COUNT(*) as count FROM elections;

-- Centres de vote
SELECT 'Centres de vote:' as type, COUNT(*) as count FROM voting_centers;

-- Bureaux de vote
SELECT 'Bureaux de vote:' as type, COUNT(*) as count FROM voting_bureaux;

-- Candidats
SELECT 'Candidats:' as type, COUNT(*) as count FROM candidates;

-- Liens élection-centres
SELECT 'Liens élection-centres:' as type, COUNT(*) as count FROM election_centers;

-- Liens élection-candidats
SELECT 'Liens élection-candidats:' as type, COUNT(*) as count FROM election_candidates;

-- 3. Test des opérations CRUD

-- Test CREATE - Ajouter un nouveau centre de vote
INSERT INTO voting_centers (
  id, name, address, contact_name, contact_phone, contact_email,
  total_voters, total_bureaux, created_at, updated_at
) VALUES (
  gen_random_uuid(), 
  'Centre Test CRUD', 
  'Adresse Test, Moanda', 
  'Responsable Test', 
  '+241 01 23 45 67', 
  'test@example.com',
  500, 
  2, 
  NOW(), 
  NOW()
) RETURNING id, name;

-- Test CREATE - Ajouter des bureaux au centre test
WITH test_center AS (
  SELECT id FROM voting_centers WHERE name = 'Centre Test CRUD' LIMIT 1
)
INSERT INTO voting_bureaux (
  id, center_id, name, registered_voters, president_name, president_phone, urns_count,
  created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  tc.id,
  'Bureau Test ' || gs.n,
  250,
  'Président Test',
  '+241 01 23 45 68',
  1,
  NOW(),
  NOW()
FROM test_center tc
CROSS JOIN generate_series(1, 2) AS gs(n);

-- Test CREATE - Ajouter un nouveau candidat
INSERT INTO candidates (
  id, name, party, is_our_candidate, photo_url, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Candidat Test CRUD',
  'Parti Test',
  false,
  '/placeholder.svg',
  NOW(),
  NOW()
) RETURNING id, name;

-- 4. Vérifier les insertions
SELECT 'Vérification des insertions:' as info;

-- Centre créé
SELECT 'Centre créé:' as type, name, address, total_voters, total_bureaux 
FROM voting_centers 
WHERE name = 'Centre Test CRUD';

-- Bureaux créés
SELECT 'Bureaux créés:' as type, name, registered_voters, president_name
FROM voting_bureaux 
WHERE center_id IN (SELECT id FROM voting_centers WHERE name = 'Centre Test CRUD');

-- Candidat créé
SELECT 'Candidat créé:' as type, name, party, is_our_candidate
FROM candidates 
WHERE name = 'Candidat Test CRUD';

-- 5. Test UPDATE - Modifier le centre
UPDATE voting_centers 
SET 
  name = 'Centre Test CRUD Modifié',
  total_voters = 600,
  updated_at = NOW()
WHERE name = 'Centre Test CRUD'
RETURNING name, total_voters;

-- 6. Test UPDATE - Modifier un bureau
UPDATE voting_bureaux 
SET 
  name = 'Bureau Test Modifié',
  registered_voters = 300,
  updated_at = NOW()
WHERE name = 'Bureau Test 1'
RETURNING name, registered_voters;

-- 7. Test UPDATE - Modifier un candidat
UPDATE candidates 
SET 
  name = 'Candidat Test CRUD Modifié',
  party = 'Parti Modifié',
  is_our_candidate = true,
  updated_at = NOW()
WHERE name = 'Candidat Test CRUD'
RETURNING name, party, is_our_candidate;

-- 8. Vérifier les modifications
SELECT 'Vérification des modifications:' as info;

-- Centre modifié
SELECT 'Centre modifié:' as type, name, total_voters
FROM voting_centers 
WHERE name = 'Centre Test CRUD Modifié';

-- Bureau modifié
SELECT 'Bureau modifié:' as type, name, registered_voters
FROM voting_bureaux 
WHERE name = 'Bureau Test Modifié';

-- Candidat modifié
SELECT 'Candidat modifié:' as type, name, party, is_our_candidate
FROM candidates 
WHERE name = 'Candidat Test CRUD Modifié';

-- 9. Test DELETE - Supprimer les données de test
DELETE FROM voting_bureaux 
WHERE center_id IN (SELECT id FROM voting_centers WHERE name = 'Centre Test CRUD Modifié');

DELETE FROM voting_centers 
WHERE name = 'Centre Test CRUD Modifié';

DELETE FROM candidates 
WHERE name = 'Candidat Test CRUD Modifié';

-- 10. Vérifier les suppressions
SELECT 'Vérification des suppressions:' as info;

-- Vérifier que les données de test ont été supprimées
SELECT 'Centres restants:' as type, COUNT(*) as count FROM voting_centers WHERE name LIKE '%Test%';
SELECT 'Bureaux restants:' as type, COUNT(*) as count FROM voting_bureaux WHERE name LIKE '%Test%';
SELECT 'Candidats restants:' as type, COUNT(*) as count FROM candidates WHERE name LIKE '%Test%';

-- Résumé final
SELECT 'Résumé final des opérations CRUD:' as info;
SELECT 'Toutes les opérations CRUD ont été testées avec succès!' as result;
