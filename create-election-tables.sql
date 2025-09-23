-- Script pour créer les tables de liaison election_centers et election_candidates
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- Créer la table election_centers si elle n'existe pas
CREATE TABLE IF NOT EXISTS election_centers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    center_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(election_id, center_id)
);

-- Créer la table election_candidates si elle n'existe pas
CREATE TABLE IF NOT EXISTS election_candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL,
    is_our_candidate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(election_id, candidate_id)
);

-- Activer RLS sur les tables
ALTER TABLE election_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_candidates ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour election_centers
DROP POLICY IF EXISTS "Authenticated users can view election_centers" ON election_centers;
CREATE POLICY "Authenticated users can view election_centers" ON election_centers
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert election_centers" ON election_centers;
CREATE POLICY "Authenticated users can insert election_centers" ON election_centers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update election_centers" ON election_centers;
CREATE POLICY "Authenticated users can update election_centers" ON election_centers
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete election_centers" ON election_centers;
CREATE POLICY "Authenticated users can delete election_centers" ON election_centers
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Politiques RLS pour election_candidates
DROP POLICY IF EXISTS "Authenticated users can view election_candidates" ON election_candidates;
CREATE POLICY "Authenticated users can view election_candidates" ON election_candidates
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert election_candidates" ON election_candidates;
CREATE POLICY "Authenticated users can insert election_candidates" ON election_candidates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update election_candidates" ON election_candidates;
CREATE POLICY "Authenticated users can update election_candidates" ON election_candidates
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete election_candidates" ON election_candidates;
CREATE POLICY "Authenticated users can delete election_candidates" ON election_candidates
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_election_centers_election_id ON election_centers(election_id);
CREATE INDEX IF NOT EXISTS idx_election_centers_center_id ON election_centers(center_id);
CREATE INDEX IF NOT EXISTS idx_election_candidates_election_id ON election_candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_election_candidates_candidate_id ON election_candidates(candidate_id);
