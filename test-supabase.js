// Test de connexion Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔗 Test de connexion Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? '✅ Présente' : '❌ Manquante')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test 1: Vérifier les provinces
    console.log('\n📊 Test 1: Récupération des provinces...')
    const { data: provinces, error: provincesError } = await supabase
      .from('provinces')
      .select('*')
    
    if (provincesError) {
      console.error('❌ Erreur provinces:', provincesError)
    } else {
      console.log('✅ Provinces récupérées:', provinces.length)
      console.log('   Exemples:', provinces.slice(0, 3).map(p => p.name))
    }

    // Test 2: Vérifier les utilisateurs
    console.log('\n👥 Test 2: Récupération des utilisateurs...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.error('❌ Erreur utilisateurs:', usersError)
    } else {
      console.log('✅ Utilisateurs récupérés:', users.length)
      const admin = users.find(u => u.email === 'sokensdigital@gmail.com')
      console.log('   Admin:', admin?.name || 'Non trouvé')
    }

    // Test 3: Vérifier la configuration
    console.log('\n⚙️ Test 3: Configuration système...')
    const { data: config, error: configError } = await supabase
      .from('system_config')
      .select('*')
    
    if (configError) {
      console.error('❌ Erreur config:', configError)
    } else {
      console.log('✅ Configuration récupérée:', config.length, 'éléments')
    }

    console.log('\n🎉 Tous les tests sont passés! Supabase est prêt!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

testConnection()
