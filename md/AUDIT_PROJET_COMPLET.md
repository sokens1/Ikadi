## Audit complet du projet o'Hitu-ResElec (fusion)

### 1) Contexte et objectifs
- **Nom**: o'Hitu-ResElec / EWANA ELECTIONS CENTRAL
- **Domaine**: Gestion centralisée des élections (Gabon)
- **Objectifs**:
  - Centraliser les données électorales et assurer leur intégrité
  - Administrer les élections (config, territoires, sièges)
  - Automatiser saisie/validation des PV et publication des résultats
  - Suivi/KPI en temps réel et audit trail

### 2) Stack et architecture
- **Frontend**: React 18, TypeScript, Vite, React Router v6, TailwindCSS, shadcn-ui, Radix UI, React Hook Form, Zod, TanStack Query
- **Backend/BaaS**: Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **Organisation**: Pages (`Dashboard`, `ElectionManagement`, `Results`, `UserManagement`, `Login`, etc.), Contextes (`AuthContext`, `NotificationContext`), composants UI factorisés

### 3) Intervenants (rôles)
- **Super-Administrateur**: administration globale, gestion des utilisateurs, configuration système, publication
- **Agent de Saisie**: saisie votants/PV, collecte des résultats, signalement d’anomalies
- **Validateur**: contrôle qualité, validation des PV et des données, vérification par bureau
- **Observateur**: lecture seule (statistiques, rapports, exports)

Rôles tels que codés: `super-admin`, `agent-saisie`, `validateur`, `observateur`.

### 4) Fonctionnalités principales
- **Authentification & Sessions**: Supabase Auth, persistance session; provisionnement simplifié côté client si user absent
- **Dashboard**: prochaine élection, compte à rebours, compteurs (électeurs, centres, bureaux, PV en attente), activités récentes, actions rapides
- **Elections**: liste/consultation, assistant de création, extraction localisation depuis description, (option) ajout candidats
- **Utilisateurs**: liste + filtres recherche/rôle/statut, activation/désactivation, édition de base
- **Résultats & PV**: sélection élection, saisie/validation/publication, stats globales (taux de saisie, PV en attente, voix candidat prioritaire)
- **Structures**: `voting_centers` et `voting_bureaux`, coordonnées, responsables, volumes
- **Votants**: registres rattachés centre/bureau
- **Notifications (client)**: contexte local non persisté (compteur non lus)

### 5) Données et schéma (Supabase)
- Tables clés: `users`, `elections`, `voting_centers`, `voting_bureaux`, `candidates`, `voters`, `procès_verbaux`, `candidate_results`, `activity_logs`, `notifications`
- Vues/Fonctions: `dashboard_stats`, `election_results_summary`, `get_election_stats`, `get_candidate_results`
- Territoires: références à `provinces/departments/communes/arrondissements` (confirmer existence et FKs)
- RLS/Policies: scripts de configuration et correctifs présents au dépôt

### 6) Flux métiers
- Création d’élection → saisie paramètres → insertion DB → (option) création candidats → supervision Dashboard/Results
- Saisie PV → contrôles de cohérence → statut saisi/entered → envoi pour validation
- Validation PV → marquage validé/anomalie (motif) → consolidation
- Publication → résultats agrégés → diffusion
- Gestion utilisateurs → rôles, affectations aux centres/bureaux, activation

### 7) UI/UX et accessibilité
- UI moderne shadcn/Tailwind, responsive
- À renforcer: états d’erreur/retry uniformes, a11y (aria-labels, focus), cohérence terminologique FR/EN

### 8) Sécurité et conformité
- Variables d’env obligatoires (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- RLS à vérifier/renforcer selon rôles et périmètres
- Stockage médias (PV/signatures) à sécuriser via buckets privés et URLs signées

### 9) Avancées et axes d’amélioration
- Points forts: architecture moderne, schéma structuré, UI claire, scripts SQL fournis
- Manques: tests automatisés, guards de routes par rôle, notifications persistées, harmonisation statuts PV, import/export de masse

### 10) Recommandations prioritaires
- Harmoniser statuts PV UI/DB (enum partagé) et corriger requêtes `Results`
- Protéger routes/actions par rôle (RequireRole) et masquer UI selon permissions
- Persister `notifications` (CRUD + realtime) et auditer RLS
- Générer les types Supabase pour éviter divergences TS/DB
- Créer vues SQL pour dashboard/consolidations afin de réduire les requêtes
- Sécuriser logs: retirer clés/env du console output en prod

### 11) Commandes
- `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`

### 12) Hypothèses et limites
- Certaines tables territoriales référencées ne figurent pas explicitement dans les types
- Des modules (campagne, conversations) sont temporairement désactivés

---
Ce document fusionne et déduplique `AUDIT_PROJET.md` et `audit.md`, offrant une vue consolidée et actionnable du projet.