# 🗄️ GUIDE DE MIGRATION SUPABASE - EWANA ELECTIONS CENTRAL

## 📋 **PROCESSUS COMPLET DE MIGRATION**

### **Étape 1 : Préparation de l'environnement**

#### 1.1 Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter les credentials :
   - **Project URL** : `https://your-project.supabase.co`
   - **Anon Key** : `eyJ...`
   - **Service Role Key** : `eyJ...`

#### 1.2 Installation des dépendances
```bash
cd ewana-elections-central
npm install @supabase/supabase-js
```

#### 1.3 Configuration des variables d'environnement
Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### **Étape 2 : Exécution de la migration**

#### 2.1 Via l'interface Supabase
1. Aller dans **SQL Editor** de votre projet Supabase
2. Copier le contenu du fichier `supabase-migration.sql`
3. Exécuter le script complet

#### 2.2 Via CLI Supabase (optionnel)
```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser le projet
supabase init

# Lier au projet distant
supabase link --project-ref your-project-ref

# Appliquer la migration
supabase db push
```

### **Étape 3 : Configuration de l'authentification**

#### 3.1 Activer l'authentification par email
1. Aller dans **Authentication > Settings**
2. Activer **Email** dans les providers
3. Configurer les templates d'email

#### 3.2 Créer le premier utilisateur admin
```sql
-- Exécuter dans SQL Editor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'directeur@ewana.ga',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
```

### **Étape 4 : Configuration du client Supabase**

#### 4.1 Créer le client Supabase
Créer `src/lib/supabase.ts` :
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client avec service role pour les opérations admin
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

#### 4.2 Types TypeScript
Créer `src/types/database.ts` :
```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'super-admin' | 'agent-saisie' | 'validateur' | 'observateur'
          assigned_center_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'super-admin' | 'agent-saisie' | 'validateur' | 'observateur'
          assigned_center_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'super-admin' | 'agent-saisie' | 'validateur' | 'observateur'
          assigned_center_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // ... autres tables
    }
  }
}
```

### **Étape 5 : Migration des données existantes**

#### 5.1 Script de migration des données mock
Créer `scripts/migrate-mock-data.ts` :
```typescript
import { supabaseAdmin } from '../src/lib/supabase'

async function migrateMockData() {
  // Migrer les provinces
  const provinces = [
    { name: 'Estuaire', code: 'EST' },
    { name: 'Haut-Ogooué', code: 'HOG' },
    // ... autres provinces
  ]
  
  const { data: provincesData } = await supabaseAdmin
    .from('provinces')
    .insert(provinces)
    .select()

  // Migrer les élections mock
  const elections = [
    {
      title: "Législatives 2024 - Moanda",
      type: "Législatives",
      election_date: "2024-12-15",
      status: "À venir",
      description: "Circonscription de la Commune de Moanda, 1er Arrondissement",
      seats_available: 1,
      budget: 50000000,
      vote_goal: 8000,
      province_id: provincesData?.find(p => p.name === 'Haut-Ogooué')?.id,
      // ... autres champs
    }
  ]

  const { data: electionsData } = await supabaseAdmin
    .from('elections')
    .insert(elections)
    .select()

  console.log('Migration terminée !')
}

migrateMockData()
```

### **Étape 6 : Mise à jour du code frontend**

#### 6.1 Remplacer les données mock par les appels Supabase
Exemple pour la page Voters :
```typescript
// Avant (données mock)
const [voters, setVoters] = useState<Voter[]>(mockVoters)

// Après (Supabase)
const [voters, setVoters] = useState<Voter[]>([])

useEffect(() => {
  async function fetchVoters() {
    const { data, error } = await supabase
      .from('voters')
      .select(`
        *,
        voting_centers(name),
        voting_bureaux(name)
      `)
    
    if (error) {
      console.error('Erreur:', error)
      return
    }
    
    setVoters(data || [])
  }
  
  fetchVoters()
}, [])
```

#### 6.2 Mise à jour des fonctions CRUD
```typescript
// Ajouter un votant
const handleAddVoter = async (voterData: Voter) => {
  const { data, error } = await supabase
    .from('voters')
    .insert([voterData])
    .select()
  
  if (error) {
    toast.error('Erreur lors de l\'ajout')
    return
  }
  
  setVoters(prev => [...prev, data[0]])
  toast.success('Votant ajouté avec succès')
}

// Mettre à jour un votant
const handleUpdateVoter = async (id: string, updates: Partial<Voter>) => {
  const { data, error } = await supabase
    .from('voters')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    toast.error('Erreur lors de la mise à jour')
    return
  }
  
  setVoters(prev => prev.map(v => v.id === id ? data[0] : v))
  toast.success('Votant mis à jour')
}
```

### **Étape 7 : Configuration des politiques de sécurité**

#### 7.1 Vérifier les politiques RLS
Les politiques sont déjà configurées dans le script de migration, mais vous pouvez les ajuster selon vos besoins :

```sql
-- Exemple : Politique pour les agents de saisie
CREATE POLICY "Agents can manage assigned center voters" ON voters
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'agent-saisie' 
    AND assigned_center_id = voters.center_id
  )
);
```

### **Étape 8 : Tests et validation**

#### 8.1 Tests des fonctionnalités principales
1. **Authentification** : Connexion/déconnexion
2. **CRUD Votants** : Ajout, modification, suppression
3. **Import CSV** : Upload et traitement des fichiers
4. **Filtres** : Recherche et filtrage
5. **Pagination** : Navigation entre les pages

#### 8.2 Tests de performance
```sql
-- Vérifier les index
EXPLAIN ANALYZE SELECT * FROM voters WHERE last_name ILIKE '%MOUKANI%';

-- Statistiques des tables
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables;
```

### **Étape 9 : Déploiement et monitoring**

#### 9.1 Configuration de production
1. **Variables d'environnement** : Configurer les vraies valeurs
2. **Backup automatique** : Activer dans Supabase
3. **Monitoring** : Configurer les alertes

#### 9.2 Scripts de maintenance
```sql
-- Nettoyage des logs anciens (à exécuter périodiquement)
DELETE FROM activity_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Optimisation des statistiques
ANALYZE;
```

## 🔧 **FONCTIONNALITÉS AVANCÉES**

### **Recherche full-text**
```sql
-- Index pour la recherche dans les noms
CREATE INDEX idx_voters_fulltext ON voters 
USING gin(to_tsvector('french', first_name || ' ' || last_name));

-- Recherche
SELECT * FROM voters 
WHERE to_tsvector('french', first_name || ' ' || last_name) 
@@ plainto_tsquery('french', 'Jean MOUKANI');
```

### **Géolocalisation des centres**
```sql
-- Recherche de centres proches
SELECT *, ST_Distance(coordinates, ST_Point(0.3936, 9.4573)) as distance
FROM voting_centers 
WHERE ST_DWithin(coordinates, ST_Point(0.3936, 9.4573), 1000)
ORDER BY distance;
```

### **Export des données**
```sql
-- Export CSV des votants
COPY (
  SELECT 
    v.last_name as "Nom",
    v.first_name as "Prénom",
    vc.name as "Centre",
    vb.name as "Bureau",
    v.quartier as "Quartier",
    v.phone as "Téléphone"
  FROM voters v
  LEFT JOIN voting_centers vc ON vc.id = v.center_id
  LEFT JOIN voting_bureaux vb ON vb.id = v.bureau_id
) TO '/tmp/votants.csv' WITH CSV HEADER;
```

## 📊 **MONITORING ET MÉTRIQUES**

### **Dashboard de monitoring**
```sql
-- Vue pour le monitoring
CREATE VIEW system_metrics AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
  (SELECT COUNT(*) FROM elections WHERE status = 'En cours') as active_elections,
  (SELECT COUNT(*) FROM voters) as total_voters,
  (SELECT COUNT(*) FROM procès_verbaux WHERE status = 'validated') as validated_pv,
  (SELECT COUNT(*) FROM notifications WHERE is_read = false) as unread_notifications;
```

## 🚨 **SÉCURITÉ ET CONFORMITÉ**

### **Audit trail complet**
Toutes les actions sont loggées dans `activity_logs` :
- Création/modification/suppression d'entités
- Connexions utilisateurs
- Import/export de données
- Validation des PV

### **Sauvegarde et récupération**
- **Backup automatique** : Configuré dans Supabase
- **Point-in-time recovery** : Disponible
- **Export régulier** : Scripts automatisés

## 📞 **SUPPORT ET MAINTENANCE**

### **Commandes utiles**
```bash
# Vérifier la connexion
supabase status

# Redémarrer les services
supabase stop && supabase start

# Voir les logs
supabase logs
```

### **Résolution de problèmes courants**
1. **Erreur de connexion** : Vérifier les variables d'environnement
2. **Permissions insuffisantes** : Vérifier les politiques RLS
3. **Performance lente** : Analyser les index et requêtes
4. **Données corrompues** : Utiliser les backups

---

## ✅ **CHECKLIST DE MIGRATION**

- [ ] Projet Supabase créé
- [ ] Migration SQL exécutée
- [ ] Variables d'environnement configurées
- [ ] Client Supabase initialisé
- [ ] Types TypeScript générés
- [ ] Données mock migrées
- [ ] Code frontend mis à jour
- [ ] Politiques RLS testées
- [ ] Fonctionnalités testées
- [ ] Performance validée
- [ ] Monitoring configuré
- [ ] Documentation mise à jour

**🎉 Votre base de données Supabase est maintenant prête pour EWANA Elections Central !**





