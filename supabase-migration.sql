-- =====================================================
-- MIGRATION SUPABASE - EWANA ELECTIONS CENTRAL
-- Base de données pour la gestion électorale
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLE DES UTILISATEURS (sans référence à voting_centers pour l'instant)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super-admin', 'agent-saisie', 'validateur', 'observateur')),
    assigned_center_id UUID, -- Référence ajoutée plus tard
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABLE DES PROVINCES
-- =====================================================
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLE DES DÉPARTEMENTS
-- =====================================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    province_id UUID REFERENCES provinces(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABLE DES COMMUNES
-- =====================================================
CREATE TABLE communes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABLE DES ARRONDISSEMENTS
-- =====================================================
CREATE TABLE arrondissements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    commune_id UUID REFERENCES communes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABLE DES ÉLECTIONS
-- =====================================================
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Législatives', 'Locales', 'Présidentielle')),
    election_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'À venir' CHECK (status IN ('À venir', 'En cours', 'Terminée')),
    description TEXT,
    seats_available INTEGER DEFAULT 1,
    budget BIGINT DEFAULT 0,
    vote_goal INTEGER DEFAULT 0,
    
    -- Localisation
    province_id UUID REFERENCES provinces(id),
    department_id UUID REFERENCES departments(id),
    commune_id UUID REFERENCES communes(id),
    arrondissement_id UUID REFERENCES arrondissements(id),
    
    -- Métadonnées
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABLE DES CENTRES DE VOTE
-- =====================================================
CREATE TABLE voting_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    coordinates POINT, -- PostGIS pour les coordonnées GPS
    photo_url VARCHAR(500),
    
    -- Localisation
    province_id UUID REFERENCES provinces(id),
    department_id UUID REFERENCES departments(id),
    commune_id UUID REFERENCES communes(id),
    arrondissement_id UUID REFERENCES arrondissements(id),
    
    -- Contact responsable
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Statistiques
    total_voters INTEGER DEFAULT 0,
    total_bureaux INTEGER DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABLE DES BUREAUX DE VOTE
-- =====================================================
CREATE TABLE voting_bureaux (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    center_id UUID REFERENCES voting_centers(id) ON DELETE CASCADE,
    registered_voters INTEGER DEFAULT 0,
    urns_count INTEGER DEFAULT 1,
    president_name VARCHAR(255),
    president_phone VARCHAR(20),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABLE DES CANDIDATS
-- =====================================================
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    party VARCHAR(255) NOT NULL,
    photo_url VARCHAR(500),
    is_our_candidate BOOLEAN DEFAULT false,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. TABLE DE LIAISON ÉLECTIONS-CANDIDATS
-- =====================================================
CREATE TABLE election_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    is_our_candidate BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(election_id, candidate_id)
);

-- =====================================================
-- 11. TABLE DES VOTANTS
-- =====================================================
CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    quartier VARCHAR(100),
    
    -- Localisation de vote
    center_id UUID REFERENCES voting_centers(id),
    bureau_id UUID REFERENCES voting_bureaux(id),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABLE DES PROCÈS-VERBAUX (PV)
-- =====================================================
CREATE TABLE procès_verbaux (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    bureau_id UUID REFERENCES voting_bureaux(id) ON DELETE CASCADE,
    
    -- Données du PV
    total_registered INTEGER NOT NULL DEFAULT 0,
    total_voters INTEGER NOT NULL DEFAULT 0,
    blank_votes INTEGER NOT NULL DEFAULT 0,
    null_votes INTEGER NOT NULL DEFAULT 0,
    votes_expressed INTEGER NOT NULL DEFAULT 0,
    
    -- Statut et validation
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'entered', 'validated', 'anomaly', 'published')),
    entered_by UUID REFERENCES users(id),
    validated_by UUID REFERENCES users(id),
    anomaly_description TEXT,
    
    -- Photos et documents
    pv_photo_url VARCHAR(500),
    signature_photo_url VARCHAR(500),
    
    -- Horodatage
    entered_at TIMESTAMP WITH TIME ZONE,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. TABLE DES RÉSULTATS PAR CANDIDAT
-- =====================================================
CREATE TABLE candidate_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pv_id UUID REFERENCES procès_verbaux(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    votes INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pv_id, candidate_id)
);

-- =====================================================
-- 14. TABLE DES ACTIVITÉS/AUDIT TRAIL
-- =====================================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. TABLE DES NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 16. TABLE DES CONFIGURATIONS SYSTÈME
-- =====================================================
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTRAINTES DE CLÉS ÉTRANGÈRES (après création de toutes les tables)
-- =====================================================

-- Ajouter la contrainte de clé étrangère pour users.assigned_center_id
ALTER TABLE users 
ADD CONSTRAINT fk_users_assigned_center 
FOREIGN KEY (assigned_center_id) REFERENCES voting_centers(id);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index sur les recherches fréquentes
CREATE INDEX idx_voters_name ON voters(last_name, first_name);
CREATE INDEX idx_voters_center ON voters(center_id);
CREATE INDEX idx_voters_bureau ON voters(bureau_id);
CREATE INDEX idx_pv_election ON procès_verbaux(election_id);
CREATE INDEX idx_pv_bureau ON procès_verbaux(bureau_id);
CREATE INDEX idx_pv_status ON procès_verbaux(status);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Index géospatial pour les centres de vote
CREATE INDEX idx_voting_centers_location ON voting_centers USING GIST(coordinates);

-- =====================================================
-- TRIGGERS POUR LES TIMESTAMPS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON elections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voting_centers_updated_at BEFORE UPDATE ON voting_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voting_bureaux_updated_at BEFORE UPDATE ON voting_bureaux FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voters_updated_at BEFORE UPDATE ON voters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procès_verbaux_updated_at BEFORE UPDATE ON procès_verbaux FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Insertion des provinces du Gabon
INSERT INTO provinces (name, code) VALUES
('Estuaire', 'EST'),
('Haut-Ogooué', 'HOG'),
('Moyen-Ogooué', 'MOG'),
('Ngounié', 'NGO'),
('Nyanga', 'NYA'),
('Ogooué-Ivindo', 'OIV'),
('Ogooué-Lolo', 'OLO'),
('Ogooué-Maritime', 'OMA'),
('Woleu-Ntem', 'WNT');

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (email, name, role, is_active) VALUES
('directeur@ewana.ga', 'Directeur de Campagne', 'super-admin', true);

-- Configuration système par défaut
INSERT INTO system_config (key, value, description) VALUES
('app_name', 'EWANA Elections Central', 'Nom de l''application'),
('app_version', '1.0.0', 'Version de l''application'),
('election_countdown_enabled', 'true', 'Activer le countdown des élections'),
('pv_validation_required', 'true', 'Validation obligatoire des PV'),
('max_file_upload_size', '10485760', 'Taille max des fichiers (10MB)');

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_bureaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE procès_verbaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super-admin')
);
CREATE POLICY "Super admins can insert users" ON users FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super-admin')
);
CREATE POLICY "Super admins can update users" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super-admin')
);
CREATE POLICY "Super admins can delete users" ON users FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super-admin')
);

-- Politiques pour les élections
CREATE POLICY "All authenticated users can view elections" ON elections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Super admins can insert elections" ON elections FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super-admin')
);
CREATE POLICY "Super admins can update elections" ON elections FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super-admin')
);
CREATE POLICY "Super admins can delete elections" ON elections FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super-admin')
);

-- Politiques pour les votants
CREATE POLICY "All authenticated users can view voters" ON voters FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Agents can insert voters" ON voters FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super-admin', 'agent-saisie'))
);
CREATE POLICY "Agents can update voters" ON voters FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super-admin', 'agent-saisie'))
);
CREATE POLICY "Agents can delete voters" ON voters FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super-admin', 'agent-saisie'))
);

-- Politiques pour les PV
CREATE POLICY "All authenticated users can view PV" ON procès_verbaux FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Agents can create PV" ON procès_verbaux FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super-admin', 'agent-saisie'))
);
CREATE POLICY "Agents can update PV" ON procès_verbaux FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super-admin', 'agent-saisie'))
);
CREATE POLICY "Validators can validate PV" ON procès_verbaux FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super-admin', 'validateur'))
);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour calculer les statistiques d'une élection
CREATE OR REPLACE FUNCTION get_election_stats(election_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_centers', COUNT(DISTINCT vc.id),
        'total_bureaux', COUNT(DISTINCT vb.id),
        'total_voters', COALESCE(SUM(vb.registered_voters), 0),
        'pv_entered', COUNT(DISTINCT pv.id),
        'pv_validated', COUNT(DISTINCT CASE WHEN pv.status = 'validated' THEN pv.id END),
        'pv_anomalies', COUNT(DISTINCT CASE WHEN pv.status = 'anomaly' THEN pv.id END)
    ) INTO result
    FROM elections e
    LEFT JOIN voting_centers vc ON vc.id IN (
        SELECT DISTINCT center_id FROM voters WHERE center_id IS NOT NULL
    )
    LEFT JOIN voting_bureaux vb ON vb.center_id = vc.id
    LEFT JOIN procès_verbaux pv ON pv.bureau_id = vb.id AND pv.election_id = e.id
    WHERE e.id = election_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les résultats d'un candidat
CREATE OR REPLACE FUNCTION get_candidate_results(election_uuid UUID, candidate_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'candidate_name', c.name,
        'total_votes', COALESCE(SUM(cr.votes), 0),
        'percentage', CASE 
            WHEN (SELECT COALESCE(SUM(votes_expressed), 0) FROM procès_verbaux pv2 
                  JOIN voting_bureaux vb2 ON vb2.id = pv2.bureau_id 
                  JOIN voting_centers vc2 ON vc2.id = vb2.center_id
                  WHERE pv2.election_id = election_uuid AND pv2.status = 'validated') > 0
            THEN ROUND((COALESCE(SUM(cr.votes), 0) * 100.0) / 
                      (SELECT COALESCE(SUM(votes_expressed), 0) FROM procès_verbaux pv2 
                       JOIN voting_bureaux vb2 ON vb2.id = pv2.bureau_id 
                       JOIN voting_centers vc2 ON vc2.id = vb2.center_id
                       WHERE pv2.election_id = election_uuid AND pv2.status = 'validated'), 2)
            ELSE 0
        END
    ) INTO result
    FROM candidates c
    LEFT JOIN candidate_results cr ON cr.candidate_id = c.id
    LEFT JOIN procès_verbaux pv ON pv.id = cr.pv_id
    WHERE c.id = candidate_uuid AND pv.election_id = election_uuid AND pv.status = 'validated';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VUES POUR FACILITER LES REQUÊTES
-- =====================================================

-- Vue pour les statistiques du dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM elections WHERE status = 'En cours') as elections_en_cours,
    (SELECT COUNT(*) FROM elections WHERE status = 'À venir') as elections_a_venir,
    (SELECT COUNT(*) FROM voters) as total_voters,
    (SELECT COUNT(*) FROM voting_centers) as total_centers,
    (SELECT COUNT(*) FROM procès_verbaux WHERE status = 'pending') as pv_en_attente,
    (SELECT COUNT(*) FROM notifications WHERE is_read = false) as notifications_non_lues;

-- Vue pour les résultats consolidés
CREATE VIEW election_results_summary AS
SELECT 
    e.id as election_id,
    e.title as election_title,
    c.id as candidate_id,
    c.name as candidate_name,
    c.party as candidate_party,
    ec.is_our_candidate,
    COALESCE(SUM(cr.votes), 0) as total_votes,
    COUNT(DISTINCT pv.id) as pv_count
FROM elections e
JOIN election_candidates ec ON ec.election_id = e.id
JOIN candidates c ON c.id = ec.candidate_id
LEFT JOIN candidate_results cr ON cr.candidate_id = c.id
LEFT JOIN procès_verbaux pv ON pv.id = cr.pv_id AND pv.election_id = e.id AND pv.status = 'validated'
GROUP BY e.id, e.title, c.id, c.name, c.party, ec.is_our_candidate;

-- =====================================================
-- COMMENTAIRES SUR LES TABLES
-- =====================================================

COMMENT ON TABLE users IS 'Utilisateurs de la plateforme avec leurs rôles et permissions';
COMMENT ON TABLE elections IS 'Élections configurées dans le système';
COMMENT ON TABLE voting_centers IS 'Centres de vote physiques';
COMMENT ON TABLE voting_bureaux IS 'Bureaux de vote dans chaque centre';
COMMENT ON TABLE candidates IS 'Candidats aux élections';
COMMENT ON TABLE voters IS 'Liste des électeurs inscrits';
COMMENT ON TABLE procès_verbaux IS 'Procès-verbaux de vote par bureau';
COMMENT ON TABLE candidate_results IS 'Résultats par candidat par PV';
COMMENT ON TABLE activity_logs IS 'Journal des activités pour audit';
COMMENT ON TABLE notifications IS 'Notifications utilisateurs';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
