-- Script pour créer la table des opérations de campagne
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table campaign_operations
CREATE TABLE IF NOT EXISTS campaign_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Meeting', 'Porte-à-porte', 'Distribution', 'Rassemblement', 'Autre')),
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    responsible VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Planifiée' CHECK (status IN ('Planifiée', 'En cours', 'Terminée', 'Annulée')),
    participants INTEGER DEFAULT 0,
    description TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 2. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_campaign_operations_date ON campaign_operations(date);
CREATE INDEX IF NOT EXISTS idx_campaign_operations_status ON campaign_operations(status);
CREATE INDEX IF NOT EXISTS idx_campaign_operations_type ON campaign_operations(type);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE campaign_operations ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS (à exécuter manuellement dans l'interface Supabase)
-- Politique pour la lecture (tous les utilisateurs authentifiés)
-- CREATE POLICY "Allow read access to campaign_operations" ON campaign_operations
--     FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour l'insertion (utilisateurs authentifiés)
-- CREATE POLICY "Allow insert access to campaign_operations" ON campaign_operations
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour la mise à jour (utilisateurs authentifiés)
-- CREATE POLICY "Allow update access to campaign_operations" ON campaign_operations
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour la suppression (utilisateurs authentifiés)
-- CREATE POLICY "Allow delete access to campaign_operations" ON campaign_operations
--     FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Commentaire sur l'utilisation
COMMENT ON TABLE campaign_operations IS 'Table des opérations de campagne électorale (meetings, porte-à-porte, distributions, etc.)';

-- 6. Insérer quelques données d'exemple (optionnel)
INSERT INTO campaign_operations (title, type, date, time, location, responsible, status, participants, description) VALUES
('Grande rencontre citoyenne à Akébé-Ville', 'Meeting', '2025-01-15', '14:00', 'Akébé-Ville, Lomé', 'Jean Dupont', 'Planifiée', 25, 'Rencontre avec les citoyens pour présenter le programme électoral'),
('Porte-à-porte Quartier Nyékonakpoé', 'Porte-à-porte', '2025-01-18', '09:00', 'Nyékonakpoé, Lomé', 'Marie Koffi', 'En cours', 12, 'Canvassing dans le quartier résidentiel'),
('Distribution de tracts Marché d''Assigamé', 'Distribution', '2025-01-20', '07:00', 'Marché d''Assigamé, Lomé', 'Paul Mensah', 'Terminée', 8, 'Distribution matinale au marché')
ON CONFLICT DO NOTHING;

-- 7. Vérification
SELECT COUNT(*) as total_operations FROM campaign_operations;
