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

-- Pour lier ces candidats à une élection (locales), utilisez par exemple:
-- INSERT INTO public.election_candidates (election_id, candidate_id, is_our_candidate)
-- SELECT '<ELECTION_UUID>', c.id, false FROM public.candidates c WHERE c.name IN (
--   'MOULONDA Bernard','LEBOMO Arnaud Clobert','MBIOKO MANGOUMBA Edgard','BOUAMBA Maurice','NGOSSINGA Dieudonné','NDZOLE Paulin'
-- );


