
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, TrendingUp, Loader2, AlertCircle, RefreshCw, Landmark, Vote, Megaphone } from 'lucide-react';
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

const HERO_IMAGE = 'https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/afp/2024/08/30/17/1725030898403.jpg/_jcr_content/renditions/cq5dam.thumbnail.cropped.1500.844.jpeg';

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

  const [totalBureaux, setTotalBureaux] = useState<number>(0);
  const [totalCandidats, setTotalCandidats] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [heroOk, setHeroOk] = useState<boolean>(true);

  const candidateColors = [
    "#1e40af",
    "#dc2626",
    "#16a34a",
    "#7c3aed",
    "#ea580c",
    "#0891b2",
    "#be123c",
    "#65a30d",
  ];

  useEffect(() => {
    fetchPublicResults();
  }, []);

  useEffect(() => {
    const targetDate = results.election ? new Date(results.election.election_date).getTime() : null;
    if (!targetDate) return;
    const tick = () => {
      const now = Date.now();
      const delta = Math.max(targetDate - now, 0);
      const days = Math.floor(delta / (1000 * 60 * 60 * 24));
      const hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((delta % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [results.election]);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGE;
    img.onload = () => setHeroOk(true);
    img.onerror = () => setHeroOk(false);
  }, []);

  const fetchPublicResults = async () => {
    try {
      setLoading(true);
      setError(null);
      // Priorité: élection au statut "En cours"
      const { data: running, error: runningError } = await supabase
        .from('elections')
        .select('*')
        .eq('status', 'En cours')
        .order('election_date', { ascending: false })
        .limit(1);
      if (runningError) throw runningError;

      let currentElection = running && running.length > 0 ? running[0] : null;

      // Fallback: dernière élection publiée
      if (!currentElection) {
        const { data: published, error: publishedError } = await supabase
          .from('elections')
          .select('*')
          .eq('is_published', true)
          .order('election_date', { ascending: false })
          .limit(1);
        if (publishedError) throw publishedError;
        currentElection = published && published.length > 0 ? published[0] : null;
      }

      if (!currentElection) {
        setResults(prev => ({ ...prev, election: null }));
        setLoading(false);
        return;
      }

      const [votersResult, centersResult, pvsResult, bureauxResult, candidatsCount] = await Promise.all([
        supabase.from('voters').select('id', { count: 'exact' }),
        supabase.from('voting_centers').select('id', { count: 'exact' }),
        supabase.from('procès_verbaux').select('id', { count: 'exact' }),
        supabase.from('voting_bureaux').select('id', { count: 'exact' }),
        supabase.from('candidates').select('id', { count: 'exact' })
      ]);
      if (votersResult.error) throw votersResult.error;
      if (centersResult.error) throw centersResult.error;
      if (pvsResult.error) throw pvsResult.error;
      if (bureauxResult.error) throw bureauxResult.error;
      if (candidatsCount.error) throw candidatsCount.error;
      const totalVoters = votersResult.count || 0;
      const totalCenters = centersResult.count || 0;
      const totalPVs = pvsResult.count || 0;
      setTotalBureaux(bureauxResult.count || 0);
      setTotalCandidats(candidatsCount.count || 0);
      const participation = totalCenters > 0 ? Math.min((totalPVs / totalCenters) * 100, 100) : 0;
      const resultsProgress = totalCenters > 0 ? Math.min((totalPVs / totalCenters) * 100, 100) : 0;
      const { data: candidatesAgg, error: candidatesError } = await supabase
        .from('election_candidates')
        .select(`
          candidates(id, name, party),
          candidate_results(votes)
        `)
        .eq('election_id', currentElection.id);
      if (candidatesError) throw candidatesError;
      const candidates: CandidateResult[] = [];
      if (candidatesAgg) {
        let totalVotes = 0;
        candidatesAgg.forEach((item: any) => {
          if (item.candidate_results && item.candidate_results.length > 0) {
            totalVotes += item.candidate_results.reduce((sum: number, r: any) => sum + (r.votes || 0), 0);
          }
        });
        candidatesAgg.forEach((item: any, index: number) => {
          if (item.candidates) {
            const candidateVotes = item.candidate_results
              ? item.candidate_results.reduce((sum: number, r: any) => sum + (r.votes || 0), 0)
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

  const electionTitle = 'Élection du premier arrondissement de Moanda';
  const dynamicTitle = results.election?.title || electionTitle;
  const canSeeResults = results.election ? Date.now() >= new Date(results.election.election_date).getTime() : false;

  return (
    <div className="min-h-screen bg-white">
      {/* Header avec dégradé visible */}
      <header className="border-b bg-gradient-to-b from-white via-white to-gov-blue/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gov-blue rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">iK</span>
              </div>
              <div>
                <h1 className="text-gov-blue font-bold text-2xl">iKADI</h1>
                <p className="text-gov-gray text-sm">Plateforme de gestion électorale</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-gov-gray">
              <a href="#" className="hover:text-gov-blue transition-colors">Accueil</a>
              <a href="#about" className="hover:text-gov-blue transition-colors">A propos</a>
              <a href="#infos" className="hover:text-gov-blue transition-colors">Infos électorales</a>
              <a href="#candidats" className="hover:text-gov-blue transition-colors">Candidats</a>
              <a href="#resultats" className="hover:text-gov-blue transition-colors">Résultats</a>
              <a href="#circonscriptions" className="hover:text-gov-blue transition-colors">Circonscriptions / Bureaux</a>
              <a href="#contact" className="hover:text-gov-blue transition-colors">Contact</a>
            </nav>
            {/* <Link to="/login">
              <Button className="bg-gov-blue text-white hover:bg-gov-blue/90 shadow-sm">
                Accès admin
              </Button>
            </Link> */}
          </div>
        </div>
      </header>

      {/* Hero Section avec image de fond appliquée sur la section + overlay + fallback */}
      <section
        className="relative min-h-[460px]"
        style={{
          backgroundImage: heroOk
            ? `url(${HERO_IMAGE})`
            : `linear-gradient(135deg, hsl(var(--gov-blue)) 0%, hsl(var(--gov-blue-light)) 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: heroOk ? 'fixed' : 'scroll'
        }}
      >
        <div className="absolute inset-0 bg-[rgba(8,47,73,0.55)]" />
        <div className="container mx-auto px-4 py-16 md:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-white animate-[fadeIn_0.6s_ease-out]">
              <p className="font-semibold tracking-wide text-blue-100">Commission Locale</p>
              <h2 className="text-4xl md:text-5xl font-bold mt-3">
                {dynamicTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-blue-100 text-lg">
                Suivez les résultats des élections en direct avec transparence et sécurité. Inspiré par les meilleures pratiques de communication électorale.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {/* <Button onClick={fetchPublicResults} disabled={loading} variant="outline" className="border-white text-white hover:bg-white/10">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                <Link to="/results">
                  <Button disabled={!canSeeResults} className="bg-emerald-500 text-white hover:bg-emerald-600" id="resultats">
                    Résultat
                  </Button>
                </Link> */}
                <Link to="/login">
                  <Button className="bg-gov-blue text-white hover:bg-gov-blue/90 shadow-sm">
                    Accès admin
                  </Button>
                </Link>
              </div>
              {results.election && (
                <div className="mt-8">
                  <p className="text-sm text-blue-100">Date du vote</p>
                  <div className="font-medium text-base md:text-lg">
                    {new Date(results.election.election_date).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3 max-w-md">
                    {[
                      { label: 'Jours', value: timeLeft.days },
                      { label: 'Heures', value: timeLeft.hours },
                      { label: 'Minutes', value: timeLeft.minutes },
                      { label: 'Secondes', value: timeLeft.seconds },
                    ].map((item) => (
                      <div key={item.label} className="bg-white/10 border border-white/20 rounded-lg p-4 text-center">
                        <div className="text-2xl md:text-3xl font-bold">{item.value}</div>
                        <div className="text-xs text-blue-100">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[{ label: 'Bureaux de vote', icon: Landmark, value: totalBureaux }, { label: 'Candidats', icon: Vote, value: totalCandidats }, { label: 'Électeurs inscrits', icon: Users, value: results.totalVoters }].map((k) => (
                <Card key={k.label} className="bg-white/95 backdrop-blur border-white/40 shadow-sm animate-[fadeInUp_0.7s_ease-out]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gov-gray">{k.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <k.icon className="w-6 h-6 text-gov-blue" />
                      <div className="text-3xl font-bold text-gov-dark">{k.value.toLocaleString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Résultats (inchangé) */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mb-6">
          <h3 className="text-2xl font-bold text-gov-dark">Résultats en temps réel</h3>
          <p className="text-gov-gray">
            Suivez les résultats des élections en direct avec transparence et sécurité.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gov-blue" />
            <span className="ml-2 text-gov-gray">Chargement des données...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-2 text-red-600">{error}</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gov-dark">
                    <Calendar className="w-5 h-5" />
                    <span>Élection en cours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.election ? (
                    <>
                      <h4 className="text-lg font-semibold mb-1">{results.election.title}</h4>
                      <p className="text-gov-gray">
                        {new Date(results.election.election_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </>
                  ) : (
                    <p className="text-gov-gray">Aucune élection en cours</p>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gov-dark">
                    <Users className="w-5 h-5" />
                    <span>Participation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {results.participation}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${results.participation}%` }} />
                  </div>
                  <p className="text-gov-gray text-sm mt-2">
                    {results.totalVoters.toLocaleString()} électeurs inscrits
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gov-dark">
                    <TrendingUp className="w-5 h-5" />
                    <span>Progression dépouillement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600 mb-2">
                    {results.resultsProgress}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${results.resultsProgress}%` }} />
                  </div>
                  <p className="text-gov-gray text-sm mt-2">
                    {results.totalCenters} centres de vote
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-gov-dark">Résultats provisoires</CardTitle>
                <p className="text-gov-gray text-sm">
                  {results.candidates.length > 0 ? `Basés sur ${results.resultsProgress}% des procès-verbaux traités` : 'Aucun résultat disponible pour le moment'}
                </p>
              </CardHeader>
              <CardContent>
                {results.candidates.length > 0 ? (
                  <div className="space-y-4">
                    {results.candidates.map((candidate) => (
                      <div key={candidate.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gov-dark">{candidate.name}</span>
                            <span className="text-sm text-gov-gray ml-2">({candidate.party})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lg" style={{ color: candidate.color }}>
                              {candidate.percentage.toFixed(1)}%
                            </span>
                            <p className="text-sm text-gov-gray">{candidate.votes.toLocaleString()} voix</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="h-3 rounded-full transition-all duration-1000" style={{ width: `${candidate.percentage}%`, backgroundColor: candidate.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gov-gray">Aucun candidat enregistré pour cette élection</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </section>

      {/* Section actualités / annonces (inchangé) */}
      <section id="infos" className="bg-gradient-to-b from-gray-50 to-white border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="w-6 h-6 text-gov-blue" />
            <h4 className="text-xl font-bold text-gov-dark">Actualités & Annonces</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{ t: 'Communiqués de la commission locale', d: 'Derniers communiqués officiels, décisions et informations au public.' }, { t: 'Dates importantes', d: 'Jour de vote, calendrier électoral et échéances clés.' }, { t: 'Comment voter', d: 'Conditions, pièces requises et rappels pratiques pour voter.' }].map((n) => (
              <Card key={n.t} className="shadow-sm hover:shadow transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{n.t}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gov-gray text-sm">{n.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer avec dégradé visible */}
      <footer id="contact" className="border-t bg-gradient-to-t from-white via-white to-gov-blue/10">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 bg-gov-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">iK</span>
                </div>
                <div>
                  <h3 className="text-gov-dark font-bold text-lg">iKADI</h3>
                </div>
              </div>
              <p className="text-gov-gray text-sm">Système de gestion des processus électoraux alliant transparence, sécurité et efficacité.</p>
            </div>
            <div className="text-sm text-gov-gray">
              <h4 className="font-semibold text-gov-dark mb-2">Ressources</h4>
              <ul className="space-y-1">
                <li><a href="#candidats" className="hover:text-gov-blue">Candidats</a></li>
                <li><a href="#circonscriptions" className="hover:text-gov-blue">Circonscriptions / Bureaux</a></li>
                <li><a href="#resultats" className="hover:text-gov-blue">Résultats</a></li>
              </ul>
            </div>
            <div className="text-sm text-gov-gray md:text-right">
              <p>© {new Date().getFullYear()} iKADI. Tous droits réservés.</p>
              <p className="text-xs mt-1">Inspiration UI: Commission électorale du Ghana (<a className="underline hover:text-gov-blue" href="https://ec.gov.gh/">ec.gov.gh</a>)</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomePage;
