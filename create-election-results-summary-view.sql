-- Vue pour agréger les résultats par candidat pour une élection
-- Cette vue calcule les totaux de votes par candidat à partir des PV validés

-- Supprimer la vue si elle existe déjà
DROP VIEW IF EXISTS election_results_summary;

CREATE VIEW election_results_summary AS
SELECT 
    e.id as election_id,
    e.title as election_title,
    c.id as candidate_id,
    c.name as candidate_name,
    c.party as candidate_party,
    CASE 
        WHEN ec.candidate_id IS NOT NULL THEN true 
        ELSE false 
    END as is_our_candidate,
    COALESCE(SUM(cr.votes), 0) as total_votes,
    COUNT(DISTINCT pv.id) as pv_count
FROM elections e
LEFT JOIN election_candidates ec ON ec.election_id = e.id
LEFT JOIN candidates c ON c.id = ec.candidate_id
LEFT JOIN procès_verbaux pv ON pv.election_id = e.id AND pv.status = 'validated'
LEFT JOIN candidate_results cr ON cr.pv_id = pv.id AND cr.candidate_id = c.id
WHERE e.id IS NOT NULL
GROUP BY 
    e.id, 
    e.title, 
    c.id, 
    c.name, 
    c.party, 
    ec.candidate_id
HAVING c.id IS NOT NULL
ORDER BY e.id, total_votes DESC;

-- Note: Les index ne peuvent pas être créés directement sur une vue
-- PostgreSQL créera automatiquement des index sur les tables sous-jacentes si nécessaire

-- Commentaire sur la vue
COMMENT ON VIEW election_results_summary IS 'Vue agrégée des résultats par candidat pour chaque élection, basée sur les PV validés';

-- Résultats agrégés par centre
DROP VIEW IF EXISTS center_results_summary;
CREATE VIEW center_results_summary AS
SELECT 
  pv.election_id,
  vb.center_id,
  vc.name AS center_name,
  SUM(pv.total_registered) AS total_registered,
  SUM(pv.total_voters) AS total_voters,
  SUM(pv.null_votes) AS total_null_votes,
  SUM(pv.votes_expressed) AS total_expressed_votes,
  CASE WHEN SUM(pv.total_registered) > 0 THEN ROUND((SUM(pv.total_voters)::numeric / NULLIF(SUM(pv.total_registered),0)) * 100, 2)::numeric(10,2) ELSE 0::numeric(10,2) END AS participation_pct,
  CASE WHEN SUM(pv.total_voters) > 0 THEN ROUND((SUM(pv.votes_expressed)::numeric / NULLIF(SUM(pv.total_voters),0)) * 100, 2)::numeric(10,2) ELSE 0::numeric(10,2) END AS score_pct
FROM procès_verbaux pv
JOIN voting_bureaux vb ON vb.id = pv.bureau_id
JOIN voting_centers vc ON vc.id = vb.center_id
WHERE pv.status = 'validated'
GROUP BY pv.election_id, vb.center_id, vc.name;

-- Résultats agrégés par bureau
DROP VIEW IF EXISTS bureau_results_summary;
CREATE VIEW bureau_results_summary AS
SELECT 
  pv.election_id,
  pv.bureau_id,
  vb.name AS bureau_name,
  vb.center_id,
  SUM(pv.total_registered) AS total_registered,
  SUM(pv.total_voters) AS total_voters,
  SUM(pv.null_votes) AS total_null_votes,
  SUM(pv.votes_expressed) AS total_expressed_votes,
  CASE WHEN SUM(pv.total_registered) > 0 THEN ROUND((SUM(pv.total_voters)::numeric / NULLIF(SUM(pv.total_registered),0)) * 100, 2)::numeric(10,2) ELSE 0::numeric(10,2) END AS participation_pct,
  CASE WHEN SUM(pv.total_voters) > 0 THEN ROUND((SUM(pv.votes_expressed)::numeric / NULLIF(SUM(pv.total_voters),0)) * 100, 2)::numeric(10,2) ELSE 0::numeric(10,2) END AS score_pct
FROM procès_verbaux pv
JOIN voting_bureaux vb ON vb.id = pv.bureau_id
WHERE pv.status = 'validated'
GROUP BY pv.election_id, pv.bureau_id, vb.name, vb.center_id;

-- Résultats par candidat et par centre
DROP VIEW IF EXISTS center_candidate_results_summary;
CREATE VIEW center_candidate_results_summary AS
WITH base AS (
  SELECT 
    pv.election_id,
    vb.center_id,
    vc.name AS center_name,
    cr.candidate_id,
    c.name AS candidate_name,
    COALESCE(SUM(cr.votes), 0) AS candidate_votes
  FROM "procès_verbaux" pv
  JOIN voting_bureaux vb ON vb.id = pv.bureau_id
  JOIN voting_centers vc ON vc.id = vb.center_id
  JOIN candidate_results cr ON cr.pv_id = pv.id
  JOIN candidates c ON c.id = cr.candidate_id
  WHERE pv.status = 'validated'
  GROUP BY pv.election_id, vb.center_id, vc.name, cr.candidate_id, c.name
), reg AS (
  SELECT pv.election_id, vb.center_id, SUM(pv.total_registered) AS total_registered
  FROM "procès_verbaux" pv
  JOIN voting_bureaux vb ON vb.id = pv.bureau_id
  WHERE pv.status = 'validated'
  GROUP BY pv.election_id, vb.center_id
)
SELECT 
  b.election_id,
  b.center_id,
  b.center_name,
  b.candidate_id,
  b.candidate_name,
  b.candidate_votes,
  (ROUND(
    CASE WHEN SUM(b.candidate_votes) OVER (PARTITION BY b.election_id, b.center_id) > 0
      THEN (b.candidate_votes::numeric / NULLIF(SUM(b.candidate_votes) OVER (PARTITION BY b.election_id, b.center_id), 0)) * 100
      ELSE 0
    END
  , 2))::numeric(10,2) AS candidate_percentage,
  (ROUND(
    CASE WHEN r.total_registered > 0
      THEN (b.candidate_votes::numeric / NULLIF(r.total_registered, 0)) * 100
      ELSE 0
    END
  , 2))::numeric(10,2) AS candidate_participation_pct
FROM base b
LEFT JOIN reg r ON r.election_id = b.election_id AND r.center_id = b.center_id;

-- Résultats par candidat et par bureau
DROP VIEW IF EXISTS bureau_candidate_results_summary;
CREATE VIEW bureau_candidate_results_summary AS
WITH base AS (
  SELECT 
    pv.election_id,
    pv.bureau_id,
    vb.name AS bureau_name,
    vb.center_id,
    cr.candidate_id,
    c.name AS candidate_name,
    COALESCE(SUM(cr.votes), 0) AS candidate_votes
  FROM "procès_verbaux" pv
  JOIN voting_bureaux vb ON vb.id = pv.bureau_id
  JOIN candidate_results cr ON cr.pv_id = pv.id
  JOIN candidates c ON c.id = cr.candidate_id
  WHERE pv.status = 'validated'
  GROUP BY pv.election_id, pv.bureau_id, vb.name, vb.center_id, cr.candidate_id, c.name
), reg AS (
  SELECT pv.election_id, pv.bureau_id, SUM(pv.total_registered) AS total_registered
  FROM "procès_verbaux" pv
  WHERE pv.status = 'validated'
  GROUP BY pv.election_id, pv.bureau_id
)
SELECT 
  b.election_id,
  b.bureau_id,
  b.bureau_name,
  b.center_id,
  b.candidate_id,
  b.candidate_name,
  b.candidate_votes,
  (ROUND(
    CASE WHEN SUM(b.candidate_votes) OVER (PARTITION BY b.election_id, b.bureau_id) > 0
      THEN (b.candidate_votes::numeric / NULLIF(SUM(b.candidate_votes) OVER (PARTITION BY b.election_id, b.bureau_id), 0)) * 100
      ELSE 0
    END
  , 2))::numeric(10,2) AS candidate_percentage,
  (ROUND(
    CASE WHEN r.total_registered > 0
      THEN (b.candidate_votes::numeric / NULLIF(r.total_registered, 0)) * 100
      ELSE 0
    END
  , 2))::numeric(10,2) AS candidate_participation_pct
FROM base b
LEFT JOIN reg r ON r.election_id = b.election_id AND r.bureau_id = b.bureau_id;
