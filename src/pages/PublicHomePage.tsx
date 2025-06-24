
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, TrendingUp } from 'lucide-react';

const PublicHomePage = () => {
  // Mock data for public results
  const mockResults = {
    election: "Élections Législatives 2024",
    date: "15 Décembre 2024",
    participation: 67.8,
    resultsProgress: 85.2,
    candidates: [
      { name: "Candidat A", party: "Parti Alpha", votes: 45.2, color: "#1e40af" },
      { name: "Candidat B", party: "Parti Beta", votes: 32.1, color: "#dc2626" },
      { name: "Candidat C", party: "Parti Gamma", votes: 22.7, color: "#16a34a" },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gov-blue to-gov-blue-light">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-gov-blue font-bold text-lg">iK</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-2xl">iKadi</h1>
                <p className="text-blue-100 text-sm">République Gabonaise - Élections Transparentes</p>
              </div>
            </div>
            
            <Link to="/login">
              <Button className="bg-white text-gov-blue hover:bg-blue-50">
                Accès Directeur de Campagne
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Résultats en Temps Réel
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Suivez les résultats des élections en direct avec transparence et sécurité
          </p>
        </div>

        {/* Current Election Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Élection en Cours</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-2">{mockResults.election}</h3>
              <p className="text-blue-100">{mockResults.date}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Participation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-300 mb-2">
                {mockResults.participation}%
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${mockResults.participation}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Progression Dépouillement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-300 mb-2">
                {mockResults.resultsProgress}%
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${mockResults.resultsProgress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Chart */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-gov-blue">Résultats Provisoires</CardTitle>
            <p className="text-gray-600">
              Basés sur {mockResults.resultsProgress}% des procès-verbaux traités
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockResults.candidates.map((candidate, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gov-gray">{candidate.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({candidate.party})</span>
                    </div>
                    <span className="font-bold text-lg" style={{ color: candidate.color }}>
                      {candidate.votes}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${candidate.votes}%`, 
                        backgroundColor: candidate.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-blue-100">
            <p className="mb-2">© 2024 iKadi - République Gabonaise</p>
            <p className="text-sm">Système de Gestion Électorale Sécurisé et Transparent</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomePage;
