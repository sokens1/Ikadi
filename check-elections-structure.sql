-- Vérifier la structure de la table elections
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Afficher la structure de la table elections
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'elections' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Afficher les données existantes dans la table elections
SELECT * FROM elections LIMIT 10;

-- 3. Afficher les politiques RLS pour la table elections
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'elections';

-- 4. Vérifier si la table elections existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'elections'
) as elections_table_exists;





