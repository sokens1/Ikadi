## Audit du projet o'Hitu-ResElec

### 1) Contexte
- **Domaine**: Gestion électorale (préparation, saisie, validation et publication des résultats).
- **Stack**: React 18 + TypeScript, Vite, TailwindCSS, shadcn-ui, Radix UI, TanStack Query, React Router, Supabase (Auth, DB, RLS), Zod.
- **But**: Outil interne pour organiser les élections, gérer les structures (centres/bureaux), administrer les utilisateurs et traiter les procès-verbaux (PV) jusqu’à la publication.
- **Hebergement cible**: Front statique (Vite) + Backend BaaS Supabase.

### 2) Acteurs (intervenants)
- **Super Admin**: administration globale, création d’élections, gestion des utilisateurs et des structures, publication.
- **Agent de saisie**: saisie des PV et des résultats, chargement des photos (PV, signatures), création de votants.
- **Validateur**: contrôle/validation des PV saisis, gestion des anomalies.
- **Observateur**: consultation en lecture seule (tableaux de bord, résultats agrégés).

Rôles détectés dans le code: `super-admin`, `agent-saisie`, `validateur`, `observateur` (voir `src/contexts/AuthContext.tsx`, `src/lib/supabase.ts`).

### 3) Fonctionnalités principales
- **Authentification & Sessions**
  - Connexion via Supabase Auth (email/mot de passe) et persistance locale (`localStorage`).
  - Récupération du profil dans la table `users` et attribution d’un rôle par défaut si absent.

- **Tableau de bord (Dashboard)**
  - Prochaine élection (titre, date, statut, compte à rebours).
  - Statistiques: électeurs (`voters`), centres (`voting_centers`), bureaux (`voting_bureaux`), PV en attente (`procès_verbaux`).
  - Activités récentes synthétiques (derniers votants, élections créées, PV soumis).
  - Actions rapides: ajouter votant, créer élection, saisir PV, gestion.

- **Gestion des élections**
  - Liste des élections depuis `elections` (titre, date, statut, localisation extraite de `description`).
  - Détail d’une élection (vue dédiée `ElectionDetailView`).
  - Création d’élection via un assistant (`ElectionWizard`) avec enregistrement Supabase.
  - Option de création de candidats associés (table `candidates`).

- **Gestion des utilisateurs**
  - Liste, filtres (rôle, statut, recherche), activation/désactivation.
  - Rôles pris en charge: super admin, agent de saisie, validateur, observateur.
  - Références éventuelles à un centre (`assigned_center_id` → `voting_centers(name)`).

- **Résultats & PV**
  - Sélection d’une élection, suivi global: taux de saisie, PV saisis/en attente, total de bureaux.
  - Saisie des résultats (onglet "entry"), validation des PV (onglet "validation"), publication (onglet "publish").
  - Données: `procès_verbaux`, `candidate_results`, `candidates`.

- **Centres & Bureaux de vote**
  - Structures: `voting_centers` et `voting_bureaux` avec responsables, coordonnées, volumes.

- **Votants**
  - Gestion des électeurs (`voters`), rattachement éventuel à centre/bureau.

- **Notifications (client)**
  - Contexte de notifications local (non persisté), compteur d’alertes non lues.

### 4) Données et schéma (Supabase)
Tables clés (voir `src/lib/supabase.ts` et scripts SQL):
- `users` (rôle, centre assigné, activité) — RLS à configurer/renforcer.
- `elections` (type, date, statut, objectifs, géographie, budget).
- `voting_centers` (coordonnées, contacts, volumes, rattachements géographiques).
- `voting_bureaux` (centre, inscrits, urnes, président).
- `candidates` (nom, parti, photo, indicateur interne).
- `voters` (identité, contact, rattachements centre/bureau).
- `procès_verbaux` (totaux, statuts: pending/entered/validated/anomaly/published, photos, signataires, traçabilité).
- `candidate_results` (voix par candidat/PV).
- `activity_logs`, `notifications` (prévu côté DB). 
Vues/Fonctions:
- Vues: `dashboard_stats`, `election_results_summary`.
- Fonctions: `get_election_stats`, `get_candidate_results`.

Scripts SQL fournis: création/validation de structure, corrections de RLS/policies, données initiales (admin), ajouts de colonnes/photos.

### 5) Navigation et architecture front
- **Routing**: `react-router-dom` avec routes: `/` (publique), `/login`, `/dashboard`, `/elections`, `/centers`, `/users`, `/results`, `/voters`, wildcard `*` → NotFound.
- **State/Fetching**: TanStack Query pour requêtes et cache; contextes `AuthContext`, `NotificationContext`.
- **UI**: shadcn-ui/Radix + Tailwind; composants UI factorisés dans `src/components/ui`.

### 6) Sécurité et gouvernance des données
- **Variables d’environnement**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` obligatoires et vérifiées au runtime.
- **Clé service role**: non exposée (commentée comme non à exposer côté client).
- **RLS/Policies**: plusieurs scripts `fix-*.sql`, `configure-all-rls-policies.sql` indiquent une intention de durcir les accès; à vérifier sur l’instance Supabase.
- **Logs**: `activity_logs` prévu pour audit.

Risques/points d’attention:
- Traçabilité et validation des rôles côté UI vs RLS: s’assurer que les policies DB implémentent les mêmes restrictions que l’interface.
- Données sensibles des PV (photos/signatures): contrôler le storage (buckets Supabase) et les ACL.
- Disparités de libellés de statuts entre UI et DB (ex: `pending` vs `en_attente`/`saisi`) dans `Results.tsx` à harmoniser.

### 7) Flux métiers clés
- **Création d’élection**: Auth requise → assistant → insertion `elections` (+ candidats optionnels) → affichage dans la liste → supervision via Dashboard/Results.
- **Saisie de PV**: Agent de saisie remplit les totaux et résultats candidats → statut `entered`/équivalent.
- **Validation de PV**: Validateur contrôle, peut marquer `validated` ou `anomaly` avec description.
- **Publication**: Super Admin publie des résultats agrégés.
- **Gestion utilisateurs**: Super Admin crée/édite, assigne rôle et centre, active/désactive.

### 8) Éléments manquants / améliorations proposées
- Harmoniser les statuts PV côté UI/DB et centraliser les enums.
- Mettre en place des guards de route selon le rôle (ex: `/users` réservé aux super-admins).
- Persister les notifications (utiliser table `notifications` et réconcilier avec contexte).
- Ajout d’upload média (PV, signatures) via buckets Supabase avec règles d’accès.
- Tests e2e et linters de cohérence types (types DB partagés via génération supabase).
- Documentation d’installation (env, migrations SQL, commandes) dans le README.

### 9) Commandes et scripts
- `npm run dev`: serveur de dev Vite.
- `npm run build` / `npm run preview`: build et prévisualisation.
- `npm run lint`: ESLint configurée.

### 10) Arborescence (extraits utiles)
- `src/pages`: `Dashboard`, `ElectionManagement`, `Results`, `UserManagement`, `Voters`, `VotingCenters`, `Login`, `PublicHomePage`.
- `src/components/elections`: `ElectionWizard`, `ElectionDetailView`, modals.
- `src/components/results`: `DataEntrySection`, `ValidationSection`, `PublishSection`, etc.
- `src/contexts`: `AuthContext`, `NotificationContext`.
- `src/lib`: `supabase.ts`, `utils.ts`.
- Racine: nombreux scripts SQL pour structure et RLS.

### 11) Hypothèses et limites de l’audit
- L’audit se base sur le code présent et la structure SQL fournie; certaines entités (ex: `provinces`) sont référencées mais non visibles dans le code source SQL inclus.
- Certaines fonctionnalités sont désactivées/commentées (ex: CampaignManagement, Conversations) et ne sont pas auditées en profondeur.

### 12) KPI / Indicateurs suivis (observés)
- Compteurs globaux: électeurs, centres, bureaux, PV en attente.
- Taux de saisie par élection, voix du candidat prioritaire, écart au second.
- Synthèse d’activité récente (créations, soumissions).

---
Document produit automatiquement à partir de l’exploration du dépôt et du code source.