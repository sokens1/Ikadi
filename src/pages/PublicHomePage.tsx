
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, TrendingUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ElectionData {
  id: string;
  title: string;
  election_date: string;
  status: string;
}

interface CandidateResult {
  id: string;
  name: string;
  party: string;
  votes: number;
  percentage: number;
  color: string;
}

interface PublicResults {
  election: ElectionData | null;
  participation: number;
  resultsProgress: number;
  candidates: CandidateResult[];
  totalVoters: number;
  totalCenters: number;
}

const PublicHomePage = () => {
  const [results, setResults] = useState<PublicResults>({
    election: null,
    participation: 0,
    resultsProgress: 0,
    candidates: [],
    totalVoters: 0,
    totalCenters: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Couleurs pour les candidats
  const candidateColors = [
    "#1e40af", // Bleu
    "#dc2626", // Rouge
    "#16a34a", // Vert
    "#7c3aed", // Violet
    "#ea580c", // Orange
    "#0891b2", // Cyan
    "#be123c", // Rose
    "#65a30d", // Lime
  ];

  useEffect(() => {
    fetchPublicResults();
  }, []);

  const fetchPublicResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer la prochaine élection ou l'élection en cours
      const { data: elections, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('election_date', { ascending: true })
        .limit(1);

      if (electionsError) throw electionsError;

      if (!elections || elections.length === 0) {
        setResults(prev => ({ ...prev, election: null }));
        setLoading(false);
        return;
      }

      const currentElection = elections[0];

      // Récupérer les statistiques globales
      const [votersResult, centersResult, pvsResult, candidatesResult] = await Promise.all([
        supabase.from('voters').select('id', { count: 'exact' }),
        supabase.from('voting_centers').select('id', { count: 'exact' }),
        supabase.from('procès_verbaux').select('id', { count: 'exact' }),
        supabase
          .from('election_candidates')
          .select(`
            candidates(id, name, party),
            candidate_results(votes)
          `)
          .eq('election_id', currentElection.id)
      ]);

      if (votersResult.error) throw votersResult.error;
      if (centersResult.error) throw centersResult.error;
      if (pvsResult.error) throw pvsResult.error;
      if (candidatesResult.error) throw candidatesResult.error;

      const totalVoters = votersResult.count || 0;
      const totalCenters = centersResult.count || 0;
      const totalPVs = pvsResult.count || 0;

      // Calculer la participation (simulation basée sur les PVs traités)
      const participation = totalCenters > 0 ? Math.min((totalPVs / totalCenters) * 100, 100) : 0;
      const resultsProgress = totalCenters > 0 ? Math.min((totalPVs / totalCenters) * 100, 100) : 0;

      // Traiter les résultats des candidats
      const candidates: CandidateResult[] = [];
      if (candidatesResult.data) {
        let totalVotes = 0;
        
        // Calculer le total des voix
        candidatesResult.data.forEach((item: any) => {
          if (item.candidate_results && item.candidate_results.length > 0) {
            totalVotes += item.candidate_results.reduce((sum: number, result: any) => sum + (result.votes || 0), 0);
          }
        });

        // Calculer les pourcentages
        candidatesResult.data.forEach((item: any, index: number) => {
          if (item.candidates) {
            const candidateVotes = item.candidate_results 
              ? item.candidate_results.reduce((sum: number, result: any) => sum + (result.votes || 0), 0)
              : 0;
            
            candidates.push({
              id: item.candidates.id,
              name: item.candidates.name,
              party: item.candidates.party || 'Indépendant',
              votes: candidateVotes,
              percentage: totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0,
              color: candidateColors[index % candidateColors.length]
            });
          }
        });

        // Trier par nombre de voix (décroissant)
        candidates.sort((a, b) => b.votes - a.votes);
      }

      setResults({
        election: currentElection,
        participation: Math.round(participation * 10) / 10,
        resultsProgress: Math.round(resultsProgress * 10) / 10,
        candidates,
        totalVoters,
        totalCenters
      });

    } catch (err) {
      console.error('Erreur lors du chargement des résultats:', err);
      setError('Impossible de charger les résultats. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
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
          <div className="flex justify-center items-center mb-4">
            <h2 className="text-4xl font-bold text-white mr-4">
              Résultats en Temps Réel
            </h2>
            <Button
              onClick={fetchPublicResults}
              disabled={loading}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Suivez les résultats des élections en direct avec transparence et sécurité
          </p>
        </div>

        {/* Current Election Info */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="ml-2 text-white">Chargement des données...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <AlertCircle className="w-8 h-8 text-red-300" />
            <span className="ml-2 text-red-300">{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Élection en Cours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.election ? (
                  <>
                    <h3 className="text-xl font-bold mb-2">{results.election.title}</h3>
                    <p className="text-blue-100">
                      {new Date(results.election.election_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-blue-100">Aucune élection en cours</p>
                )}
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
                  {results.participation}%
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${results.participation}%` }}
                  ></div>
                </div>
                <p className="text-blue-100 text-sm mt-2">
                  {results.totalVoters.toLocaleString()} électeurs inscrits
                </p>
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
                  {results.resultsProgress}%
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${results.resultsProgress}%` }}
                  ></div>
                </div>
                <p className="text-blue-100 text-sm mt-2">
                  {results.totalCenters} centres de vote
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Chart */}
        {!loading && !error && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gov-blue">Résultats Provisoires</CardTitle>
              <p className="text-gray-600">
                {results.candidates.length > 0 
                  ? `Basés sur ${results.resultsProgress}% des procès-verbaux traités`
                  : 'Aucun résultat disponible pour le moment'
                }
              </p>
            </CardHeader>
            <CardContent>
              {results.candidates.length > 0 ? (
                <div className="space-y-4">
                  {results.candidates.map((candidate, index) => (
                    <div key={candidate.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gov-gray">{candidate.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({candidate.party})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg" style={{ color: candidate.color }}>
                            {candidate.percentage.toFixed(1)}%
                          </span>
                          <p className="text-sm text-gray-500">
                            {candidate.votes.toLocaleString()} voix
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${candidate.percentage}%`, 
                            backgroundColor: candidate.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun candidat enregistré pour cette élection</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Couverture Territoriale</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-100">Centres de vote</span>
                  <span className="font-bold">{results.totalCenters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Électeurs inscrits</span>
                  <span className="font-bold">{results.totalVoters.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Statut</span>
                  <span className="font-bold text-green-300">
                    {results.election ? 'En cours' : 'Aucune élection'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Transparence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-100">Résultats en temps réel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-100">Traçabilité complète</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-blue-100">Sécurité renforcée</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-gov-blue font-bold text-sm">iK</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">iKadi</h3>
                  <p className="text-blue-100 text-sm">République Gabonaise</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="text-white font-semibold mb-2">Système Électoral</h4>
              <p className="text-blue-100 text-sm">
                Transparence • Sécurité • Fiabilité
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-blue-100 text-sm mb-2">
                © 2024 iKadi - République Gabonaise
              </p>
              <p className="text-blue-200 text-xs">
                Système de Gestion Électorale Sécurisé
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomePage;
