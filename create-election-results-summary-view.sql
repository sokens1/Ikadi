-- Vue pour agréger les résultats par candidat pour une élection
-- Cette vue calcule les totaux de votes par candidat à partir des PV validés

-- Supprimer la table si elle existe déjà (pas une vue)
DROP TABLE IF EXISTS election_results_summary;

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
