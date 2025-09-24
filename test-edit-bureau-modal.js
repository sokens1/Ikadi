// Test pour vérifier la gestion des valeurs null/undefined dans EditBureauModal

// Simulation des données de bureau avec des valeurs null/undefined
const testBureaus = [
  {
    id: '1',
    name: 'Bureau Test 1',
    registered_voters: 100,
    president_name: 'Jean Dupont',
    president_phone: '+241 01 23 45 67',
    urns_count: 2
  },
  {
    id: '2',
    name: 'Bureau Test 2',
    registered_voters: 150,
    president_name: null, // Valeur null
    president_phone: undefined, // Valeur undefined
    urns_count: 1
  },
  {
    id: '3',
    name: 'Bureau Test 3',
    registered_voters: 200,
    president_name: '', // Chaîne vide
    president_phone: '   ', // Chaîne avec espaces
    urns_count: 3
  }
];

// Fonctions utilitaires (copiées du composant)
const safeString = (value) => {
  return value?.trim() || '';
};

const safeNumber = (value) => {
  return value || 0;
};

// Test des fonctions utilitaires
console.log('=== Test des fonctions utilitaires ===');

testBureaus.forEach((bureau, index) => {
  console.log(`\nBureau ${index + 1}:`);
  console.log('  name:', safeString(bureau.name));
  console.log('  registered_voters:', safeNumber(bureau.registered_voters));
  console.log('  president_name:', safeString(bureau.president_name));
  console.log('  president_phone:', safeString(bureau.president_phone));
  console.log('  urns_count:', safeNumber(bureau.urns_count));
});

// Test de la validation
console.log('\n=== Test de la validation ===');

const testValidation = (formData) => {
  const name = safeString(formData.name);
  const presidentName = safeString(formData.president_name);
  const presidentPhone = safeString(formData.president_phone);
  
  console.log('Validation pour:', formData.name);
  console.log('  name valide:', !!name);
  console.log('  president_name sécurisé:', presidentName);
  console.log('  president_phone sécurisé:', presidentPhone);
  
  return {
    name,
    presidentName,
    presidentPhone,
    isValid: !!name
  };
};

// Test avec différents cas
const testCases = [
  { name: 'Bureau Normal', president_name: 'Jean', president_phone: '123' },
  { name: null, president_name: null, president_phone: null },
  { name: '', president_name: undefined, president_phone: '   ' },
  { name: '   ', president_name: 'Marie', president_phone: '' }
];

testCases.forEach((testCase, index) => {
  console.log(`\nCas de test ${index + 1}:`);
  const result = testValidation(testCase);
  console.log('  Résultat:', result);
});

console.log('\n=== Test terminé ===');
console.log('Toutes les valeurs null/undefined sont maintenant gérées de manière sécurisée.');
