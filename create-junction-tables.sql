-- Script pour créer les tables de jointure si elles n'existent pas

-- 1. Créer la table election_candidates si elle n'existe pas
CREATE TABLE IF NOT EXISTS election_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  is_our_candidate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes de clés étrangères
  CONSTRAINT fk_election_candidates_election 
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  CONSTRAINT fk_election_candidates_candidate 
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Contrainte d'unicité
  CONSTRAINT unique_election_candidate 
    UNIQUE (election_id, candidate_id)
);

-- 2. Créer la table election_centers si elle n'existe pas
CREATE TABLE IF NOT EXISTS election_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL,
  center_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes de clés étrangères
  CONSTRAINT fk_election_centers_election 
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  CONSTRAINT fk_election_centers_center 
    FOREIGN KEY (center_id) REFERENCES voting_centers(id) ON DELETE CASCADE,
  
  -- Contrainte d'unicité
  CONSTRAINT unique_election_center 
    UNIQUE (election_id, center_id)
);

-- 3. Ajouter les colonnes manquantes à la table elections si elles n'existent pas
DO $$ 
BEGIN
  -- Ajouter province_id si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'elections' AND column_name = 'province_id') THEN
    ALTER TABLE elections ADD COLUMN province_id UUID;
    ALTER TABLE elections ADD CONSTRAINT fk_elections_province 
      FOREIGN KEY (province_id) REFERENCES provinces(id);
  END IF;

  -- Ajouter commune_id si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'elections' AND column_name = 'commune_id') THEN
    ALTER TABLE elections ADD COLUMN commune_id UUID;
    ALTER TABLE elections ADD CONSTRAINT fk_elections_commune 
      FOREIGN KEY (commune_id) REFERENCES communes(id);
  END IF;

  -- Ajouter arrondissement_id si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'elections' AND column_name = 'arrondissement_id') THEN
    ALTER TABLE elections ADD COLUMN arrondissement_id UUID;
    ALTER TABLE elections ADD CONSTRAINT fk_elections_arrondissement 
      FOREIGN KEY (arrondissement_id) REFERENCES arrondissements(id);
  END IF;

  -- Ajouter created_by si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'elections' AND column_name = 'created_by') THEN
    ALTER TABLE elections ADD COLUMN created_by TEXT DEFAULT 'system';
  END IF;
END $$;

-- 4. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_election_candidates_election_id ON election_candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_election_candidates_candidate_id ON election_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_election_centers_election_id ON election_centers(election_id);
CREATE INDEX IF NOT EXISTS idx_election_centers_center_id ON election_centers(center_id);

-- 5. Vérifier la structure finale
SELECT 'Structure finale des tables:' as info;
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('elections', 'election_candidates', 'election_centers')
ORDER BY table_name, ordinal_position;
