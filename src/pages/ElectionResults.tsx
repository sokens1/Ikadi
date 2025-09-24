import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, TrendingUp, Calendar, MapPin, Menu, X, Facebook, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchElectionById } from '../api/elections';
import { fetchElectionSummary, fetchCenterSummary, fetchBureauSummary } from '../api/results';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'center' | 'bureau'>('bureau');
  const [centerRows, setCenterRows] = useState<any[]>([]);
  const [bureauRows, setBureauRows] = useState<any[]>([]);
  const [openCandidateId, setOpenCandidateId] = useState<string | null>(null);

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
      const [summaryData, centers, bureaux] = await Promise.all([
        fetchElectionSummary(id),
        fetchCenterSummary(id),
        fetchBureauSummary(id)
      ]);

      // Calculer les totaux
      const totalVotes = summaryData?.reduce((sum, candidate) => sum + (candidate.total_votes || 0), 0) || 0;
      const totalVoters = election.nb_electeurs || 0;
      const participationRate = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;

      setCenterRows(centers || []);
      setBureauRows(bureaux || []);

      setResults({
        election,
        total_voters: totalVoters,
        total_votes_cast: totalVotes,
        participation_rate: participationRate,
        candidates: (summaryData || [])
          .map((c: any) => ({
          candidate_id: c.candidate_id,
          candidate_name: c.candidate_name,
          party_name: c.candidate_party ?? c.party ?? '',
          total_votes: c.total_votes || 0,
            percentage: totalVotes > 0 ? (100 * (c.total_votes || 0)) / totalVotes : 0,
            rank: 0
          }))
          .sort((a: CandidateResult, b: CandidateResult) => b.total_votes - a.total_votes)
          .map((c, idx) => ({ ...c, rank: idx + 1 })),
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
    <div className="min-h-screen bg-white">
      {/* Header identique à la Home */}
      <header className="border-b bg-gov-blue text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-gov-blue font-bold text-lg">iK</span>
              </Link>
              <div>
                <h1 className="text-white font-bold text-2xl">iKADI</h1>
                <p className="text-white/80 text-sm">Plateforme de gestion électorale</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="hover:text-blue-200 transition-colors">Accueil</a>
              <a href="#about" className="hover:text-blue-200 transition-colors">A propos</a>
              <a href="#infos" className="hover:text-blue-200 transition-colors">Infos électorales</a>
              <a href="#candidats" className="hover:text-blue-200 transition-colors">Candidats</a>
              <a href="#resultats" className="hover:text-blue-200 transition-colors">Résultats</a>
              <a href="#circonscriptions" className="hover:text-blue-200 transition-colors">Circonscriptions / Bureaux</a>
              <a href="#contact" className="hover:text-blue-200 transition-colors">Contact</a>
            </nav>
            <button className="md:hidden p-2 rounded hover:bg-white/10" aria-label="Ouvrir le menu" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {mobileOpen && (
            <div className="mt-3 md:hidden border-t border-white/10 pt-3 space-y-2">
              {[
                { href: '#', label: 'Accueil' },
                { href: '#about', label: 'A propos' },
                { href: '#infos', label: 'Infos électorales' },
                { href: '#candidats', label: 'Candidats' },
                { href: '#resultats', label: 'Résultats' },
                { href: '#circonscriptions', label: 'Circonscriptions / Bureaux' },
                { href: '#contact', label: 'Contact' },
              ].map(link => (
                <a key={link.label} href={link.href} className="block px-2 py-2 rounded hover:bg-white/10" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
            </div>
          )}
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
                <Card key={candidate.candidate_id} className={`${index === 0 ? 'border-gov-blue border-2' : ''} hover:shadow-md transition-shadow cursor-pointer`} onClick={() => setOpenCandidateId(candidate.candidate_id)}>
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

      {/* Modal détail candidat */}
      <Dialog open={!!openCandidateId} onOpenChange={(o) => !o && setOpenCandidateId(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Détails du candidat</DialogTitle>
          </DialogHeader>
          {(() => {
            const c = results.candidates.find(x => x.candidate_id === openCandidateId);
            if (!c) return <div className="text-gov-gray">Aucune donnée</div>;
            return (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gov-dark">{c.candidate_name}</h3>
                  <p className="text-gov-gray">{c.party_name}</p>
                  <div className="mt-2 text-sm text-gov-gray">Voix: {c.total_votes.toLocaleString()} • Part: {c.percentage.toFixed(1)}%</div>
                </div>
                <Tabs defaultValue="center">
                  <TabsList>
                    <TabsTrigger value="center">Par centre</TabsTrigger>
                    <TabsTrigger value="bureau">Par bureau</TabsTrigger>
                  </TabsList>
                  <TabsContent value="center">
                    <div className="space-y-2 mt-3">
                      {centerRows.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border">
                          <div className="font-medium">{row.center_name}</div>
                          <div>Inscrits: {row.total_registered}</div>
                          <div>Votants: {row.total_voters}</div>
                          <div>Exprimés: {row.total_expressed_votes}</div>
                          <div className="col-span-2 sm:col-span-1">Participation: {typeof row.participation_pct === 'number' ? `${row.participation_pct.toFixed(2)}%` : '-'}</div>
                          <div className="col-span-2 sm:col-span-1">Score: {typeof row.score_pct === 'number' ? `${row.score_pct.toFixed(2)}%` : '-'}</div>
                        </div>
                      ))}
                      {centerRows.length === 0 && <div className="text-gov-gray">Aucun centre</div>}
                    </div>
                  </TabsContent>
                  <TabsContent value="bureau">
                    <div className="overflow-x-auto mt-3">
                      <table className="min-w-full bg-white border">
                        <thead className="bg-slate-100 text-gov-dark">
                          <tr>
                            <th className="text-left px-3 py-2 border">Bureau</th>
                            <th className="text-right px-3 py-2 border">Inscrits</th>
                            <th className="text-right px-3 py-2 border">Votants</th>
                            <th className="text-right px-3 py-2 border">Exprimés</th>
                            <th className="text-right px-3 py-2 border">Participation</th>
                            <th className="text-right px-3 py-2 border">Score</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {bureauRows.map((b, idx) => (
                            <tr key={idx} className="odd:bg-white even:bg-slate-50">
                              <td className="px-3 py-2 border">{b.bureau_name}</td>
                              <td className="px-3 py-2 border text-right">{b.total_registered ?? '-'}</td>
                              <td className="px-3 py-2 border text-right">{b.total_voters ?? '-'}</td>
                              <td className="px-3 py-2 border text-right">{b.total_expressed_votes ?? '-'}</td>
                              <td className="px-3 py-2 border text-right">{typeof b.participation_pct === 'number' ? `${b.participation_pct.toFixed(2)}%` : '-'}</td>
                              <td className="px-3 py-2 border text-right">{typeof b.score_pct === 'number' ? `${b.score_pct.toFixed(2)}%` : '-'}</td>
                            </tr>
                          ))}
                          {bureauRows.length === 0 && (
                            <tr>
                              <td className="px-3 py-4 text-center text-gov-gray" colSpan={6}>Aucun bureau</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Vue détaillée par centre / par bureau */}
      <section className="py-8 sm:py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <button onClick={() => setViewMode('center')} className={`px-3 py-2 rounded ${viewMode==='center' ? 'bg-gov-blue text-white' : 'bg-white text-gov-dark border'}`}>Par centre</button>
            <button onClick={() => setViewMode('bureau')} className={`px-3 py-2 rounded ${viewMode==='bureau' ? 'bg-gov-blue text-white' : 'bg-white text-gov-dark border'}`}>Par bureau</button>
          </div>

          {viewMode === 'center' ? (
            <div className="space-y-3">
              {centerRows.map((c, idx) => (
                <details key={`${c.center_id}-${idx}`} className="bg-white rounded border">
                  <summary className="cursor-pointer px-4 py-3 flex items-center justify-between">
                    <span className="font-semibold">{c.center_name}</span>
                    <span className="text-sm text-gov-gray">Inscrits: {c.total_registered?.toLocaleString?.() || c.total_registered} • Votants: {c.total_voters?.toLocaleString?.() || c.total_voters} • Exprimés: {c.total_expressed_votes?.toLocaleString?.() || c.total_expressed_votes} • Participation: {typeof c.participation_pct === 'number' ? `${c.participation_pct.toFixed(2)}%` : (c.participation_pct || '-')}</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gov-gray">
                    {typeof c.score_pct === 'number' && <div>Score moyen: {c.score_pct.toFixed(2)}%</div>}
                  </div>
                </details>
              ))}
              {centerRows.length === 0 && (
                <div className="text-center text-gov-gray">Aucun centre à afficher.</div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-slate-100 text-gov-dark">
                  <tr>
                    <th className="text-left px-3 py-2 border">Centre</th>
                    <th className="text-left px-3 py-2 border">Bureau</th>
                    <th className="text-right px-3 py-2 border">Inscrits</th>
                    <th className="text-right px-3 py-2 border">Votants</th>
                    <th className="text-right px-3 py-2 border">Votes</th>
                    <th className="text-right px-3 py-2 border">Participation</th>
                    <th className="text-right px-3 py-2 border">Score</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bureauRows.map((b, idx) => (
                    <tr key={`${b.center_id}-${b.bureau_number}-${idx}`} className="odd:bg-white even:bg-slate-50">
                      <td className="px-3 py-2 border">{b.center_id}</td>
                      <td className="px-3 py-2 border">{b.bureau_name}</td>
                      <td className="px-3 py-2 border text-right">{b.total_registered ?? '-'}</td>
                      <td className="px-3 py-2 border text-right">{b.total_voters ?? '-'}</td>
                      <td className="px-3 py-2 border text-right">{b.total_expressed_votes?.toLocaleString?.() || b.total_expressed_votes}</td>
                      <td className="px-3 py-2 border text-right">{typeof b.participation_pct === 'number' ? `${b.participation_pct.toFixed(2)}%` : (b.participation_pct || '-')}</td>
                      <td className="px-3 py-2 border text-right">{typeof b.score_pct === 'number' ? `${b.score_pct.toFixed(2)}%` : (b.score_pct || '-')}</td>
                    </tr>
                  ))}
                  {bureauRows.length === 0 && (
                    <tr>
                      <td className="px-3 py-4 text-center text-gov-gray" colSpan={7}>Aucun bureau à afficher.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Footer identique à la Home */}
      <footer id="contact" className="border-t bg-gov-blue mt-20 text-white">
        <div className="container mx-auto px-4 pt-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-around gap-8">
            {/* Colonne gauche: logo + description */}
            <div className="order-1 max-w-sm">
              <div className="flex items-center space-x-3 mb-3">
              <Link to="/" className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                  <span className="text-gov-blue font-semibold">iK</span>
                </Link>
                <div>
                  <h3 className="text-white font-bold text-lg">iKADI</h3>
                </div>
              </div>
              <p className="text-white/80 text-sm">Système de gestion des processus électoraux alliant transparence, sécurité et efficacité.</p>
            </div>

            {/* Ressources */}
            <div className="order-3 md:order-2 text-sm text-white/90 max-w-sm w-full">
              <h4 className="font-semibold text-white mb-2">Ressources</h4>
              <ul className="space-y-1">
                <li><a href="#candidats" className="hover:opacity-80">Candidats</a></li>
                <li><a href="#circonscriptions" className="hover:opacity-80">Circonscriptions / Bureaux</a></li>
                <li><a href="#resultats" className="hover:opacity-80">Résultats</a></li>
              </ul>
            </div>

            {/* Partage */}
            <div className="order-2 md:order-3 text-sm text-white/90 md:justify-self-end max-w-sm">
              <h4 className="font-semibold text-white mb-2">Partager</h4>
              <div className="flex flex-row flex-wrap gap-4 items-center">
                <button aria-label="Partager sur WhatsApp" onClick={() => handleShare('whatsapp')} className="p-2 bg-white/10 rounded hover:bg-white/20" title="WhatsApp">
                  <WhatsAppIcon width={28} height={28} />
                </button>
                <button aria-label="Partager sur Facebook" onClick={() => handleShare('facebook')} className="p-2 bg-white/10 rounded hover:bg-white/20" title="Facebook">
                  <Facebook className="w-7 h-7" />
                </button>
                <button aria-label="Copier le lien" onClick={() => handleShare('copy')} className="p-2 bg-white/10 rounded hover:bg-white/20" title="Copier le lien">
                  <LinkIcon className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 text-center font-semibold">© {new Date(results.last_updated).getFullYear()} iKADI. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
};

export default ElectionResults;
