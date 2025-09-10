-- Ajouter une colonne photo_url aux votants et configurer le bucket de stockage
-- À exécuter dans Supabase SQL Editor

-- 1) Colonne photo_url sur la table voters
ALTER TABLE public.voters
ADD COLUMN IF NOT EXISTS photo_url text;

-- 2) Créer le bucket pour les photos de votants (public pour simplifier l'affichage)
-- Ignorer l'erreur si le bucket existe déjà
DO $$
BEGIN
  PERFORM storage.create_bucket('voter-photos', public => true);
EXCEPTION WHEN OTHERS THEN
  -- bucket déjà existant
  NULL;
END $$;

-- 3) Politiques RLS sur storage.objects (lecture publique, écriture authentifiée)
-- Activer RLS si nécessaire
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Lecture publique des fichiers du bucket voter-photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Public read voter-photos' AND polrelid = 'storage.objects'::regclass
  ) THEN
    EXECUTE 'CREATE POLICY "Public read voter-photos" ON storage.objects FOR SELECT TO public USING (bucket_id = ''voter-photos'')';
  END IF;
END $$;

-- Upload/écriture réservés aux utilisateurs authentifiés
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Authenticated write voter-photos' AND polrelid = 'storage.objects'::regclass
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated write voter-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''voter-photos'')';
  END IF;
END $$;

-- Mise à jour/suppression réservées aux authentifiés (optionnel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Authenticated update voter-photos' AND polrelid = 'storage.objects'::regclass
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated update voter-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''voter-photos'') WITH CHECK (bucket_id = ''voter-photos'')';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Authenticated delete voter-photos' AND polrelid = 'storage.objects'::regclass
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated delete voter-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''voter-photos'')';
  END IF;
END $$;


