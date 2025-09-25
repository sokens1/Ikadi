
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex">
      {/* Section gauche - Fond bleu avec image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gov-blue to-gov-blue-dark flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Dessins en rapport avec les élections */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/election-icons.svg" 
            alt="" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        {/* Fond avec motif subtil */}
        <div className="absolute inset-0 z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.1)"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        {/* Carte supérieure */}
        <Link to="/election-results?type=legislative" className="block mb-4">
          <Card className="bg-white/90 shadow-2xl border-0 w-full max-w-xs h-[100px] flex items-center justify-center hover:bg-white/100 transition-all transform hover:scale-105">
            <CardHeader className="py-2">
              <CardTitle className="text-center text-base text-gray-800">
                 Elections Législatives
              </CardTitle>
              <p className="text-center text-gray-600 text-xs mt-1">
                Résultats officiels par bureau et par centre
              </p>
            </CardHeader>
          </Card>
        </Link>

        {/* Carte inférieure */}
        <Link to="/election-results?type=local" className="block">
          <Card className="bg-white/90 shadow-2xl border-0 w-full max-w-xs h-[100px] flex items-center justify-center hover:bg-white/100 transition-all transform hover:scale-105">
            <CardHeader className="py-2">
              <CardTitle className="text-center text-base text-gray-800">
                Elections Locales
              </CardTitle>
              <p className="text-center text-gray-600 text-xs mt-1">
                Résultats officiels par bureau et par centre
              </p>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Section droite - Formulaire */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gov-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">iK</span>
                </div>
                <div className="text-left">
                  <h1 className="text-gov-blue font-bold text-3xl">iKadi</h1>
                  <p className="text-gray-600 text-sm">Gestion Électorale</p>
                </div>
              </div>
            </Link>
          </div>

          <Card className="bg-white shadow-2xl border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-center text-2xl text-gray-800">
                Connexion
              </CardTitle>
              <p className="text-center text-gray-600 text-sm">
                Accédez à votre tableau de bord sécurisé
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@gabon.ga"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-gray-200 focus:ring-gov-blue focus:border-gov-blue transition-colors"
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
                      className="h-12 border-gray-200 focus:ring-gov-blue focus:border-gov-blue pr-12 transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                  className="w-full h-12 bg-gov-blue hover:bg-gov-blue-dark text-white font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link 
                  to="/" 
                  className="text-sm text-gov-blue hover:text-gov-blue-dark hover:underline transition-colors"
                >
                  ← Retour à l'accueil public
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
