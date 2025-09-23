## Audit approfondi des erreurs et incohérences (UI/UX, Fonctionnel, Logique, Sécurité, Performance)

Note: Chaque anomalie est décrite avec Gravité, Impact, Preuve (référence code) et Recommandation.

### 1) UI/UX

1.1 Libellés de statuts incohérents entre UI et DB
- Gravité: Haute
- Impact: Compréhension utilisateur, métriques fausses, mauvais filtrage
- Preuve: `src/pages/Results.tsx` (valeurs FR comme « saisi », « en_attente ») vs DB `procès_verbaux.status` (`pending | entered | validated | anomaly | published`) dans `src/lib/supabase.ts`
- Recommandation: Centraliser un enum partagé, adapter tous les écrans et migrations de données.

1.2 Terminologie non uniforme (FR/EN)
- Gravité: Moyenne
- Impact: Frictions d’usage et cognition (e.g. « pending » vs « En attente »)
- Preuve: `src/lib/supabase.ts` enums EN; UI en FR
- Recommandation: Stratégie d’i18n (FR primaire), dictionnaire central, mapping unique vers DB.

1.3 Actions visibles sans autorisation claire
- Gravité: Haute
- Impact: Confusion + risques d’erreur (utilisateur voit « Gestion » ou « Publier » sans droit)
- Preuve: `src/pages/Dashboard.tsx` (boutons Actions rapides), `src/pages/UserManagement.tsx`
- Recommandation: Masquer/disable selon rôle, infobulles explicatives, skeletons pour accès restreints.

1.4 États de chargement et d’erreur limités
- Gravité: Moyenne
- Impact: Manque de feedback, abandon d’action
- Preuve: `ElectionManagement.tsx`, `Results.tsx`, `UserManagement.tsx` affichent loaders mais gèrent peu les erreurs (alerte simple)
- Recommandation: Composants homogènes d’erreur/retry, toasts normalisés, journalisation côté client.

1.5 Accessibilité (A11y) insuffisante
- Gravité: Moyenne
- Impact: Difficulté d’usage (clavier, lecteurs d’écran)
- Preuve: Boutons icônes sans `aria-label`, contrastes dépendants des classes Tailwind; absence de focus styles
- Recommandation: Vérifier via axe, ajouter labels ARIA, gérer focus visible, contraste AA.

1.6 Navigation non protégée et non guidée
- Gravité: Haute
- Impact: Utilisateurs atteignent des vues inutiles/vides (ex. `Results` sans élection sélectionnée)
- Preuve: `src/App.tsx` routes non gardées; `Results.tsx` autoselect mais pas de guard sémantique
- Recommandation: Redirections basées sur rôle et contexte (élection active), onboarding minimal.

### 2) Fonctionnel

2.1 Création d’élection: écriture candidats incohérente
- Gravité: Haute
- Impact: Erreurs d’insertion, données orphelines
- Preuve: `ElectionManagement.tsx` utilise `is_priority` et `election_id = data.id` (mais `data` semble être un tableau et le type DB expose `is_our_candidate`)
- Recommandation: Corriger payload (récupérer `data[0].id`), aligner champ (`is_our_candidate`) et relation (table de jointure si nécessaire).

2.2 Références territoriales non garanties
- Gravité: Haute
- Impact: Requêtes échouent si tables manquantes
- Preuve: `Dashboard.tsx` compte `provinces`; schéma non montré dans types
- Recommandation: S’assurer de l’existence des tables `provinces/departments/communes/arrondissements` et FKs; sinon adapter l’UI.

2.3 Métriques des PV incorrectes
- Gravité: Haute
- Impact: KPI faux, décisions invalides
- Preuve: `Results.tsx` calcule `pvsSaisis` via `status === 'saisi'`; DB a `entered`
- Recommandation: Harmoniser statuts, ajouter vues SQL de métriques atomiques.

2.4 Gestion utilisateurs incomplète
- Gravité: Moyenne
- Impact: Provisionnement fragile, rôles erronés
- Preuve: `AuthContext.tsx` crée par défaut un utilisateur « observateur » si absent
- Recommandation: Provisionnement côté serveur (trigger/edge func) post-auth; formulaire d’invitation admin.

2.5 Notifications locales non persistées
- Gravité: Moyenne
- Impact: Perte d’historique, pas de multi-device
- Preuve: `NotificationContext.tsx` seulement en mémoire
- Recommandation: Relier à table `notifications`, activer realtime, RLS par utilisateur.

2.6 Filtres et recherche utilisateurs limités
- Gravité: Basse
- Impact: Productivité
- Preuve: `UserManagement.tsx` filtrage côté client uniquement
- Recommandation: Ajouter pagination/tri serveur et recherche SQL (indices, FTS si nécessaire).

### 3) Logique/Code

3.1 Logs sensibles en production
- Gravité: Haute
- Impact: Fuite d’info (clés, URLs)
- Preuve: `src/lib/supabase.ts` logue clé anon (même partielle)
- Recommandation: Conditionner logs à `import.meta.env.DEV`; supprimer sorties sensibles.

3.2 Types DB non générés automatiquement
- Gravité: Moyenne
- Impact: Divergence types UI/DB silencieuse
- Preuve: Types écrits manuellement dans `src/lib/supabase.ts`
- Recommandation: `supabase gen types typescript` + pipeline CI pour régénération.

3.3 Noms de table avec caractères spéciaux
- Gravité: Moyenne
- Impact: Erreurs d’échappement/outillage
- Preuve: `procès_verbaux`
- Recommandation: Renommer en `pvs` (ou `proces_verbaux`), créer vue alias pour rétrocompatibilité.

3.4 Accès direct au `window.location.reload()`
- Gravité: Basse
- Impact: UX et état du cache
- Preuve: `ElectionManagement.tsx` après création
- Recommandation: Invalider caches React Query et mettre à jour l’état local plutôt que reload.

3.5 Sélecteurs/joins supposés mais non sécurisés
- Gravité: Moyenne
- Impact: Null/undefined runtime
- Preuve: `UserManagement.tsx` sélectionne `voting_centers(name)` sans guard strict
- Recommandation: Utiliser `select` typé, vérifier nullité, afficher placeholder.

### 4) Sécurité

4.1 Routes non protégées côté client
- Gravité: Haute
- Impact: Exposition d’actions à des rôles non autorisés (même si RLS bloque la DB)
- Preuve: `src/App.tsx` – aucune vérification de rôle
- Recommandation: Wrapper de routes `RequireRole`, redirection vers `/login` ou page 403.

4.2 Provisionnement et rôle par défaut côté client
- Gravité: Moyenne
- Impact: Élévation involontaire/erreurs de périmètre
- Preuve: `AuthContext.tsx`
- Recommandation: Logique serveur (edge functions) + policies RLS strictes, tests sécurité.

4.3 Stockage des médias (PV, signatures)
- Gravité: Haute (potentiel)
- Impact: Exposition d’images sensibles
- Preuve: Champs `pv_photo_url`, `signature_photo_url` sans règles visibles
- Recommandation: Buckets privés, URLs signées, permissions par rôle/périmètre, expirations courtes.

### 5) Performance

5.1 Comptages multiples séquentiels
- Gravité: Moyenne
- Impact: Latences tableau de bord
- Preuve: `Dashboard.tsx` 5+ requêtes count séparées
- Recommandation: Vue SQL agrégée (ex. `dashboard_stats`) + fetch unique; paralléliser au besoin.

5.2 Filtrage client sur grandes listes
- Gravité: Moyenne
- Impact: Lags UI, mémoire
- Preuve: `UserManagement.tsx` filtre côté client
- Recommandation: Pagination/tri serveur, indices SQL.

5.3 Absence de mémoïsation/cohérence cache
- Gravité: Basse
- Impact: Requêtes répétitives
- Preuve: Données dashboard non réutilisées; pas d’invalidation fine
- Recommandation: Normaliser caches React Query, clés stables, invalidations ciblées.

### 6) Données & Schéma

6.1 Alignement des colonnes et relations
- Gravité: Haute
- Impact: Requêtes cassées, données incohérentes
- Preuve: `Results.tsx` utilise `votes_received`, `voting_bureaux.election_id`; types montrent `votes`, pas de `election_id` sur `voting_bureaux`
- Recommandation: Corriger schéma (ou requêtes), ajouter vues/fonctions dédiées (e.g. `get_election_stats`).

6.2 Policies RLS à vérifier
- Gravité: Haute
- Impact: Accès non autorisé ou trop restrictif
- Preuve: Nombreux scripts `fix-*.sql`/`configure-all-rls-policies.sql`
- Recommandation: Revue complète des policies, tests d’accès par rôle, matrices de permissions.

### 7) End-User Quality

7.1 Aide et guidage
- Gravité: Basse
- Impact: Courbe d’apprentissage
- Preuve: Peu d’aides contextuelles sur écrans clés (Results, Elections)
- Recommandation: Tooltips, checklists, mini-onboarding.

7.2 Cohérence visuelle
- Gravité: Basse
- Impact: Perception de qualité
- Preuve: Variantes de badges/boutons disparates
- Recommandation: Design tokens, composants variants standardisés (shadcn), doc UI.

### 8) Plan d’action (priorisé)

P0 (2–5 jours)
- Harmoniser statuts PV (UI/DB), corriger `Results.tsx`, créer enum partagé.
- Protéger routes/Actions par rôle (RequireRole) + masquage UI.
- Corriger création d’élection (payload candidats, id, champs).
- Supprimer logs sensibles en prod; audit buckets médias.

P1 (1–2 semaines)
- Notifications persistées + realtime; écrans d’erreur/retry homogènes.
- Générer types Supabase; pagination/tri serveur sur Users.
- Vue SQL pour dashboard; réduire les requêtes multiples.

P2 (2–4 semaines)
- Refonte PV (saisie/validation/publication) + pièces jointes + historique.
- Gestion territoriale complète + imports CSV.
- A11y/i18n, qualité visuelle, onboarding.

### 9) Contrôles de validation (DoD)

- Tests manuels sur chaque rôle (4 profils) pour les écrans protégés.
- Vérification consistante des statuts PV sur DB et UI.
- Scan A11y de base (axe) sans erreurs critiques.
- Vérif perf: Dashboard < 500ms sur réseau local avec vue agrégée.
- Revue sécurité: aucune donnée sensible en logs; URLs signées opérationnelles.

—
Ce document consolide les erreurs détectées et propose des remédiations concrètes et priorisées pour améliorer l’expérience, la fiabilité et la sécurité.