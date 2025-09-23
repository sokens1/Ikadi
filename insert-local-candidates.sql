-- Insérer les candidats des élections locales dans la table candidates
-- À exécuter dans Supabase SQL Editor
-- Remarque: l'association à une élection spécifique se fait via la table election_candidates

BEGIN;

-- MOULONDA Bernard (PDG)
INSERT INTO public.candidates (name, party, is_our_candidate)
SELECT 'MOULONDA Bernard', 'PDG', false
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidates WHERE name = 'MOULONDA Bernard' AND party = 'PDG'
);

-- LEBOMO Arnaud Clobert (UDB)
INSERT INTO public.candidates (name, party, is_our_candidate)
SELECT 'LEBOMO Arnaud Clobert', 'UDB', false
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidates WHERE name = 'LEBOMO Arnaud Clobert' AND party = 'UDB'
);

-- MBIOKO MANGOUMBA Edgard (Candidat indépendant)
INSERT INTO public.candidates (name, party, is_our_candidate)
SELECT 'MBIOKO MANGOUMBA Edgard', 'Candidat indépendant', false
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidates WHERE name = 'MBIOKO MANGOUMBA Edgard' AND party = 'Candidat indépendant'
);

-- BOUAMBA Maurice (Candidat indépendant)
INSERT INTO public.candidates (name, party, is_our_candidate)
SELECT 'BOUAMBA Maurice', 'Candidat indépendant', false
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidates WHERE name = 'BOUAMBA Maurice' AND party = 'Candidat indépendant'
);

-- NGOSSINGA Dieudonné (UN-LD-UDERE)
INSERT INTO public.candidates (name, party, is_our_candidate)
SELECT 'NGOSSINGA Dieudonné', 'UN-LD-UDERE', false
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidates WHERE name = 'NGOSSINGA Dieudonné' AND party = 'UN-LD-UDERE'
);

-- NDZOLE Paulin (UPR)
INSERT INTO public.candidates (name, party, is_our_candidate)
SELECT 'NDZOLE Paulin', 'UPR', false
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidates WHERE name = 'NDZOLE Paulin' AND party = 'UPR'
);

COMMIT;

-- Lier automatiquement ces candidats à l'élection locale la plus récente
-- (type = 'Locales'). Si vous souhaitez une autre élection, remplacez la CTE target_election.

BEGIN;
WITH target_election AS (
  SELECT id
  FROM public.elections
  WHERE type = 'Locales'
  ORDER BY election_date DESC NULLS LAST
  LIMIT 1
), selected_candidates AS (
  SELECT id FROM public.candidates 
  WHERE name IN (
    'MOULONDA Bernard',
    'LEBOMO Arnaud Clobert',
    'MBIOKO MANGOUMBA Edgard',
    'BOUAMBA Maurice',
    'NGOSSINGA Dieudonné',
    'NDZOLE Paulin'
  )
)
INSERT INTO public.election_candidates (election_id, candidate_id, is_our_candidate)
SELECT te.id, sc.id, false
FROM target_election te
JOIN selected_candidates sc ON TRUE
ON CONFLICT (election_id, candidate_id) DO NOTHING;
COMMIT;

-- Variante: pour une élection précise, remplacez target_election par
-- WITH target_election AS (SELECT '<ELECTION_UUID>'::uuid AS id)


