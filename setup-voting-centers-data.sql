-- Script pour configurer les données de centres de vote
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier que les données administratives de base existent
INSERT INTO provinces (name, code) VALUES 
('Estuaire', 'EST'), ('Ogooué-Maritime', 'OGM'), ('Haut-Ogooué', 'HOG'), ('Ngounié', 'NGO'), ('Nyanga', 'NYA'), ('Ogooué-Ivindo', 'OGI'), ('Ogooué-Lolo', 'OGL'), ('Woleu-Ntem', 'WNT')
ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (name, code, province_id) VALUES 
('Libreville', 'LIB', (SELECT id FROM provinces WHERE name = 'Estuaire')),
('Owendo', 'OWE', (SELECT id FROM provinces WHERE name = 'Estuaire')),
('Port-Gentil', 'PGL', (SELECT id FROM provinces WHERE name = 'Ogooué-Maritime')),
('Franceville', 'FRV', (SELECT id FROM provinces WHERE name = 'Haut-Ogooué')),
('Moanda', 'MOA', (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'))
ON CONFLICT (name) DO NOTHING;

INSERT INTO communes (name, code, department_id) VALUES 
('Libreville', 'LIB', (SELECT id FROM departments WHERE name = 'Libreville')),
('Owendo', 'OWE', (SELECT id FROM departments WHERE name = 'Owendo')),
('Port-Gentil', 'PGL', (SELECT id FROM departments WHERE name = 'Port-Gentil')),
('Franceville', 'FRV', (SELECT id FROM departments WHERE name = 'Franceville')),
('Moanda', 'MOA', (SELECT id FROM departments WHERE name = 'Moanda'))
ON CONFLICT (name) DO NOTHING;

INSERT INTO arrondissements (name, code, commune_id) VALUES 
('Centre', 'CTR', (SELECT id FROM communes WHERE name = 'Libreville')),
('Nord', 'NORD', (SELECT id FROM communes WHERE name = 'Libreville')),
('Sud', 'SUD', (SELECT id FROM communes WHERE name = 'Libreville')),
('1er Arrondissement', '1ER', (SELECT id FROM communes WHERE name = 'Moanda')),
('2ème Arrondissement', '2EM', (SELECT id FROM communes WHERE name = 'Moanda'))
ON CONFLICT (name) DO NOTHING;

-- 2. Créer des centres de vote de test si aucun n'existe
INSERT INTO voting_centers (name, address, contact_name, contact_phone, province_id, department_id, commune_id, arrondissement_id) VALUES 
('Centre Libreville Nord', 'Quartier Akébé-Ville, Libreville', 'ONDONG Michel', '+241 01 23 45 67', 
 (SELECT id FROM provinces WHERE name = 'Estuaire'),
 (SELECT id FROM departments WHERE name = 'Libreville'),
 (SELECT id FROM communes WHERE name = 'Libreville'),
 (SELECT id FROM arrondissements WHERE name = 'Nord')),
('Centre Libreville Sud', 'Quartier Montagne Sainte, Libreville', 'MOUKANI Paul', '+241 01 34 56 78',
 (SELECT id FROM provinces WHERE name = 'Estuaire'),
 (SELECT id FROM departments WHERE name = 'Libreville'),
 (SELECT id FROM communes WHERE name = 'Libreville'),
 (SELECT id FROM arrondissements WHERE name = 'Sud')),
('Centre Moanda Principal', 'Collège de Moanda, Moanda', 'BILOGO Marie', '+241 01 45 67 89',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Moanda'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er Arrondissement')),
('Centre Port-Gentil Centre', 'Lycée National, Port-Gentil', 'NGUEMA Jean', '+241 01 56 78 90',
 (SELECT id FROM provinces WHERE name = 'Ogooué-Maritime'),
 (SELECT id FROM departments WHERE name = 'Port-Gentil'),
 (SELECT id FROM communes WHERE name = 'Port-Gentil'),
 NULL)
ON CONFLICT DO NOTHING;

-- 3. Créer des bureaux de vote pour chaque centre
INSERT INTO voting_bureaux (name, center_id, registered_voters) VALUES 
-- Centre Libreville Nord
('Bureau 001', (SELECT id FROM voting_centers WHERE name = 'Centre Libreville Nord'), 500),
('Bureau 002', (SELECT id FROM voting_centers WHERE name = 'Centre Libreville Nord'), 450),
('Bureau 003', (SELECT id FROM voting_centers WHERE name = 'Centre Libreville Nord'), 400),

-- Centre Libreville Sud
('Bureau 001', (SELECT id FROM voting_centers WHERE name = 'Centre Libreville Sud'), 600),
('Bureau 002', (SELECT id FROM voting_centers WHERE name = 'Centre Libreville Sud'), 550),
('Bureau 003', (SELECT id FROM voting_centers WHERE name = 'Centre Libreville Sud'), 500),

-- Centre Moanda Principal
('Bureau 001', (SELECT id FROM voting_centers WHERE name = 'Centre Moanda Principal'), 350),
('Bureau 002', (SELECT id FROM voting_centers WHERE name = 'Centre Moanda Principal'), 300),
('Bureau 003', (SELECT id FROM voting_centers WHERE name = 'Centre Moanda Principal'), 280),

-- Centre Port-Gentil Centre
('Bureau 001', (SELECT id FROM voting_centers WHERE name = 'Centre Port-Gentil Centre'), 400),
('Bureau 002', (SELECT id FROM voting_centers WHERE name = 'Centre Port-Gentil Centre'), 380)
ON CONFLICT DO NOTHING;

-- 4. Vérifier les données créées
SELECT 
  vc.name as centre,
  vc.address,
  COUNT(vb.id) as nb_bureaux,
  SUM(vb.registered_voters) as total_inscrits
FROM voting_centers vc
LEFT JOIN voting_bureaux vb ON vb.center_id = vc.id
GROUP BY vc.id, vc.name, vc.address
ORDER BY vc.name;

-- 5. Vérifier les élections existantes
SELECT 
  id,
  title,
  province_id,
  department_id,
  commune_id,
  arrondissement_id
FROM elections
ORDER BY created_at DESC
LIMIT 5;
