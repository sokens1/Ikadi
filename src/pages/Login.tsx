
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
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-gov-blue font-bold text-lg">iK</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-2xl">iKadi</h1>
                <p className="text-blue-100 text-xs">Gestion Électorale</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Image SVG */}
        <div className="flex-1 flex items-center justify-center">
          <img 
            src="/images/Login-user.svg" 
            alt="Login Illustration" 
            className="max-w-md w-full h-auto object-contain"
          />
        </div>

        {/* Texte en bas */}
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Système de Gestion Électorale</h2>
          <p className="text-blue-100 text-sm max-w-md">
            Plateforme sécurisée pour la gestion transparente et efficace des processus électoraux au Gabon
          </p>
        </div>
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
