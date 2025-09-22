-- Script pour créer une table de liaison entre élections et centres de vote
-- Ceci permettra d'associer directement des centres spécifiques à une élection

-- 1. Créer la table de liaison election_centers
CREATE TABLE IF NOT EXISTS election_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    center_id UUID REFERENCES voting_centers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Empêcher les doublons
    UNIQUE(election_id, center_id)
);

-- 2. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_election_centers_election_id ON election_centers(election_id);
CREATE INDEX IF NOT EXISTS idx_election_centers_center_id ON election_centers(center_id);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE election_centers ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS (à exécuter manuellement dans l'interface Supabase)
-- Politique pour la lecture (tous les utilisateurs authentifiés)
-- CREATE POLICY "Allow read access to election_centers" ON election_centers
--     FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour l'insertion (utilisateurs authentifiés)
-- CREATE POLICY "Allow insert access to election_centers" ON election_centers
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour la mise à jour (utilisateurs authentifiés)
-- CREATE POLICY "Allow update access to election_centers" ON election_centers
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour la suppression (utilisateurs authentifiés)
-- CREATE POLICY "Allow delete access to election_centers" ON election_centers
--     FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Commentaire sur l'utilisation
COMMENT ON TABLE election_centers IS 'Table de liaison entre les élections et les centres de vote. Permet d''associer des centres spécifiques à une élection donnée.';

-- 6. Exemple d'insertion (optionnel - pour tester)
-- INSERT INTO election_centers (election_id, center_id) 
-- SELECT e.id, vc.id 
-- FROM elections e, voting_centers vc 
-- WHERE e.id = 'votre-election-id' 
-- AND vc.arrondissement_id = e.arrondissement_id
-- LIMIT 5;
