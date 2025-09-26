# Gestion d'affichage conditionnelle pour les modales des candidats

## 📋 Objectif

Implémenter une gestion d'affichage intelligente pour les modales de détails des candidats qui masque les contrôles de tri et affiche des messages d'état vide appropriés quand il n'y a pas de données détaillées.

## ✅ Fonctionnalités implémentées

### 1. Fonctions de vérification des données candidats
```typescript
// Fonctions pour vérifier les données des candidats dans la modale
const hasCandidateCenterData = () => {
  return candidateCenters && candidateCenters.length > 0;
};

const hasCandidateBureauData = () => {
  return candidateBureaux && candidateBureaux.length > 0;
};

const hasAnyCandidateData = () => {
  return hasCandidateCenterData() || hasCandidateBureauData();
};
```

### 2. Contrôles de tri conditionnels
- **Affichés seulement** : Quand il y a des données à trier (`hasAnyCandidateData()`)
- **Masqués** : Quand il n'y a pas de données (évite la confusion)

### 3. Messages d'état vide par onglet
- **Onglet "Par centre"** : Message spécifique pour les données de centres
- **Onglet "Par bureau"** : Message spécifique pour les données de bureaux
- **Design cohérent** : Icônes et messages appropriés pour chaque contexte

## 🎯 Comportement selon l'état des données

### 📊 Onglet "Par centre" avec données
```typescript
{hasCandidateCenterData() ? (
  <div className="space-y-3 mt-3">
    {/* Liste des centres avec données détaillées */}
  </div>
) : (
  <div className="mt-6 p-8 text-center">
    {/* Message d'état vide avec icône Building */}
  </div>
)}
```

### 📭 Onglet "Par centre" sans données
- **Icône** : Building (représentant les centres)
- **Titre** : "Aucune donnée par centre"
- **Description** : "Les résultats détaillés par centre de vote ne sont pas encore disponibles pour ce candidat."

### 📊 Onglet "Par bureau" avec données
```typescript
{hasCandidateBureauData() ? (
  <div className="overflow-x-auto mt-3 -mx-3 sm:mx-0">
    {/* Tableau des bureaux avec données */}
  </div>
) : (
  <div className="mt-6 p-8 text-center">
    {/* Message d'état vide avec icône Target */}
  </div>
)}
```

### 📭 Onglet "Par bureau" sans données
- **Icône** : Target (représentant les bureaux)
- **Titre** : "Aucune donnée par bureau"
- **Description** : "Les résultats détaillés par bureau de vote ne sont pas encore disponibles pour ce candidat."

## 🎨 Design et UX

### Éléments toujours visibles
1. **Header de la modale** : Titre "Détails du candidat"
2. **Informations du candidat** : Nom et parti
3. **Onglets de navigation** : "Par centre" et "Par bureau"
4. **Design cohérent** : Même style que la version avec données

### Éléments conditionnels
1. **Contrôles de tri** : Masqués quand pas de données
2. **Contenu des onglets** : Remplacé par messages d'état vide appropriés
3. **Icônes contextuelles** : Building pour centres, Target pour bureaux

### Messages d'état vide
- **Design** : Carte centrée avec icône dans un cercle gris
- **Titre** : Message spécifique selon le type de données
- **Description** : Explication claire et contextuelle
- **Style** : Cohérent avec le design général de l'application

## 🔧 Implémentation technique

### Structure conditionnelle des contrôles de tri
```typescript
{/* Contrôles de tri pour les modales des candidats - affichés seulement s'il y a des données */}
{hasAnyCandidateData() && (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border">
    {/* Contrôles de tri */}
  </div>
)}
```

### Structure conditionnelle des onglets
```typescript
<TabsContent value="center">
  {hasCandidateCenterData() ? (
    // Contenu avec données
  ) : (
    // Message d'état vide
  )}
</TabsContent>

<TabsContent value="bureau">
  {hasCandidateBureauData() ? (
    // Contenu avec données
  ) : (
    // Message d'état vide
  )}
</TabsContent>
```

### Vérification des données
- **hasCandidateCenterData()** : Vérifie si `candidateCenters` contient des données
- **hasCandidateBureauData()** : Vérifie si `candidateBureaux` contient des données
- **hasAnyCandidateData()** : Vérifie si au moins un type de données est disponible

## 📱 Expérience utilisateur

### Avant la gestion conditionnelle
- ❌ Contrôles de tri visibles sans données
- ❌ Tableaux vides avec messages d'erreur génériques
- ❌ Interface confuse et non-informative
- ❌ Pas de guidance contextuelle

### Après la gestion conditionnelle
- ✅ Interface claire selon l'état des données
- ✅ Onglets visibles pour montrer les fonctionnalités
- ✅ Messages informatifs contextuels par onglet
- ✅ Contrôles de tri masqués quand non pertinents
- ✅ Design cohérent et professionnel

## 🎯 Cas d'usage

### Scénario 1 : Candidat sans données détaillées
- **Contrôles de tri** : Masqués
- **Onglet "Par centre"** : Message d'état vide avec icône Building
- **Onglet "Par bureau"** : Message d'état vide avec icône Target
- **UX** : Interface claire et informative

### Scénario 2 : Candidat avec données partielles (centres seulement)
- **Contrôles de tri** : Visibles
- **Onglet "Par centre"** : Données réelles avec contrôles de tri
- **Onglet "Par bureau"** : Message d'état vide
- **UX** : Fonctionnalités disponibles selon les données

### Scénario 3 : Candidat avec données complètes
- **Contrôles de tri** : Visibles et fonctionnels
- **Onglet "Par centre"** : Données complètes avec tri
- **Onglet "Par bureau"** : Données complètes avec tri
- **UX** : Interface complète et interactive

## 📊 Avantages

### Pour l'utilisateur
- **Clarté** : Interface adaptée à l'état réel des données
- **Guidance** : Messages informatifs contextuels
- **Cohérence** : Design uniforme dans tous les états
- **Anticipation** : Onglets montrent les fonctionnalités disponibles

### Pour le développeur
- **Maintenabilité** : Code organisé avec logique conditionnelle claire
- **Performance** : Rendu optimisé selon l'état des données
- **Extensibilité** : Facile d'ajouter d'autres conditions
- **Testabilité** : Fonctions de vérification isolées

## 🚀 Impact

### Amélioration de l'UX
- **Interface adaptative** : S'ajuste automatiquement aux données disponibles
- **Messages contextuels** : Information claire et spécifique par onglet
- **Navigation intuitive** : Onglets toujours disponibles pour guidance
- **Design cohérent** : Même qualité visuelle dans tous les états

### Optimisation technique
- **Rendu conditionnel** : Évite le rendu inutile d'éléments vides
- **Code propre** : Logique séparée et réutilisable
- **Performance** : Moins d'éléments DOM quand pas nécessaire
- **Maintenabilité** : Structure claire et modulaire

## 🔗 Cohérence avec la section principale

Cette gestion d'affichage conditionnelle pour les modales des candidats suit la même logique que celle implémentée pour la section "Analyse détaillée" :

- **Même approche** : Vérification des données et affichage conditionnel
- **Même design** : Messages d'état vide cohérents
- **Même UX** : Interface adaptative et informative
- **Même structure** : Code organisé et maintenable

---

**Date d'implémentation** : ${new Date().toLocaleDateString('fr-FR')}
**Statut** : ✅ Terminé
**Impact** : 🎯 Amélioration majeure de l'expérience utilisateur dans les modales des candidats
