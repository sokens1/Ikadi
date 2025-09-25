-- Script de test pour vérifier l'existence des tables et leurs données

-- Vérifier l'existence des tables
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('candidates', 'candidats', 'voting_centers', 'centres_de_vote')
ORDER BY table_name;

-- Vérifier les colonnes de la table candidates (si elle existe)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'candidates'
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table candidats (si elle existe)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'candidats'
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table voting_centers (si elle existe)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'voting_centers'
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table centres_de_vote (si elle existe)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'centres_de_vote'
ORDER BY ordinal_position;

-- Compter les enregistrements dans chaque table
SELECT 'candidates' as table_name, COUNT(*) as count FROM candidates
UNION ALL
SELECT 'candidats' as table_name, COUNT(*) as count FROM candidats
UNION ALL
SELECT 'voting_centers' as table_name, COUNT(*) as count FROM voting_centers
UNION ALL
SELECT 'centres_de_vote' as table_name, COUNT(*) as count FROM centres_de_vote;
