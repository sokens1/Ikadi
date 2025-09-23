import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, TrendingUp, Calendar, MapPin, Share2, Facebook, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchElectionById } from '../api/elections';
import { fetchElectionSummary } from '../api/results';
import { toast } from 'sonner';

// Icone WhatsApp (SVG minimal)
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M27.5 16c0 6.352-5.148 11.5-11.5 11.5-2.012 0-3.904-.516-5.548-1.42L4.5 27.5l1.47-5.8A11.42 11.42 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16Z" fill="#25D366"/>
    <path d="M13.9 10.7c-.2-.45-.41-.46-.6-.47-.16-.01-.34-.01-.52-.01s-.48.07-.73.35c-.25.28-.96.94-.96 2.3 0 1.36.98 2.67 1.12 2.86.14.19 1.9 3.04 4.73 4.14 2.34.92 2.82.74 3.33.69.51-.05 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.52-.32-.27-.14-1.64-.81-1.9-.91-.25-.09-.44-.14-.63.14-.19.28-.73.91-.9 1.09-.16.19-.33.21-.61.07-.27-.14-1.14-.42-2.18-1.34-.8-.71-1.34-1.58-1.5-1.86-.16-.28-.02-.43.12-.57.12-.12.28-.33.42-.5.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.62-1.53-.86-2.08Z" fill="#fff"/>
  </svg>
);

interface ElectionData {
  id: string;
  title: string;
  election_date: string;
  status: string;
  description?: string;
  localisation?: string;
}

interface CandidateResult {
  candidate_id: string;
  candidate_name: string;
  party_name: string;
  total_votes: number;
  percentage: number;
  rank: number;
}

interface ElectionResults {
  election: ElectionData | null;
  total_voters: number;
  total_votes_cast: number;
  participation_rate: number;
  candidates: CandidateResult[];
  last_updated: string;
}

const ElectionResults: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (electionId) {
      fetchElectionResults(electionId);
    }
  }, [electionId]);

  const fetchElectionResults = async (id: string) => {
    try {
      setLoading(true);
      
      // Récupérer les données de l'élection
      const election = await fetchElectionById(id);
      if (!election) {
        throw new Error('Élection non trouvée');
      }

      // Récupérer les résultats depuis election_result_summary
      // Utilise le service de résultats
      const summaryData = await fetchElectionSummary(id);

      // Calculer les totaux
      const totalVotes = summaryData?.reduce((sum, candidate) => sum + (candidate.total_votes || 0), 0) || 0;
      const totalVoters = election.nb_electeurs || 0;
      const participationRate = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;

      setResults({
        election,
        total_voters: totalVoters,
        total_votes_cast: totalVotes,
        participation_rate: participationRate,
        candidates: (summaryData || []).map((c: any) => ({
          candidate_id: c.candidate_id,
          candidate_name: c.candidate_name,
          party_name: c.party_name ?? c.party ?? '',
          total_votes: c.total_votes || 0,
          percentage: c.percentage || 0,
          rank: c.rank || 0
        })),
        last_updated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = results?.election?.title || 'Résultats d\'élection';
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Lien copié dans le presse-papiers');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue mx-auto mb-4"></div>
          <p className="text-gov-gray">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🗳️</div>
          <h1 className="text-2xl font-bold text-gov-dark mb-2">Aucun résultat disponible</h1>
          <p className="text-gov-gray mb-6">
            {error || 'Les résultats de cette élection ne sont pas encore disponibles.'}
          </p>
          <Button onClick={() => navigate('/')} className="bg-gov-blue text-white hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const winner = results.candidates.find(c => c.rank === 1);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gov-blue text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">iKADI</h1>
                <p className="text-white/80 text-xs sm:text-sm truncate">Résultats d'élection</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('whatsapp')}
                className="text-white hover:bg-white/20"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="text-white hover:bg-white/20"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('copy')}
                className="text-white hover:bg-white/20"
              >
                <LinkIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gov-dark mb-2">
              {results.election?.title}
            </h1>
            {results.election?.localisation && (
              <p className="text-gov-gray flex items-center justify-center gap-2 text-sm sm:text-base">
                <MapPin className="w-4 h-4" />
                {results.election.localisation}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 text-xs sm:text-sm text-gov-gray flex-wrap">
              <span className="flex items-center gap-1 min-w-0">
                <Calendar className="w-4 h-4" />
                {new Date(results.election?.election_date || '').toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <Badge variant="outline" className="border-gov-blue text-gov-blue">
                {results.election?.status}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques principales */}
      <section className="bg-slate-200 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="text-center">
              <CardContent className="pt-5 sm:pt-6">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-gov-blue mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-gov-dark">{results.total_voters.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gov-gray">Électeurs inscrits</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5 sm:pt-6">
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-gov-blue mx-auto mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-gov-dark">{results.total_votes_cast.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gov-gray">Bulletins exprimés</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5 sm:pt-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gov-blue rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">%</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gov-dark">{results.participation_rate.toFixed(1)}%</div>
                <div className="text-xs sm:text-sm text-gov-gray">Taux de participation</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Résultats des candidats */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gov-dark mb-6 sm:mb-8 text-center">Résultats par candidat</h2>
          
          {results.candidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗳️</div>
              <h3 className="text-xl font-semibold text-gov-dark mb-2">Aucun résultat disponible</h3>
              <p className="text-gov-gray">Les résultats de cette élection ne sont pas encore publiés.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {results.candidates.map((candidate, index) => (
                <Card key={candidate.candidate_id} className={`${index === 0 ? 'border-gov-blue border-2' : ''}`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gov-blue' : 'bg-slate-400'
                        }`}>
                          {candidate.rank}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gov-dark truncate">{candidate.candidate_name}</h3>
                          <p className="text-gov-gray text-sm truncate">{(candidate as any).party_name || (candidate as any).party || ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold text-gov-dark">
                          {candidate.total_votes.toLocaleString()}
                        </div>
                        <div className="text-xs sm:text-sm text-gov-gray">voix</div>
                        <div className="text-base sm:text-lg font-semibold text-gov-blue">
                          {candidate.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="mt-3 sm:mt-4 p-3 bg-gov-blue/10 rounded-lg">
                        <div className="flex items-center justify-center text-gov-blue font-semibold">
                          🏆 Candidat en tête
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gov-blue text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-white/80">
              ©2025 iKADI - Plateforme de gestion électorale. Tous droits réservés.
            </p>
            <p className="text-white/60 text-sm mt-2">
              Dernière mise à jour: {new Date(results.last_updated).toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ElectionResults;
