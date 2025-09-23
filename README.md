## Ikadi — Documentation du projet

### Aperçu
- **Stack**: Vite, React 18, TypeScript, Tailwind CSS, shadcn-ui (Radix), TanStack Query, React Router, Supabase
- **But**: Application de gestion électorale (élections, centres/bureaux de vote, résultats, campagnes, utilisateurs) avec authentification Supabase et UI moderne.

### Points d’entrée et cycle d’exécution
- **index.html**: Contient la div `#root` montée par React.
- **src/main.tsx**: Monte l’app React et applique les styles globaux (`index.css`).
- **src/App.tsx**: Configure les providers (React Query, Tooltip, Auth, Notifications), le router et toutes les routes de pages.

```12:59:src/App.tsx
// Extrait — configuration du Router
<BrowserRouter>
  <Routes>
    <Route path="/" element={<PublicHomePage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/elections" element={<ElectionManagementUnified />} />
    <Route path="/centers" element={<VotingCenters />} />
    <Route path="/voters" element={<Voters />} />
    <Route path="/users" element={<UserManagement />} />
    <Route path="/results" element={<Results />} />
    <Route path="/campaign" element={<CampaignManagement />} />
    <Route path="/campaign/operation/:id" element={<OperationDetail />} />
    <Route path="/conversations" element={<Conversations />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### Architecture logicielle
- **Rendu**: SPA React via Vite, montée dans `#root`.
- **Routage**: `react-router-dom` v6 — routes déclaratives dans `src/App.tsx`.
- **Etat serveur**: TanStack Query (cache, retry, staleTime) initialisé dans `App` via `QueryClientProvider`.
- **Authentification & Session**: Contexte `AuthContext` basé sur Supabase Auth. Stockage léger dans `localStorage` pour session utilisateur.
- **Notifications**: Contexte `NotificationContext` pour file locale des notifications et compteur non lus.
- **Données**: Accès à Supabase via `src/lib/supabase.ts` (client Supabase configuré à partir de variables d’environnement Vite).
- **UI**: Composants shadcn-ui (Radix UI) sous `src/components/ui/*`. Icônes `lucide-react`. Styles Tailwind (`tailwind.config.ts`, `src/index.css`, `src/styles/design-system.css`).

### Palette iKADI et utilitaires Tailwind
Pour respecter les couleurs demandées:
- **Vert (header/nav)**: `#006400` → classe utilitaire: `.bg-ik-green`, `.text-ik-green`
- **Bleu (boutons primaires)**: `#1E90FF` → `.bg-ik-blue`, `.text-ik-blue`, ou bouton: `.btn-ik-primary`
- **Jaune (hover boutons)**: `#FDB913` → `.bg-ik-yellow`, `.text-ik-yellow` (déjà utilisé au hover de `.btn-ik-primary`)
- **Arrière-plan général**: `#F5F7FA` → `.bg-ik-bg`
- **Cartes chiffres clés**: `.ik-card-green` (fond vert, texte blanc) et `.ik-card-yellow` (fond jaune, texte gris foncé)

Ces utilitaires sont définis dans `src/index.css` (section "Utilitaires iKADI"). Exemple d’usage:

```tsx
// Bouton primaire
<Button className="btn-ik-primary">Connexion</Button>

// Header vert
<header className="bg-ik-green">…</header>

// Carte chiffres clés
<div className="ik-card-green rounded-lg p-5">…</div>
```

Animation de la section héro (zoom doux infini):
- Classe: `.ik-hero-zoom` (définie dans `src/index.css`)
- Appliquée sur une couche overlay pour l’effet de zoom subtil.

### Routage: pages principales
- **/** → `PublicHomePage` (Page d’accueil publique)
- **/login** → `Login`
- **/dashboard** → `Dashboard`
- **/elections** → `ElectionManagementUnified`
- **/centers** → `VotingCenters`
- **/voters** → `Voters`
- **/users** → `UserManagement`
- **/results** → `Results`
- **/campaign** → `CampaignManagement`
- **/campaign/operation/:id** → `OperationDetail`
- **/conversations** → `Conversations`
- **catch-all** → `NotFound`

### Emplacement de la HomePage
- La HomePage est gérée par `src/pages/PublicHomePage.tsx` et montée sur `/` dans `src/App.tsx`.

### Scripts NPM
- **dev**: démarre le serveur Vite en développement.
- **build**: construit l’application (production).
- **build:dev**: build en mode développement (source maps, etc.).
- **preview**: sert le build localement.
- **lint**: exécute ESLint.

```1:20:package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### Variables d’environnement (Vite)
Créer un fichier `.env.local` à la racine:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Notes:
- Ne jamais exposer de service role key côté client.

### Démarrage rapide
1. Node.js LTS installé.
2. Installer les dépendances: `npm i`
3. Configurer `.env.local` avec les variables Supabase.
4. Lancer en dev: `npm run dev`
5. Ouvrir l’URL affichée par Vite.

### Style et UI
- **Tailwind**: utilitaires via `tailwind.config.ts` et `src/index.css`.
- **shadcn-ui/Radix**: composants sous `src/components/ui/*`.
- **Icônes**: `lucide-react`.

### Hooks métiers
- `useElectionState`: gestion locale des élections (liste, filtrage, stats dérivées).
- `useElectionFilters`, `useElectionValidation`: utilitaires de filtrage/validation.

### Structure du projet (extrait)
- `src/main.tsx`: bootstrap React
- `src/App.tsx`: providers + routage
- `src/pages/*`: pages routées
- `src/contexts/*`: contextes Auth/Notifications
- `src/lib/supabase.ts`: client Supabase + types DB
- `src/components/ui/*`: librairie UI
- `src/styles/design-system.css`: styles additionnels

### Déploiement
- Build: `npm run build` → sortie Vite optimisée.
- Hébergement statique; configurer les variables d’env et le fallback SPA.

---

Questions fréquentes
- « Où est définie la page d’accueil ? » → `src/pages/PublicHomePage.tsx` (route `/`).
- « Où ajouter une nouvelle page ? » → créer un composant sous `src/pages` et l’enregistrer dans `src/App.tsx` via une nouvelle `<Route />`.
- « Comment accéder à la base ? » → utiliser `supabase` depuis `src/lib/supabase.ts` (et TanStack Query pour les requêtes avec cache).
