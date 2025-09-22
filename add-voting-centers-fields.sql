-- Script pour ajouter les champs manquants aux centres et bureaux de vote
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes manquantes à voting_centers
ALTER TABLE voting_centers 
ADD COLUMN IF NOT EXISTS contact_respo_centre VARCHAR(255),
ADD COLUMN IF NOT EXISTS representant_bureau VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_repr_centre VARCHAR(255);

-- 2. Ajouter les colonnes manquantes à voting_bureaux
ALTER TABLE voting_bureaux 
ADD COLUMN IF NOT EXISTS contact_respo_bureau VARCHAR(255);

-- 3. Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN voting_centers.contact_respo_centre IS 'Contact du responsable du centre';
COMMENT ON COLUMN voting_centers.representant_bureau IS 'Représentant du bureau (candidat)';
COMMENT ON COLUMN voting_centers.contact_repr_centre IS 'Contact du représentant du centre';
COMMENT ON COLUMN voting_bureaux.contact_respo_bureau IS 'Contact du responsable du bureau';

-- 4. Insérer des données de test basées sur le format CSV
INSERT INTO provinces (name, code) VALUES 
('Haut-Ogooué', 'HOG')
ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (name, code, province_id) VALUES 
('Machin', 'MCH', (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'))
ON CONFLICT (name) DO NOTHING;

INSERT INTO communes (name, code, department_id) VALUES 
('Moanda', 'MOA', (SELECT id FROM departments WHERE name = 'Machin'))
ON CONFLICT (name) DO NOTHING;

INSERT INTO arrondissements (name, code, commune_id) VALUES 
('1er', '1ER', (SELECT id FROM communes WHERE name = 'Moanda'))
ON CONFLICT (name) DO NOTHING;

-- 5. Insérer les centres de vote selon le format CSV
INSERT INTO voting_centers (name, address, contact_name, contact_phone, province_id, department_id, commune_id, arrondissement_id, contact_respo_centre, representant_bureau, contact_repr_centre) VALUES 
('Moanda Plaine', 'Moanda Plaine, Moanda', 'Respo', '076504888', 
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Montagne sainte', 'Montagne sainte, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Mont-Moanda', 'Mont-Moanda, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Douane', 'Douane, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Miossi télépherique', 'Miossi télépherique, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Alliance', 'Alliance, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Lycée technique', 'Lycée technique, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Belle-vue', 'Belle-vue, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Octra', 'Octra, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888'),

('Moukagnissi', 'Moukagnissi, Moanda', 'Respo', '076504888',
 (SELECT id FROM provinces WHERE name = 'Haut-Ogooué'),
 (SELECT id FROM departments WHERE name = 'Machin'),
 (SELECT id FROM communes WHERE name = 'Moanda'),
 (SELECT id FROM arrondissements WHERE name = '1er'),
 '076504888', 'Représentant', '076504888')
ON CONFLICT DO NOTHING;

-- 6. Insérer les bureaux de vote selon le format CSV
INSERT INTO voting_bureaux (name, center_id, registered_voters, president, contact_respo_bureau) VALUES 
-- Moanda Plaine
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Moanda Plaine'), 411, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Moanda Plaine'), 411, 'Respo Bureau', '076504888'),

-- Montagne sainte
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Montagne sainte'), 379, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Montagne sainte'), 379, 'Respo Bureau', '076504888'),

-- Mont-Moanda
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Mont-Moanda'), 471, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Mont-Moanda'), 471, 'Respo Bureau', '076504888'),
('Bureau 3', (SELECT id FROM voting_centers WHERE name = 'Mont-Moanda'), 471, 'Respo Bureau', '076504888'),

-- Douane
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Douane'), 390, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Douane'), 390, 'Respo Bureau', '076504888'),
('Bureau 3', (SELECT id FROM voting_centers WHERE name = 'Douane'), 390, 'Respo Bureau', '076504888'),
('Bureau 4', (SELECT id FROM voting_centers WHERE name = 'Douane'), 389, 'Respo Bureau', '076504888'),

-- Miossi télépherique
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Miossi télépherique'), 458, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Miossi télépherique'), 458, 'Respo Bureau', '076504888'),

-- Alliance
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Alliance'), 414, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Alliance'), 414, 'Respo Bureau', '076504888'),
('Bureau 3', (SELECT id FROM voting_centers WHERE name = 'Alliance'), 414, 'Respo Bureau', '076504888'),
('Bureau 4', (SELECT id FROM voting_centers WHERE name = 'Alliance'), 414, 'Respo Bureau', '076504888'),
('Bureau 5', (SELECT id FROM voting_centers WHERE name = 'Alliance'), 413, 'Respo Bureau', '076504888'),

-- Lycée technique
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Lycée technique'), 416, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Lycée technique'), 416, 'Respo Bureau', '076504888'),
('Bureau 3', (SELECT id FROM voting_centers WHERE name = 'Lycée technique'), 415, 'Respo Bureau', '076504888'),
('Bureau 4', (SELECT id FROM voting_centers WHERE name = 'Lycée technique'), 415, 'Respo Bureau', '076504888'),

-- Belle-vue
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Belle-vue'), 461, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Belle-vue'), 461, 'Respo Bureau', '076504888'),
('Bureau 3', (SELECT id FROM voting_centers WHERE name = 'Belle-vue'), 461, 'Respo Bureau', '076504888'),

-- Octra
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Octra'), 355, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Octra'), 355, 'Respo Bureau', '076504888'),
('Bureau 3', (SELECT id FROM voting_centers WHERE name = 'Octra'), 354, 'Respo Bureau', '076504888'),

-- Moukagnissi
('Bureau 1', (SELECT id FROM voting_centers WHERE name = 'Moukagnissi'), 480, 'Respo Bureau', '076504888'),
('Bureau 2', (SELECT id FROM voting_centers WHERE name = 'Moukagnissi'), 479, 'Respo Bureau', '076504888')
ON CONFLICT DO NOTHING;

-- 7. Vérifier les données insérées
SELECT 
  vc.name as centre,
  COUNT(vb.id) as nb_bureaux,
  SUM(vb.registered_voters) as total_inscrits
FROM voting_centers vc
LEFT JOIN voting_bureaux vb ON vb.center_id = vc.id
WHERE vc.name IN ('Moanda Plaine', 'Montagne sainte', 'Mont-Moanda', 'Douane', 'Miossi télépherique', 'Alliance', 'Lycée technique', 'Belle-vue', 'Octra', 'Moukagnissi')
GROUP BY vc.id, vc.name
ORDER BY vc.name;
