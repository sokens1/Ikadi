## Audit de l’onglet Dashboard

Cette analyse couvre ce qui est bien fait, ce qui ne l’est pas, les données statiques à rendre dynamiques, et recense les fichiers concernés.

### Fichiers correspondants
- `src/pages/Dashboard.tsx` (écran principal)
- `src/lib/supabase.ts` (client et types DB)
- `src/contexts/AuthContext.tsx` (contexte auth)
- `src/components/ui/*` (cartes, badges, boutons, icônes shadcn/Radix)
- Tables côté DB attendues: `elections`, `voters`, `voting_centers`, `voting_bureaux`, `procès_verbaux`, (référence à) `provinces`

### Ce qui est bien fait
- **Architecture UI claire**: cartes KPI distinctes (électeurs, centres, bureaux, PV en attente), bannière élection avec compte à rebours.
- **Expérience utilisateur**: actions rapides (Ajouter Votant, Nouvelle Élection, Saisir PV, Gestion) facilitent la navigation.
- **Chargement initial**: `useEffect` dédié au chargement des données avec états `loading` et affichage de skeletons simples.
- **Utilisation de Supabase**: counts via `select('*', { count: 'exact', head: true })` pour récupérer uniquement les compteurs.
- **Composants UI**: shadcn + Tailwind pour une interface moderne et consistante.

### Problèmes et améliorations
1) Requêtes multiples séquentielles pour les KPI
- Problème: 5+ requêtes (élection, voters, centers, bureaux, provinces, PV) lancées séquentiellement → latence.
- Reco: créer une vue/fonction SQL agrégée (ex: `dashboard_stats`) et effectuer un seul fetch; ou paralléliser les requêtes.

2) Dépendance à des tables non garanties
- Problème: `provinces` est compté mais n’apparaît pas dans les types exposés.
- Reco: valider la table `provinces` et ses relations; sinon, retirer/adapter la métrique.

3) Données d’activité « fabriquées » côté client
- Problème: `recentActivities` compile manuellement des événements à partir de listes (voters, elections, pvs) sans vraie table d’audit.
- Reco: consommer `activity_logs` (si présent) pour un flux d’activité fiable; ajouter indices/tri côté DB.

4) Incohérence des statuts PV
- Problème: Dashboard compte `procès_verbaux` avec status `pending`, cohérent avec DB; ailleurs (Results) des libellés FR sont utilisés.
- Reco: enum centralisé pour les statuts et mapping i18n.

5) Gestion des erreurs limitée
- Problème: erreurs `try/catch` loggées en console, UX minimal.
- Reco: composant ErrorState avec options Retry/Support, toasts homogènes.

6) Compte à rebours dépend de champs non typés
- Problème: `end_time` utilisé sans typage dans `elections`.
- Reco: ajouter champ `end_time` typé en DB ou supprimer; afficher heures basées sur configuration élection.

7) Reload manuel de pages
- Problème (global): usage de `window.location.reload()` dans d’autres écrans (ex: Elections) qui impacte l’expérience globale.
- Reco: préférer invalidations React Query et mise à jour d’état.

### Données statiques à rendre dynamiques
- **Labels/terminologie**: statuts, titres, textes des badges → passer par un dictionnaire i18n (FR) avec fallback.
- **Prochaine élection (endTime)**: `endTime: "18h00"` par défaut; le statut aussi est fallback.
- **Activités récentes**: aujourd’hui construites côté client; rendre dynamique via table `activity_logs` et policies RLS.
- **Taux/Trends**: `votersRegistered.trend` est statique (`"+0%"`).

### Recommandations concrètes
- Créer une vue `dashboard_stats` (ou l’utiliser si déjà existante) retournant: `elections_en_cours`, `elections_a_venir`, `total_voters`, `total_centers`, `total_bureaux`, `pv_en_attente` et la prochaine élection.
- Remplacer les 5 requêtes par un seul appel vers cette vue/fonction.
- Introduire un système i18n (ex. dictionnaire JSON FR) et un enum `PVStatus` central avec mapping DB ↔ UI.
- Alimenter « Activité Récente » via `activity_logs` (SELECT récent, trié, limité), avec typage strict.
- Ajouter des états d’erreur uniformisés (composant d’erreur + Retry) et traces côté client (Sentry ou équivalent si possible).
- Paralléliser, si la vue n’est pas prête, les requêtes via `Promise.all`.

### Extraits et références (code)

Prochaine élection et compteurs:
```60:101:src/pages/Dashboard.tsx
// 1. Récupérer la prochaine élection
const { data: nextElection } = await supabase
  .from('elections')
  .select('*')
  .gte('election_date', new Date().toISOString())
  .order('election_date', { ascending: true })
  .limit(1)
  .single();

// 2. Compter les votants
const { count: votersCount } = await supabase
  .from('voters')
  .select('*', { count: 'exact', head: true });

// 3. Compter les centres de vote
const { count: centersCount } = await supabase
  .from('voting_centers')
  .select('*', { count: 'exact', head: true });
```

PV en attente:
```94:101:src/pages/Dashboard.tsx
// 6. Compter les PVs en attente
const { count: pvsCount } = await supabase
  .from('procès_verbaux')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'pending');
```

Activités récentes compilées côté client:
```100:121:src/pages/Dashboard.tsx
const activities = [];
// Derniers votants ajoutés
const { data: recentVoters } = await supabase
  .from('voters')
  .select('first_name, last_name, created_at')
  .order('created_at', { ascending: false })
  .limit(3);
// ... puis élections et PVs; tri local, puis slice(0, 5)
```

Objet `endTime` statique par défaut:
```168:179:src/pages/Dashboard.tsx
nextElection: nextElection ? {
  title: nextElection.title,
  date: nextElection.election_date,
  endTime: nextElection.end_time || "18h00",
  status: nextElection.status || "Programmée"
} : {
  title: "Aucune élection programmée",
  date: null,
  endTime: "",
  status: "Aucune"
},
```

### Plan d’action rapide (Dashboard)
- P0: Vue/fonction SQL `dashboard_stats` + un seul fetch; introduire `Promise.all` si transitoire.
- P0: Normaliser statuts PV et labels via enum + i18n.
- P1: Brancher « Activité Récente » sur `activity_logs`.
- P1: États d’erreur/Retry uniformisés + toasts normalisés.
- P2: Tendances dynamiques (calculer évolutions vs période précédente), configuration de `end_time` en DB.

---
Document focalisé sur l’onglet Dashboard avec références de code et recommandations concrètes.