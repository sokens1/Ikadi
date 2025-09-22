-- RLS Storage: autoriser lecture publique et upload par utilisateurs authentifiés sur le bucket pv-uploads
-- À exécuter dans Supabase SQL Editor

-- 1) S'assurer que le bucket existe (si déjà créé côté dashboard, cette commande échouera sans conséquence)
-- NOTE: Cette commande nécessite des droits de service. Si indisponible, ignorez-la.
-- SELECT storage.create_bucket('pv-uploads', public := true);

-- 2) Activer RLS sur storage.objects (généralement déjà activé)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3) Lecture publique des objets du bucket pv-uploads
DROP POLICY IF EXISTS "Public can read pv-uploads" ON storage.objects;
CREATE POLICY "Public can read pv-uploads" ON storage.objects
FOR SELECT
USING (bucket_id = 'pv-uploads');

-- 4) Upload par utilisateurs authentifiés dans pv-uploads
DROP POLICY IF EXISTS "Auth can upload to pv-uploads" ON storage.objects;
CREATE POLICY "Auth can upload to pv-uploads" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pv-uploads' AND auth.role() = 'authenticated'
);

-- 5) Mise à jour/suppression par l'uploader (optionnel)
DROP POLICY IF EXISTS "Owner can update pv-uploads" ON storage.objects;
CREATE POLICY "Owner can update pv-uploads" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'pv-uploads' AND (owner = auth.uid() OR auth.role() = 'service_role')
)
WITH CHECK (
  bucket_id = 'pv-uploads' AND (owner = auth.uid() OR auth.role() = 'service_role')
);

DROP POLICY IF EXISTS "Owner can delete pv-uploads" ON storage.objects;
CREATE POLICY "Owner can delete pv-uploads" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'pv-uploads' AND (owner = auth.uid() OR auth.role() = 'service_role')
);

-- 6) Facultatif: assouplir la création de PV si l'utilisateur n'a pas le rôle 'agent-saisie'
-- (Utiliser si vous voyez encore "new row violates row-level security policy" sur la table procès_verbaux)
-- DROP POLICY IF EXISTS "Agents can create PV" ON public."procès_verbaux";
-- CREATE POLICY "Authenticated can create PV" ON public."procès_verbaux"
-- FOR INSERT
-- WITH CHECK (auth.role() = 'authenticated');


