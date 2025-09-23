## Incohérences et fonctionnalités à ajouter (revue post-audit)

### 1) Incohérences fonctionnelles et techniques

1.1 Statuts des PV non harmonisés
- UI `Results.tsx` utilise des libellés FR (`saisi`, `en_attente`) alors que le schéma `procès_verbaux` définit: `pending | entered | validated | anomaly | published`.
- Impact: métriques erronées, filtres/onglets incohérents, risques de mauvais comptage.
- Reco: centraliser un enum des statuts (TS) mappé 1:1 avec la DB; migrer la donnée existante et adapter les requêtes/onglets.

1.2 Rôles présents mais aucune protection de routes
- Les rôles sont définis (`super-admin`, `agent-saisie`, `validateur`, `observateur`) mais pas de guards sur les routes sensibles (`/users`, `/results` validation/publish, etc.).
- Impact: exposition de vues/actions non autorisées côté client; dépendance uniquement RLS.
- Reco: créer un `RequireRole` HOC/Wrapper et protéger les routes + masquer actions UI selon le rôle.

1.3 Notifications non persistées vs table `notifications`
- Contexte `NotificationContext` purement local alors que la DB prévoit une table `notifications`.
- Impact: perte des notifications, absence d’historique, pas de multi-device.
- Reco: brancher le contexte à Supabase (CRUD + realtime) avec un adaptateur et RLS adaptée.

1.4 Incohérences sur `candidates`
- UI `ElectionWizard` tente d’insérer des champs (`is_priority`, `election_id`) alors que le type DB exposé indique `is_our_candidate`, sans relation directe affichée.
- Impact: erreurs d’insertion potentielles, données orphelines.
- Reco: aligner le modèle: ajouter lien `election_id` si requis ou table de jointure `election_candidates`; uniformiser `is_our_candidate`.

1.5 Références à `provinces` côté UI sans schéma visible complet
- Dashboard compte `provinces` mais le snapshot SQL ne montre pas la table. 
- Impact: erreurs à l’exécution si la table n’existe pas.
- Reco: valider et ajouter tables territoriales (`provinces`, `departments`, `communes`, `arrondissements`) et relations/indices.

1.6 Auth et profil utilisateur
- `AuthContext` crée un utilisateur par défaut (observateur) si non trouvé en DB, sans synchro avec Supabase Auth meta.
- Impact: profils partiels, dérive de rôles.
- Reco: hook de post-sign-in pour provisionner `users` (trigger RPC ou edge function) avec rôle et centre.

1.7 Contradiction de schéma dans `Results.tsx`
- Requêtes utilisent `candidate_results(votes_received, candidates(name))` et `election_id` côté `voting_bureaux`, non garantis par le type exposé.
- Impact: requêtes cassées.
- Reco: revoir colonnes (`votes`, pas `votes_received`) et relations; ajouter vues SQL dédiées pour l’écran résultats.

1.8 Variables d’environnement exposées en console
- `supabase.ts` logue URL et préfixes de clé.
- Impact: fuite d’info sur la clé anon (même partielle).
- Reco: supprimer les logs en prod, utiliser flags `import.meta.env.DEV`.

1.9 Usage de français avec caractères spéciaux pour noms de table
- Table `procès_verbaux` avec cédille/accents.
- Impact: échappement et portabilité (clients SQL, outils). 
- Reco: renommer en `proces_verbaux` (ou `pvs`) et créer vues alias si nécessaire.

1.10 Absence de validations/formats partagés
- Types côté TS et schéma DB pas générés automatiquement; duplication de types.
- Impact: dérives et régressions silencieuses.
- Reco: générer types via `supabase gen types typescript` et consommer depuis une lib unique.

### 2) Fonctionnalités à ajouter (gaps)

2.1 Workflow complet PV
- Écran de saisie PV par bureau avec scan/upload photo, OCR optionnel, contrôles de cohérence (sommes, taux de participation), statut transitoire.
- Écran de validation avec comparaison PV-photo et résultats saisis, gestion anomalies (motif, pièces jointes), historique.
- Publication avec verrouillage et versioning.

2.2 Gestion territoriale complète
- CRUD provinces/départements/communes/arrondissements, import CSV, affectations aux centres et bureaux, indexation.

2.3 Import/Export de masse
- Import CSV votants et centres/bureaux (avec validation et rollback par lot), export CSV/Excel des résultats.

2.4 Audit trail exploitable
- Interface de consultation des `activity_logs` avec filtres/date/utilisateur/entité, export et corrélation.

2.5 Notifications temps réel
- Persistance et push realtime Supabase, préférences utilisateur (types, canaux), marquage lu/non-lu cross-device.

2.6 Sécurité applicative avancée
- Guards de routes par rôle, masque UI, rate limiting des actions sensibles (edge functions), 2FA pour super-admins.

2.7 Supervision et KPI avancés
- Vues consolidation multi-niveaux (centre → commune → département → province → national), cartes, graphiques dynamiques, taux par heure.

2.8 Gestion des pièces jointes
- Buckets Supabase avec règles RLS par rôle et périmètre (centre/bureau), expirations d’URL signées, redimensionnement images.

2.9 Administration des utilisateurs renforcée
- Invitation par email, reset de mot de passe, assignation de périmètre multi-centres, gestion de rôles granulaires (scopes).

2.10 Qualité de données
- Dé-duplication votants (similarité nom/téléphone), contraintes uniques, validations Zod partagées côté front, nettoyage.

### 3) Recommandations priorisées (Roadmap)

Priorité P0 (bloquants)
- Harmoniser statuts PV UI/DB et corriger requêtes `Results.tsx`.
- Mettre en place guards de routes par rôle + masquage d’actions.
- Valider/ajouter tables territoriales et relations; aligner requêtes Dashboard.

Priorité P1 (courte échéance)
- Persister notifications + realtime.
- Générer types Supabase et supprimer duplications; centraliser enums.
- Sécuriser logs env; retirer clés des consoles en prod.
- Revoir modèle `candidates` (champ `is_our_candidate`, relation à élection).

Priorité P2 (moyen terme)
- Import/Export de masse robuste.
- Écrans PV complets (saisie/validation/publication) avec pièces jointes.
- Interface `activity_logs` et supervision KPI avancée.

### 4) Changements SQL/Schéma proposés (synthèse)
- Renommer `procès_verbaux` → `pvs` (ou `proces_verbaux`), créer vue de compatibilité si besoin.
- Ajouter tables manquantes territoriales si absentes; FK depuis `voting_centers`/`voting_bureaux`.
- Uniformiser `candidate_results.votes` (pas `votes_received`) et ajouter FK `election_id` là où nécessaire.
- Créer vues matérialisées pour le dashboard et la consolidation par niveau.
- Ajouter policies RLS par rôle/périmètre (centre/bureau) et tests de sécurité.

### 5) Tâches d’implémentation suggérées (dev frontend)
- Créer `auth/RequireRole.tsx` et appliquer sur routes; masquer boutons selon rôle.
- Introduire `@types/generated/supabase.ts` via génération; remplacer types internes.
- Extraire `StatusEnum` commun PV dans `src/lib/enums.ts` et adapter `Results.tsx`.
- Adapter `NotificationContext` pour CRUD Supabase + realtime.
- Nettoyer `supabase.ts` des logs sensibles en prod.

---
Document de revue complémentaire listant les écarts et ajouts priorisés, basé sur `AUDIT_PROJET.md` et `audit.md`.