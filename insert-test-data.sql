-- Script pour insérer des données de test pour les candidats et centres de vote

-- Insérer des candidats de test (table candidates)
INSERT INTO candidates (id, name, party, is_our_candidate, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Jean MABIKA', 'PDG', true, NOW(), NOW()),
  (gen_random_uuid(), 'Marie KOUBA', 'PDG', false, NOW(), NOW()),
  (gen_random_uuid(), 'Pierre ONDO', 'UDSG', false, NOW(), NOW()),
  (gen_random_uuid(), 'Sophie MBOUMBA', 'PGP', true, NOW(), NOW()),
  (gen_random_uuid(), 'Paul MASSAMBA', 'Indépendant', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insérer des centres de vote de test (table voting_centers)
INSERT INTO voting_centers (id, name, address, total_voters, total_bureaux, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'École Primaire Moanda', 'Avenue de l\'Indépendance, Moanda', 150, 3, NOW(), NOW()),
  (gen_random_uuid(), 'Lycée Technique', 'Quartier Centre, Moanda', 200, 4, NOW(), NOW()),
  (gen_random_uuid(), 'École Publique', 'Quartier Mission, Moanda', 120, 2, NOW(), NOW()),
  (gen_random_uuid(), 'Collège Moderne', 'Quartier Commercial, Moanda', 180, 3, NOW(), NOW()),
  (gen_random_uuid(), 'Centre Culturel', 'Avenue du Général de Gaulle, Moanda', 100, 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Vérifier les données insérées
SELECT 'Candidats insérés:' as info, COUNT(*) as count FROM candidates;
SELECT 'Centres de vote insérés:' as info, COUNT(*) as count FROM voting_centers;

-- Afficher quelques exemples
SELECT 'Exemples de candidats:' as info;
SELECT id, name, party, is_our_candidate FROM candidates LIMIT 3;

SELECT 'Exemples de centres:' as info;
SELECT id, name, address, total_voters, total_bureaux FROM voting_centers LIMIT 3;
