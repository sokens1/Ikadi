-- Script de test pour vérifier la création d'élection

-- 1. Insérer des données de test si nécessaire
INSERT INTO candidates (id, name, party, is_our_candidate, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Test Candidat 1', 'PDG', true, NOW(), NOW()),
  (gen_random_uuid(), 'Test Candidat 2', 'UDSG', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO voting_centers (id, name, address, total_voters, total_bureaux, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Test Centre 1', 'Adresse Test 1', 100, 2, NOW(), NOW()),
  (gen_random_uuid(), 'Test Centre 2', 'Adresse Test 2', 150, 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Récupérer les IDs pour le test
SELECT 'IDs pour le test:' as info;
SELECT 'candidate_id' as type, id as value FROM candidates LIMIT 1
UNION ALL
SELECT 'center_id' as type, id as value FROM voting_centers LIMIT 1
UNION ALL
SELECT 'province_id' as type, id as value FROM provinces LIMIT 1
UNION ALL
SELECT 'commune_id' as type, id as value FROM communes LIMIT 1
UNION ALL
SELECT 'arrondissement_id' as type, id as value FROM arrondissements LIMIT 1;

-- 3. Tester la création d'une élection
WITH test_election AS (
  INSERT INTO elections (
    title, 
    type, 
    election_date, 
    status, 
    description, 
    province_id, 
    commune_id, 
    arrondissement_id, 
    seats_available, 
    budget, 
    vote_goal, 
    nb_electeurs, 
    created_by
  )
  VALUES (
    'Test Élection',
    'Législatives',
    '2025-01-01',
    'À venir',
    'Description de test',
    (SELECT id FROM provinces LIMIT 1),
    (SELECT id FROM communes LIMIT 1),
    (SELECT id FROM arrondissements LIMIT 1),
    1,
    0,
    0,
    250,
    'system'
  )
  RETURNING id
),
test_candidates AS (
  INSERT INTO election_candidates (election_id, candidate_id, is_our_candidate)
  SELECT 
    te.id,
    c.id,
    c.is_our_candidate
  FROM test_election te
  CROSS JOIN (SELECT id, is_our_candidate FROM candidates LIMIT 2) c
  RETURNING election_id, candidate_id
),
test_centers AS (
  INSERT INTO election_centers (election_id, center_id)
  SELECT 
    te.id,
    vc.id
  FROM test_election te
  CROSS JOIN (SELECT id FROM voting_centers LIMIT 2) vc
  RETURNING election_id, center_id
)
SELECT 
  'Test réussi' as status,
  (SELECT COUNT(*) FROM test_candidates) as candidates_linked,
  (SELECT COUNT(*) FROM test_centers) as centers_linked;

-- 4. Vérifier les données créées
SELECT 'Vérification des données créées:' as info;
SELECT 
  e.title,
  e.type,
  e.status,
  e.description,
  p.name as province,
  c.name as commune,
  a.name as arrondissement,
  e.created_by
FROM elections e
LEFT JOIN provinces p ON e.province_id = p.id
LEFT JOIN communes c ON e.commune_id = c.id
LEFT JOIN arrondissements a ON e.arrondissement_id = a.id
WHERE e.title = 'Test Élection';

-- 5. Vérifier les liaisons
SELECT 'Candidats liés:' as info;
SELECT 
  e.title as election,
  c.name as candidate,
  ec.is_our_candidate
FROM elections e
JOIN election_candidates ec ON e.id = ec.election_id
JOIN candidates c ON ec.candidate_id = c.id
WHERE e.title = 'Test Élection';

SELECT 'Centres liés:' as info;
SELECT 
  e.title as election,
  vc.name as center,
  vc.address
FROM elections e
JOIN election_centers ec ON e.id = ec.election_id
JOIN voting_centers vc ON ec.center_id = vc.id
WHERE e.title = 'Test Élection';
