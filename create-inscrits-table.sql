-- Crée la table inscrits pour stocker les lignes du CSV (géographie + centre/bureau + contacts)
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.inscrits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province TEXT NOT NULL,
  departement TEXT NOT NULL,
  commune TEXT NOT NULL,
  arrondissement TEXT,
  center TEXT NOT NULL,
  bureau TEXT NOT NULL,
  inscrits INTEGER NOT NULL DEFAULT 0,
  responsable_centre TEXT,
  contact_respo_centre TEXT,
  responsable_bureau TEXT,
  contact_respo_bureau TEXT,
  representant_bureau TEXT,
  contact_repr_centre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_inscrits_province ON public.inscrits (province);
CREATE INDEX IF NOT EXISTS idx_inscrits_center ON public.inscrits (center);
CREATE INDEX IF NOT EXISTS idx_inscrits_bureau ON public.inscrits (bureau);

-- Contrainte d'unicité facultative sur (center, bureau) si souhaité
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_inscrits_center_bureau ON public.inscrits (center, bureau);

-- Trigger de mise à jour updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inscrits_updated_at ON public.inscrits;
CREATE TRIGGER trg_inscrits_updated_at
BEFORE UPDATE ON public.inscrits
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


