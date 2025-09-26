
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Vote, Building, ArrowRight, Shield, CheckCircle, Users, BarChart3 } from 'lucide-react';
import { fetchAllElections } from '../api/elections';

interface Election {
  id: string;
  title: string;
  election_date: string;
  status: string;
  description?: string;
  localisation?: string;
  nb_electeurs?: number;
  is_published?: boolean;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [electionsLoading, setElectionsLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Charger les élections depuis la base de données
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setElectionsLoading(true);
        const electionsData = await fetchAllElections();
        setElections(electionsData || []);
        console.log('Élections chargées:', electionsData); // Debug pour voir les élections disponibles
      } catch (error) {
        console.error('Erreur lors du chargement des élections:', error);
      } finally {
        setElectionsLoading(false);
      }
    };

    fetchElections();
  }, []);

  const handleElectionRedirect = (type: 'legislative' | 'local') => {
    // Trouver l'élection correspondante dans la base de données
    const electionTypeMap = {
      legislative: ['Législative', 'Législatives', 'Legislative'],
      local: ['Locale', 'Locales', 'Local', 'Municipale', 'Municipales']
    };
    
    const targetTypes = electionTypeMap[type];
    const foundElection = elections.find(election => 
      targetTypes.some(targetType => 
        election.title?.toLowerCase().includes(targetType.toLowerCase()) ||
        election.description?.toLowerCase().includes(targetType.toLowerCase()) ||
        election.localisation?.toLowerCase().includes(targetType.toLowerCase())
      )
    );
    
    if (foundElection) {
      navigate(`/election/${foundElection.id}/results`);
    } else {
      toast({
        title: "Élection non disponible",
        description: `Aucune élection ${type === 'legislative' ? 'Législative' : 'Locale'} n'est disponible pour le moment.`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans iKadi",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Section gauche - Fond bleu avec sélection d'élection */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gov-blue via-blue-700 to-gov-blue-dark flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Logo */}
        <div className="absolute top-6 lg:top-8 left-6 lg:left-8">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-gov-blue font-bold text-sm lg:text-lg">iK</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl lg:text-2xl">iKadi</h1>
              <p className="text-blue-100 text-xs">Plateforme de gestion électorale</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col items-center justify-center text-center text-white max-w-lg px-4 pt-16">
          {/* Titre principal */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Choisissez votre élection
            </h2>
            <p className="text-blue-100 text-base lg:text-lg leading-relaxed">
              Sélectionnez le type d'élections pour accéder aux résultats.
            </p>
          </div>

           {/* Boutons de sélection d'élection */}
           <div className="space-y-3 lg:space-y-4 w-full max-w-md">
             {/* Bouton Élection Législative */}
            <button
               onClick={() => handleElectionRedirect('legislative')}
               disabled={electionsLoading}
              className={`w-full p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-white bg-[#A51C30] border-[#A51C30] hover:bg-[#A51C30] hover:border-[#A51C30] ${
                 electionsLoading ? 'opacity-50 cursor-not-allowed' : ''
               }`}
             >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-bold text-base lg:text-lg">Élections Législatives</h3>
                  <p className="text-xs lg:text-sm opacity-80">Élection des députés</p>
                </div>
                {!electionsLoading && <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform text-white/60" />}
              </div>
             </button>

             {/* Bouton Élection Locale */}
            <button
               onClick={() => handleElectionRedirect('local')}
               disabled={electionsLoading}
              className={`w-full p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-white bg-[#116917] border-[#116917] hover:bg-[#116917] hover:border-[#116917] ${
                 electionsLoading ? 'opacity-50 cursor-not-allowed' : ''
               }`}
             >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-bold text-base lg:text-lg">Élections Locales</h3>
                  <p className="text-xs lg:text-sm opacity-80">Élection des conseils municipaux</p>
                </div>
                {!electionsLoading && <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform text-white/60" />}
              </div>
             </button>
           </div>

          {/* Avantages de la plateforme */}
          <div className="mt-6 lg:mt-8 flex items-center justify-between gap-3 lg:gap-4 w-full max-w-md">
            <div className="flex items-center space-x-1 lg:space-x-2 text-blue-100">
              <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
              <span className="text-xs">Sécurisé</span>
            </div>
            <div className="flex items-center space-x-1 lg:space-x-2 text-blue-100">
              <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
              <span className="text-xs">Transparent</span>
            </div>
            <div className="flex items-center space-x-1 lg:space-x-2 text-blue-100">
              <Users className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
              <span className="text-xs">Accessible</span>
            </div>
          </div>
        </div>

      </div>

      {/* Section mobile - Boutons d'élection (visible uniquement sur mobile/tablette) */}
      <div className="lg:hidden bg-gradient-to-br from-gov-blue via-blue-700 to-gov-blue-dark text-white pt-8 pb-6 px-6">
        <div className="max-w-md mx-auto">
          {/* Logo mobile */}
        <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-gov-blue font-bold text-lg">iK</span>
              </div>
              <div className="text-left">
                <h1 className="text-white font-bold text-2xl">iKadi</h1>
                <p className="text-blue-100 text-xs">Plateforme de gestion électorale</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Choisissez votre élection
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Sélectionnez le type d'élection pour accéder aux résultats
            </p>
          </div>

          {/* Boutons de sélection d'élection mobile */}
          <div className="space-y-3">
            {/* Bouton Élection Législative */}
            <button
              onClick={() => handleElectionRedirect('legislative')}
              disabled={electionsLoading}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 text-white bg-[#A51C30] border-[#A51C30] hover:bg-[#A51C30] hover:border-[#A51C30] ${
                electionsLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <h3 className="font-bold text-base">Élection Législative</h3>
                  <p className="text-xs opacity-80">Élection des députés</p>
                </div>
                {!electionsLoading && <ArrowRight className="w-4 h-4 text-white/60" />}
              </div>
            </button>

            {/* Bouton Élection Locale */}
            <button
              onClick={() => handleElectionRedirect('local')}
              disabled={electionsLoading}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 text-white bg-[#116917] border-[#116917] hover:bg-[#116917] hover:border-[#116917] ${
                electionsLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <h3 className="font-bold text-base">Élection Locale</h3>
                  <p className="text-xs opacity-80">Élection des conseils municipaux</p>
                </div>
                {!electionsLoading && <ArrowRight className="w-4 h-4 text-white/60" />}
              </div>
            </button>
          </div>

          {/* Avantages de la plateforme mobile */}
          <div className="mt-4 flex flex-row justify-center gap-4">
            <div className="flex items-center space-x-1 text-blue-100">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-xs">Sécurisé</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-100">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs">Transparent</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-100">
              <Users className="w-3 h-3 text-green-400" />
              <span className="text-xs">Accessible</span>
            </div>
              </div>
            </div>
        </div>

      {/* Section droite - Formulaire */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">

          <Card className="bg-white shadow-2xl border-0">
            <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
               <CardTitle className="text-center text-xl sm:text-2xl text-gray-800">
                 Connexion
            </CardTitle>
               <p className="text-center text-gray-600 text-xs sm:text-sm">
              Accédez à votre tableau de bord sécurisé
            </p>
          </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@gabon.ga"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                    className="h-10 sm:h-12 border-gray-200 focus:ring-gov-blue focus:border-gov-blue transition-colors text-sm sm:text-base"
                />
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                      className="h-10 sm:h-12 border-gray-200 focus:ring-gov-blue focus:border-gov-blue pr-10 sm:pr-12 transition-colors text-sm sm:text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                      className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                   className="w-full h-10 sm:h-12 bg-gov-blue hover:bg-gov-blue-dark text-white font-medium transition-colors text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       <span className="hidden sm:inline">Connexion...</span>
                       <span className="sm:hidden">Connexion...</span>
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Plateforme sécurisée de gestion électorale
                </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
