-- Script pour ajouter les relations manquantes avec les élections
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter election_id aux voting_centers si elle n'existe pas
ALTER TABLE voting_centers 
ADD COLUMN IF NOT EXISTS election_id UUID REFERENCES elections(id) ON DELETE CASCADE;

-- 2. Ajouter election_id aux voting_bureaux si elle n'existe pas
ALTER TABLE voting_bureaux 
ADD COLUMN IF NOT EXISTS election_id UUID REFERENCES elections(id) ON DELETE CASCADE;

-- 3. Ajouter election_id aux candidate_results si elle n'existe pas
ALTER TABLE candidate_results 
ADD COLUMN IF NOT EXISTS election_id UUID REFERENCES elections(id) ON DELETE CASCADE;

-- 4. Ajouter election_id aux procès_verbaux si elle n'existe pas
ALTER TABLE procès_verbaux 
ADD COLUMN IF NOT EXISTS election_id UUID REFERENCES elections(id) ON DELETE CASCADE;

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_voting_centers_election_id ON voting_centers(election_id);
CREATE INDEX IF NOT EXISTS idx_voting_bureaux_election_id ON voting_bureaux(election_id);
CREATE INDEX IF NOT EXISTS idx_candidate_results_election_id ON candidate_results(election_id);
CREATE INDEX IF NOT EXISTS idx_proces_verbaux_election_id ON procès_verbaux(election_id);

-- 6. Mettre à jour les centres existants avec l'election_id basé sur la localisation
UPDATE voting_centers 
SET election_id = (
  SELECT e.id 
  FROM elections e 
  WHERE (
    (e.arrondissement_id IS NOT NULL AND voting_centers.arrondissement_id = e.arrondissement_id) OR
    (e.arrondissement_id IS NULL AND e.commune_id IS NOT NULL AND voting_centers.commune_id = e.commune_id) OR
    (e.arrondissement_id IS NULL AND e.commune_id IS NULL AND e.department_id IS NOT NULL AND voting_centers.department_id = e.department_id) OR
    (e.arrondissement_id IS NULL AND e.commune_id IS NULL AND e.department_id IS NULL AND e.province_id IS NOT NULL AND voting_centers.province_id = e.province_id)
  )
  LIMIT 1
)
WHERE election_id IS NULL;

-- 7. Mettre à jour les bureaux avec l'election_id de leur centre
UPDATE voting_bureaux 
SET election_id = (
  SELECT vc.election_id 
  FROM voting_centers vc 
  WHERE vc.id = voting_bureaux.center_id
)
WHERE election_id IS NULL;

-- 8. Mettre à jour les résultats des candidats avec l'election_id
UPDATE candidate_results 
SET election_id = (
  SELECT ec.election_id 
  FROM election_candidates ec 
  WHERE ec.candidate_id = candidate_results.candidate_id
)
WHERE election_id IS NULL;

-- 9. Mettre à jour les PV avec l'election_id de leur bureau
UPDATE procès_verbaux 
SET election_id = (
  SELECT vb.election_id 
  FROM voting_bureaux vb 
  WHERE vb.id = procès_verbaux.bureau_id
)
WHERE election_id IS NULL;

-- 10. Vérifier les données mises à jour
SELECT 
  'voting_centers' as table_name,
  COUNT(*) as total,
  COUNT(election_id) as with_election_id
FROM voting_centers
UNION ALL
SELECT 
  'voting_bureaux' as table_name,
  COUNT(*) as total,
  COUNT(election_id) as with_election_id
FROM voting_bureaux
UNION ALL
SELECT 
  'candidate_results' as table_name,
  COUNT(*) as total,
  COUNT(election_id) as with_election_id
FROM candidate_results
UNION ALL
SELECT 
  'procès_verbaux' as table_name,
  COUNT(*) as total,
  COUNT(election_id) as with_election_id
FROM procès_verbaux;

-- 11. Afficher les relations établies
SELECT 
  e.title as election,
  COUNT(DISTINCT vc.id) as centers_count,
  COUNT(DISTINCT vb.id) as bureaux_count,
  COUNT(DISTINCT cr.id) as results_count,
  COUNT(DISTINCT pv.id) as pv_count
FROM elections e
LEFT JOIN voting_centers vc ON vc.election_id = e.id
LEFT JOIN voting_bureaux vb ON vb.election_id = e.id
LEFT JOIN candidate_results cr ON cr.election_id = e.id
LEFT JOIN procès_verbaux pv ON pv.election_id = e.id
GROUP BY e.id, e.title
ORDER BY e.title;
