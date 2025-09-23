
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, Users, TrendingUp, RefreshCw, Flag, Landmark, Megaphone, Facebook, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
  const [distinctParties, setDistinctParties] = useState<number>(0);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Prochaine élection pour le compte à rebours
  const [nextElection, setNextElection] = useState<ElectionData | null>(null);

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

  // Tick basé sur la prochaine élection (ne “repart” pas, se base sur la date cible)
  useEffect(() => {
    const targetDate = nextElection ? new Date(nextElection.election_date).getTime() : null;
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
  }, [nextElection]);

  // Log pour vérifier le titre dynamique
  useEffect(() => {
    const title = results.election?.title || 'Élection du premier arrondissement de Moanda';
    // eslint-disable-next-line no-console
    console.log('Titre dynamique résolu =', title, 'Élection courante =', results.election);
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

      // Prochaine élection (en choisissant côté client la date la plus proche >= aujourd'hui)
      try {
        const { data: allElections, error: allError } = await supabase
          .from('elections')
          .select('*')
          .order('election_date', { ascending: true });
        if (allError) throw allError;
        // eslint-disable-next-line no-console
        console.log('[HOME] All elections count ->', allElections?.length || 0);
        if (typeof window !== 'undefined') {
          alert(`Total élections récupérées: ${allElections?.length || 0}`);
        }
        if (allElections && allElections.length > 0) {
          const now = new Date();
          const upcomingSorted = allElections
            .map((e: any) => ({ ...e, _date: new Date(e.election_date) }))
            .sort((a: any, b: any) => a._date.getTime() - b._date.getTime());
          const next = upcomingSorted.find((e: any) => e._date.getTime() >= now.setHours(0,0,0,0)) || upcomingSorted[upcomingSorted.length - 1];
          setNextElection(next as any);
          // eslint-disable-next-line no-console
          console.log('[HOME] Next election chosen ->', next);
        } else {
          setNextElection(null);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[HOME] Erreur récupération des élections:', e);
      }

      // 1) Priorité: élection au statut "En cours" (insensible casse/espaces)
      let currentElection: any = null;
      try {
        const { data: running1, error: err1 } = await supabase
          .from('elections')
          .select('*')
          .ilike('status', '%en cours%')
          .order('election_date', { ascending: false })
          .limit(1);
        if (err1) throw err1;
        currentElection = running1 && running1.length > 0 ? running1[0] : null;
        // eslint-disable-next-line no-console
        console.log('[HOME] Query running ilike=en cours ->', running1?.length || 0);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[HOME] Erreur requête running:', e);
      }

      // 2) Fallback: dernière élection publiée
      if (!currentElection) {
        try {
          const { data: published, error: err2 } = await supabase
            .from('elections')
            .select('*')
            .eq('is_published', true)
            .order('election_date', { ascending: false })
            .limit(1);
          if (err2) throw err2;
          currentElection = published && published.length > 0 ? published[0] : null;
          // eslint-disable-next-line no-console
          console.log('[HOME] Query published=true ->', published?.length || 0);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[HOME] Erreur requête published:', e);
        }
      }

      // 3) Fallback ultime: dernière élection par date
      if (!currentElection) {
        try {
          const { data: anyElection, error: err3 } = await supabase
            .from('elections')
            .select('*')
            .order('election_date', { ascending: false })
            .limit(1);
          if (err3) throw err3;
          currentElection = anyElection && anyElection.length > 0 ? anyElection[0] : null;
          // eslint-disable-next-line no-console
          console.log('[HOME] Query any by date ->', anyElection?.length || 0);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[HOME] Erreur requête any by date:', e);
        }
      }

      if (!currentElection) {
        setResults(prev => ({ ...prev, election: null }));
        setLoading(false);
        return;
      }

      const [votersResult, centersResult, pvsResult, bureauxResult, candidatsCount, candidatesList, notificationsList] = await Promise.all([
        supabase.from('voters').select('id', { count: 'exact' }),
        supabase.from('voting_centers').select('id', { count: 'exact' }),
        supabase.from('procès_verbaux').select('id', { count: 'exact' }),
        supabase.from('voting_bureaux').select('id', { count: 'exact' }),
        supabase.from('candidates').select('id', { count: 'exact' }),
        supabase.from('candidates').select('party'),
        supabase.from('notifications').select('title, message, created_at').order('created_at', { ascending: false }).limit(10)
      ]);

      if (votersResult.error) throw votersResult.error;
      if (centersResult.error) throw centersResult.error;
      if (pvsResult.error) throw pvsResult.error;
      if (bureauxResult.error) throw bureauxResult.error;
      if (candidatsCount.error) throw candidatsCount.error;
      if ((candidatesList as any).error) throw (candidatesList as any).error;
      if ((notificationsList as any).error) throw (notificationsList as any).error;

      const totalVoters = votersResult.count || 0;
      const totalCenters = centersResult.count || 0;
      const totalPVs = pvsResult.count || 0;
      setTotalBureaux(bureauxResult.count || 0);
      setTotalCandidats(candidatsCount.count || 0);

      const parties = new Set<string>();
      ((candidatesList as any).data || []).forEach((c: any) => {
        if (c.party && String(c.party).trim().length > 0) parties.add(String(c.party).trim());
      });
      setDistinctParties(parties.size);

      const ticker = ((notificationsList as any).data || []).map((n: any) => n.title || n.message).filter(Boolean);
      setAnnouncements(ticker.length > 0 ? ticker : ['Aucune annonce disponible pour le moment']);

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

      const processed: CandidateResult[] = [];
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
            processed.push({
              id: item.candidates.id,
              name: item.candidates.name,
              party: item.candidates.party || 'Indépendant',
              votes: candidateVotes,
              percentage: totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0,
              color: candidateColors[index % candidateColors.length]
            });
          }
        });
        processed.sort((a, b) => b.votes - a.votes);
      }

      setResults({
        election: currentElection,
        participation: Math.round(participation * 10) / 10,
        resultsProgress: Math.round(resultsProgress * 10) / 10,
        candidates: processed,
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
      {/* Header bleu plateforme avec texte blanc */}
      <header className="border-b bg-gov-blue text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-gov-blue font-bold text-lg">iK</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-2xl">iKADI</h1>
                <p className="text-white/80 text-sm">Plateforme de gestion électorale</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="hover:underline">Accueil</a>
              <a href="#about" className="hover:underline">A propos</a>
              <a href="#infos" className="hover:underline">Infos électorales</a>
              <a href="#candidats" className="hover:underline">Candidats</a>
              <a href="#resultats" className="hover:underline">Résultats</a>
              <a href="#circonscriptions" className="hover:underline">Circonscriptions / Bureaux</a>
              <a href="#contact" className="hover:underline">Contact</a>
            </nav>
            {/* <Link to="/login"><Button className="bg-white text-gov-blue hover:bg-blue-50 shadow-sm">Accès admin</Button></Link> */}
          </div>
        </div>
      </header>

      {/* Hero Section (sans animation) */}
      <section
        className="relative min-h-[460px] pb-10"
        style={{
          backgroundImage: heroOk
            ? `url(${HERO_IMAGE})`
            : `linear-gradient(135deg, hsl(var(--gov-blue)) 0%, hsl(var(--gov-blue-light)) 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: heroOk ? 'fixed' : 'scroll'
        }}
      >
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.45)]" />
        <div className="container mx-auto px-4 py-16 mb-16 md:py-20 relative">
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
                  <Button disabled={!canSeeResults} className="bg-white text-gov-blue hover:bg-blue-50" id="resultats">
                    Résultat
                  </Button>
                </Link> */}
                <Link to="/login">
                  <Button className="bg-gov-blue text-white hover:bg-gov-blue/90">
                    Accès admin
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bande statique style Ghana: stations, partis, électeurs — déplacée hors de la hero */}
      <section className="w-full bg-slate-200 text-gov-dark">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-around gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg"><Landmark className="w-8 h-8 text-gov-blue" /></div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">{totalBureaux.toLocaleString()}</div>
                <div className="uppercase tracking-wide text-xs md:text-sm opacity-90">Bureaux de vote</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg"><Flag className="w-8 h-8 text-gov-blue" /></div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">{distinctParties.toLocaleString()}</div>
                <div className="uppercase tracking-wide text-xs md:text-sm opacity-90">Partis politiques</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg"><Users className="w-8 h-8 text-gov-blue" /></div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">{results.totalVoters.toLocaleString()}</div>
                <div className="uppercase tracking-wide text-xs md:text-sm opacity-90">Électeurs inscrits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker d'annonces (rouge) */}
      <section className="bg-slate-300">
        <div className="container mx-auto px-4 py-3">
          <div className="bg-white rounded-sm shadow-sm border">
            <div className="flex items-stretch">
              <div className="px-4 py-2 bg-red-600 text-white text-[11px] md:text-xs lg:text-sm font-semibold uppercase tracking-wide flex items-center gap-2"><Megaphone className="w-4 h-4" /> Dernière annonce</div>
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <div className="inline-block py-2 text-xs md:text-sm text-gov-dark" style={{ animation: 'marquee 30s linear infinite' }}>
                  {announcements.map((a, idx) => (
                    <span key={idx} className="mx-6 opacity-95">
                      {idx > 0 && <span className="mx-4 align-middle text-gray-400">•</span>}
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </section>

      {/* Section compte à rebours type bannière verte */}
      <section className="bg-gov-blue text-white mt-10">
        <div className="container mx-auto px-4 py-16">
          <h3 className="text-center text-2xl md:text-3xl font-semibold tracking-wide">Résultats en temps réel</h3>
          <p className="text-center text-white/90 mt-2 max-w-3xl mx-auto">Suivez les résultats des élections en direct avec transparence et sécurité.</p>
          {nextElection && (
            <p className="text-center text-white/90 mt-1">Publication à venir: <span className="font-bold">{nextElection.title}</span></p>
          )}
          {!nextElection && (
            <p className="text-center text-white/80 mt-1">Aucune élection programmée</p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            {[{label:'Jours', value: timeLeft.days},{label:'Heures', value: timeLeft.hours},{label:'Minutes', value: timeLeft.minutes},{label:'Secondes', value: timeLeft.seconds}].map((t)=> (
              <div key={t.label} className="text-center min-w-[80px]">
                <div className="text-3xl md:text-4xl font-bold leading-none">{String(t.value).padStart(2,'0')}</div>
                <div className="mt-1 text-[10px] md:text-xs uppercase tracking-wide border-t border-white/40 pt-1 opacity-90">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Résultats */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mb-6">
          <h3 className="text-2xl font-bold text-gov-dark">Résultats en temps réel</h3>
          <p className="text-gov-gray">
            Suivez les résultats des élections en direct avec transparence et sécurité.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gov-blue" />
            <span className="ml-2 text-gov-gray">Chargement des données...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <TrendingUp className="w-8 h-8 text-red-500" />
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

      {/* Footer bleu plateforme avec texte blanc */}
      <footer id="contact" className="border-t bg-gov-blue text-white">
        <div className="container mx-auto px-4 pt-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-around gap-8">
            {/* Colonne gauche: logo + description */}
            <div className="order-1 max-w-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                  <span className="text-gov-blue font-semibold">iK</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">iKADI</h3>
                </div>
              </div>
              <p className="text-white/80 text-sm">Système de gestion des processus électoraux alliant transparence, sécurité et efficacité.</p>
            </div>

            {/* Ressources au milieu (non centré) */}
            <div className="order-3 md:order-2 text-sm text-white/90 max-w-sm w-full">
              <h4 className="font-semibold text-white mb-2">Ressources</h4>
              <ul className="space-y-1">
                <li><a href="#candidats" className="hover:opacity-80">Candidats</a></li>
                <li><a href="#circonscriptions" className="hover:opacity-80">Circonscriptions / Bureaux</a></li>
                <li><a href="#resultats" className="hover:opacity-80">Résultats</a></li>
              </ul>
            </div>

            {/* Partage à droite (ligne) */}
            <div className="order-2 md:order-3 text-sm text-white/90 md:justify-self-end max-w-sm">
              <h4 className="font-semibold text-white mb-2">Partager</h4>
              <div className="flex flex-row flex-wrap gap-4 items-center">
                <a
                  aria-label="Partager sur WhatsApp"
                  href={`https://wa.me/?text=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white/10 rounded hover:bg-white/20"
                  title="WhatsApp"
                >
                  <WhatsAppIcon width={28} height={28} />
                </a>
                <a
                  aria-label="Partager sur Facebook"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white/10 rounded hover:bg-white/20"
                  title="Facebook"
                >
                  <Facebook className="w-7 h-7" />
                </a>
                <button
                  aria-label="Copier le lien"
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.href : '';
                    navigator.clipboard?.writeText(url).then(() => {
                      toast.success('Lien copié dans le presse-papiers');
                    });
                  }}
                  className="p-2 bg-white/10 rounded hover:bg-white/20"
                  title="Copier le lien"
                >
                  <LinkIcon className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>

          {/* Copyright centré en bas */}
          <div className="mt-12 text-center font-semibold">© {new Date().getFullYear()} iKADI. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomePage;
