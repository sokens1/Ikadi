import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, TrendingUp, Calendar, MapPin, Menu, X, Facebook, Link as LinkIcon, Trophy, Medal, Crown, Share2, Heart, Star, Vote, BarChart3, Building, Target, AlertCircle, CheckCircle, Clock, Eye, Filter, Globe, Home, Info, Layers, PieChart, Search, Settings, Shield, TrendingDown, User, Users2, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchElectionById } from '../api/elections';
import { fetchElectionSummary, fetchCenterSummary, fetchBureauSummary, fetchCenterSummaryByCandidate, fetchBureauSummaryByCandidate } from '../api/results';
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

// Composant MetricCard moderne
const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  animated?: boolean;
}> = ({ title, value, icon, color, subtitle, animated = true }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animated) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const duration = 2000;
            const start = Date.now();
            const animate = () => {
              const elapsed = Date.now() - start;
              const progress = Math.min(elapsed / duration, 1);
              setDisplayValue(Math.floor(progress * value));
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            animate();
          }
        },
        { threshold: 0.1 }
      );
      
      if (countRef.current) {
        observer.observe(countRef.current);
      }
      
      return () => observer.disconnect();
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  return (
    <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div ref={countRef} className="text-3xl font-bold text-gray-800 mb-2">
            {displayValue.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-500">{subtitle}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Composant CandidateCard moderne
const CandidateCard: React.FC<{
  candidate: CandidateResult;
  rank: number;
  isWinner: boolean;
  onClick: () => void;
  totalVotes: number;
}> = ({ candidate, rank, isWinner, onClick, totalVotes }) => {
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="w-5 h-5" />;
    if (rank === 2) return <Trophy className="w-5 h-5" />;
    if (rank === 3) return <Medal className="w-5 h-5" />;
    return <span className="font-bold text-sm">{rank}</span>;
  };

  const getRankColor = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-300';
    return 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300';
  };

  const percentage = totalVotes > 0 ? (candidate.total_votes / totalVotes) * 100 : 0;

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 border-2 ${
        isWinner ? 'border-yellow-400 shadow-yellow-100' : 'border-gray-200 hover:border-blue-300'
      } bg-white overflow-hidden`}
      onClick={onClick}
    >
      <CardContent className="p-6 relative">
        {/* Fond dégradé pour le gagnant */}
        {isWinner && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-transparent to-blue-50 opacity-50" />
        )}
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getRankColor()} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {getRankIcon()}
            </div>
            {isWinner && (
              <div className="flex items-center text-yellow-600">
                <Star className="w-5 h-5 mr-1" />
                <span className="text-sm font-semibold">Gagnant</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
              {candidate.candidate_name}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {candidate.party_name || 'Candidat indépendant'}
            </p>
          </div>

          {/* Barre de progression moderne */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold text-gray-800">
                {candidate.total_votes.toLocaleString()}
              </span>
               <span className="text-lg font-semibold text-blue-600">
                 {percentage.toFixed(2)}%
               </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                  rank === 3 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                  'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-500">voix exprimées</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [candidateCenters, setCandidateCenters] = useState<any[]>([]);
  const [candidateBureaux, setCandidateBureaux] = useState<any[]>([]);
  const [centerNameById, setCenterNameById] = useState<Record<string, string>>({});
  const [candidateCenterNameById, setCandidateCenterNameById] = useState<Record<string, string>>({});
  const [resultsMenuOpen, setResultsMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'center' | 'participation' | 'score' | 'votes'>('center');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Build center name map for global views (must be declared before any early returns)
  React.useEffect(() => {
    const m: Record<string, string> = {};
    centerRows.forEach((c: any) => { if (c.center_id && c.center_name) m[c.center_id] = c.center_name; });
    setCenterNameById(m);
  }, [centerRows]);

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

      // Calculer les totaux globaux à partir des tableaux de bureaux (plus fiable)
      const registeredSum = (bureaux || []).reduce((sum: number, b: any) => sum + (Number(b.total_registered) || 0), 0);
      const votersSum = (bureaux || []).reduce((sum: number, b: any) => sum + (Number(b.total_voters) || 0), 0);
      const expressedSum = (bureaux || []).reduce((sum: number, b: any) => sum + (Number(b.total_expressed_votes) || 0), 0);

      // Totaux affichés en tête
      const totalVotesCast = expressedSum; // bulletins exprimés
      const totalRegistered = registeredSum || (election.nb_electeurs || 0);
      const participationRate = totalRegistered > 0 ? Math.min(Math.max((votersSum / totalRegistered) * 100, 0), 100) : 0;

      setCenterRows(centers || []);
      setBureauRows(bureaux || []);

      setResults({
        election,
        total_voters: totalRegistered,
        total_votes_cast: totalVotesCast,
        participation_rate: participationRate,
        candidates: (summaryData || [])
          .map((c: any) => ({
          candidate_id: c.candidate_id,
          candidate_name: c.candidate_name,
          party_name: c.candidate_party ?? c.party ?? '',
          total_votes: c.total_votes || 0,
            percentage: totalVotesCast > 0 ? (100 * (c.total_votes || 0)) / totalVotesCast : 0,
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
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gov-gray">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
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

  // Types pour le tri et regroupement
  type CenterGroup = {
    center: any;
    bureaux: any[];
  };

  type BureauData = any;

  // Fonction pour trier et regrouper les données
  const getSortedAndGroupedData = (): CenterGroup[] | BureauData[] => {
    if (viewMode === 'center') {
      // Pour la vue par centre, regrouper par centre et trier les bureaux
      const groupedCenters = centerRows.reduce((acc, center) => {
        const centerId = center.center_id;
        if (!acc[centerId]) {
          acc[centerId] = {
            center,
            bureaux: bureauRows.filter(b => b.center_id === centerId)
          };
        }
        return acc;
      }, {} as Record<string, CenterGroup>);

      // Trier les centres
      const sortedCenters = Object.values(groupedCenters).sort((a: CenterGroup, b: CenterGroup) => {
        let comparison = 0;
        switch (sortBy) {
          case 'center':
            comparison = (a.center.center_name || '').localeCompare(b.center.center_name || '');
            break;
          case 'participation':
            comparison = (a.center.participation_pct || 0) - (b.center.participation_pct || 0);
            break;
          case 'score':
            comparison = (a.center.score_pct || 0) - (b.center.score_pct || 0);
            break;
          case 'votes':
            comparison = (a.center.total_expressed_votes || 0) - (b.center.total_expressed_votes || 0);
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return sortedCenters;
    } else {
       // Pour la vue par bureau, trier directement les bureaux
       const sortedBureaux = [...bureauRows].sort((a, b) => {
         let comparison = 0;
         
         // Si le tri est par centre, trier d'abord par centre puis par numéro de bureau
         if (sortBy === 'center') {
           const centerA = a.center_name || centerNameById[a.center_id] || '';
           const centerB = b.center_name || centerNameById[b.center_id] || '';
           comparison = centerA.localeCompare(centerB);
           
           // Si les centres sont identiques, trier par numéro de bureau
           if (comparison === 0) {
             const numA = parseInt(a.bureau_name?.match(/\d+/)?.[0] || '0');
             const numB = parseInt(b.bureau_name?.match(/\d+/)?.[0] || '0');
             comparison = numA - numB;
           }
         } else {
           // Pour les autres critères, trier selon le critère sélectionné
           switch (sortBy) {
             case 'participation':
               comparison = (a.participation_pct || 0) - (b.participation_pct || 0);
               break;
             case 'score':
               comparison = (a.score_pct || 0) - (b.score_pct || 0);
               break;
             case 'votes':
               comparison = (a.total_expressed_votes || 0) - (b.total_expressed_votes || 0);
               break;
           }
           
           // Si les valeurs sont identiques, trier par centre puis par bureau
           if (comparison === 0) {
             const centerA = a.center_name || centerNameById[a.center_id] || '';
             const centerB = b.center_name || centerNameById[b.center_id] || '';
             comparison = centerA.localeCompare(centerB);
             
             if (comparison === 0) {
               const numA = parseInt(a.bureau_name?.match(/\d+/)?.[0] || '0');
               const numB = parseInt(b.bureau_name?.match(/\d+/)?.[0] || '0');
               comparison = numA - numB;
             }
           }
         }
         
         return sortOrder === 'asc' ? comparison : -comparison;
       });

      return sortedBureaux;
    }
  };
  const handleOpenCandidate = async (candidateId: string) => {
    setOpenCandidateId(candidateId);
    if (results?.election) {
      const [centers, bureaux] = await Promise.all([
        fetchCenterSummaryByCandidate(results.election.id, candidateId),
        fetchBureauSummaryByCandidate(results.election.id, candidateId)
      ]);
      setCandidateCenters(centers || []);
      setCandidateBureaux(bureaux || []);
      const nameMap: Record<string, string> = {};
      (centers || []).forEach((c: any) => { if (c.center_id && c.center_name) nameMap[c.center_id] = c.center_name; });
      setCandidateCenterNameById(nameMap);
    }
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Header identique à la Home */}
      <header className="border-b bg-gov-blue text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm" aria-label="Aller à l'accueil">
                <span className="text-gov-blue font-bold text-lg">iK</span>
              </Link>
              <div>
                <h1 className="text-white font-bold text-2xl">iKADI</h1>
                <p className="text-white/80 text-sm">Plateforme de gestion électorale</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="hover:text-blue-200 transition-colors flex items-center gap-2">
                <Home className="w-4 h-4" />
                Accueil
              </Link>
              {/* <a href="#about" className="hover:text-blue-200 transition-colors">A propos</a>
              <a href="#infos" className="hover:text-blue-200 transition-colors">Infos électorales</a>
              <a href="#candidats" className="hover:text-blue-200 transition-colors">Candidats</a> */}
              <div className="relative text-left" onMouseEnter={() => setResultsMenuOpen(true)} onMouseLeave={() => setResultsMenuOpen(false)}>
                <button className="hover:text-blue-200 transition-colors flex items-center gap-2" onClick={() => setResultsMenuOpen(v=>!v)}>
                  <BarChart3 className="w-4 h-4" />
                  Résultats
                </button>
                {resultsMenuOpen && (
                <div className="absolute left-0 right-auto mt-2 bg-white rounded shadow-lg border min-w-[260px] z-50 py-2">
                  <div className="px-3 pb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Accès rapide
                  </div>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm text-gray-800 flex items-center gap-2"
                    onClick={() => navigate('/')}
                  >
                    <Home className="w-3 h-3" />
                    Tous les résultats (accueil)
                  </button>
                  {results?.election && (
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm text-gray-800 flex items-center gap-2"
                      onClick={() => navigate(`/election/${results.election.id}/results`)}
                    >
                      <BarChart3 className="w-3 h-3" />
                      Résultats courants
                    </button>
                  )}
                </div>
                )}
              </div>
              {/* <a href="#circonscriptions" className="hover:text-blue-200 transition-colors">Circonscriptions / Bureaux</a>
              <a href="#contact" className="hover:text-blue-200 transition-colors">Contact</a> */}
            </nav>
            <button className="md:hidden p-2 rounded hover:bg-white/10" aria-label="Ouvrir le menu" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {mobileOpen && (
            <div className="mt-3 md:hidden border-t border-white/10 pt-3 space-y-2">
              {[
                { href: '#', label: 'Accueil', icon: Home },
                // { href: '#about', label: 'A propos' },
                // { href: '#infos', label: 'Infos électorales' },
                // { href: '#candidats', label: 'Candidats' },
                { href: '#resultats', label: 'Résultats', icon: BarChart3 },
                // { href: '#circonscriptions', label: 'Circonscriptions / Bureaux' },
                // { href: '#contact', label: 'Contact' },
              ].map(link => (
                <a key={link.label} href={link.href} className="px-2 py-2 rounded hover:bg-white/10 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section Moderne */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-12 sm:py-16 overflow-hidden">
        {/* Fond décoratif */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            {/* Badge de statut avec animation */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/30">
              <div className={`w-2 h-2 rounded-full ${
                results.election?.status === 'Terminée' ? 'bg-green-400' : 
                results.election?.status === 'En cours' ? 'bg-yellow-400 animate-pulse' : 
                'bg-blue-400'
              }`} />
              <span className="text-sm font-medium">{results.election?.status}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {results.election?.title}
            </h1>
            
            {results.election?.localisation && (
              <p className="text-blue-100 flex items-center justify-center gap-2 text-lg sm:text-xl mb-6">
                <MapPin className="w-5 h-5" />
                {results.election.localisation}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 text-blue-100 flex-wrap">
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                {new Date(results.election?.election_date || '').toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques principales modernisées */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:py-16 -mt-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <MetricCard
              title="Électeurs inscrits"
              value={results.total_voters}
              icon={<Users className="w-8 h-8" />}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              subtitle="Citoyens éligibles"
              animated={true}
            />
            <MetricCard
              title="Bulletins exprimés"
              value={results.total_votes_cast}
              icon={<TrendingUp className="w-8 h-8" />}
              color="bg-gradient-to-br from-green-500 to-green-600"
              subtitle="Votes comptabilisés"
              animated={true}
            />
            <MetricCard
              title="Taux de participation"
              value={Math.round(results.participation_rate)}
              icon={<div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><span className="text-blue-600 font-bold text-lg">%</span></div>}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              subtitle="Pourcentage de participation"
              animated={true}
            />
          </div>
        </div>
      </section>

      {/* Résultats des candidats modernisés */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Résultats par candidat
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez les performances de chaque candidat avec des statistiques détaillées
            </p>
          </div>
          
          {results.candidates.length === 0 ? (
            <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Vote className="w-12 h-12 text-gray-400" />
            </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Aucun résultat disponible</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Les résultats de cette élection ne sont pas encore publiés. 
                Revenez plus tard pour consulter les résultats.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {results.candidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.candidate_id}
                  candidate={candidate}
                  rank={candidate.rank}
                  isWinner={index === 0}
                  onClick={() => handleOpenCandidate(candidate.candidate_id)}
                  totalVotes={results.total_votes_cast}
                />
              ))}
            </div>
          )}
        </div>
      </section>

       {/* Modal détail candidat */}
       <Dialog open={!!openCandidateId} onOpenChange={(o) => !o && setOpenCandidateId(null)}>
         <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
                   {/* <div className="mt-2 text-sm text-gov-gray">Voix: {c.total_votes.toLocaleString()} • Part: {c.percentage.toFixed(1)}%</div> */}
                 </div>
                <Tabs defaultValue="center">
                  <TabsList>
                    <TabsTrigger value="center">Par centre</TabsTrigger>
                    <TabsTrigger value="bureau">Par bureau</TabsTrigger>
                  </TabsList>
                  <TabsContent value="center">
                    <div className="space-y-3 mt-3">
                      {candidateCenters.map((row, idx) => (
                        <details key={idx} className="bg-white rounded border">
                          <summary className="cursor-pointer px-4 py-3 flex items-center justify-between bg-slate-100">
                            <span className="font-semibold">{row.center_name}</span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                              <div className="bg-white rounded px-3 py-2 border text-center"><div className="text-[11px] uppercase text-gov-gray">Voix</div><div className="font-semibold">{row.candidate_votes}</div></div>
                              <div className="bg-white rounded px-3 py-2 border text-center"><div className="text-[11px] uppercase text-gov-gray">Score</div><div className="font-semibold">{typeof row.candidate_percentage === 'number' ? `${Math.min(Math.max(row.candidate_percentage,0),100).toFixed(2)}%` : '-'}</div></div>
                              <div className="bg-white rounded px-3 py-2 border text-center"><div className="text-[11px] uppercase text-gov-gray">Participation</div><div className="font-semibold">{typeof row.candidate_participation_pct === 'number' ? `${Math.min(Math.max(row.candidate_participation_pct,0),100).toFixed(2)}%` : '-'}</div></div>
                            </div>
                          </summary>
                          <div className="px-0 sm:px-2 py-3">
                            <div className="overflow-x-auto">
                              <table className="min-w-full bg-white">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="text-left px-3 py-2 border">Bureau</th>
                                    <th className="text-right px-3 py-2 border">Voix</th>
                                    <th className="text-right px-3 py-2 border">Score</th>
                                    <th className="text-right px-3 py-2 border">Participation</th>
                                  </tr>
                                </thead>
                                <tbody className="text-sm">
                                  {candidateBureaux.filter(b => b.center_id === row.center_id).map((b, i2) => (
                                    <tr key={i2} className="odd:bg-white even:bg-slate-50">
                                      <td className="px-3 py-2 border">{b.bureau_name}</td>
                                      <td className="px-3 py-2 border text-right">{b.candidate_votes ?? '-'}</td>
                                      <td className="px-3 py-2 border text-right">{typeof b.candidate_percentage === 'number' ? `${Math.min(Math.max(b.candidate_percentage,0),100).toFixed(2)}%` : '-'}</td>
                                      <td className="px-3 py-2 border text-right">{typeof b.candidate_participation_pct === 'number' ? `${Math.min(Math.max(b.candidate_participation_pct,0),100).toFixed(2)}%` : '-'}</td>
                                    </tr>
                                  ))}
                                  {candidateBureaux.filter(b => b.center_id === row.center_id).length === 0 && (
                                    <tr>
                                      <td className="px-3 py-4 text-center text-gov-gray" colSpan={4}>Aucun bureau</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </details>
                      ))}
                      {candidateCenters.length === 0 && <div className="text-gov-gray">Aucun centre</div>}
                    </div>
                  </TabsContent>
                  <TabsContent value="bureau">
                    <div className="overflow-x-auto mt-3">
                      <table className="min-w-full bg-white border">
                        <thead className="bg-slate-100 text-gov-dark">
                          <tr>
                            <th className="text-left px-3 py-2 border">Bureau</th>
                            <th className="text-right px-3 py-2 border">Voix</th>
                            <th className="text-right px-3 py-2 border">Score</th>
                            <th className="text-right px-3 py-2 border">Participation</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {candidateBureaux.map((b, idx) => (
                            <tr key={idx} className="odd:bg-white even:bg-slate-50">
                              <td className="px-3 py-2 border">{b.bureau_name}</td>
                              <td className="px-3 py-2 border text-right">{b.candidate_votes ?? '-'}</td>
                              <td className="px-3 py-2 border text-right">{typeof b.candidate_percentage === 'number' ? `${Math.min(Math.max(b.candidate_percentage,0),100).toFixed(2)}%` : '-'}</td>
                              <td className="px-3 py-2 border text-right">{typeof b.candidate_participation_pct === 'number' ? `${Math.min(Math.max(b.candidate_participation_pct,0),100).toFixed(2)}%` : '-'}</td>
                            </tr>
                          ))}
                          {candidateBureaux.length === 0 && (
                            <tr>
                              <td className="px-3 py-4 text-center text-gov-gray" colSpan={4}>Aucun bureau</td>
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

      {/* Vue détaillée par centre / par bureau modernisée */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Analyse détaillée
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              Explorez les résultats par centre de vote ou par bureau pour une analyse approfondie
            </p>
            
            {/* Boutons de navigation modernisés */}
            <div className="flex items-center justify-center gap-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 max-w-md mx-auto">
              <button 
                onClick={() => setViewMode('center')} 
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'center' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Building className="w-4 h-4" />
                Par centre
              </button>
              <button 
                onClick={() => setViewMode('bureau')} 
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'bureau' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Target className="w-4 h-4" />
                Par bureau
              </button>
            </div>

            {/* Contrôles de tri */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white rounded-xl p-4 shadow-lg border border-gray-200 max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trier par:
                </span>
                 <select 
                   value={sortBy} 
                   onChange={(e) => setSortBy(e.target.value as any)}
                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="center">Centre</option>
                   <option value="participation">Participation</option>
                   {/* <option value="score">Score</option> */}
                   <option value="votes">Votes</option>
                 </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    sortOrder === 'asc' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {sortOrder === 'asc' ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Croissant
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      Décroissant
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'center' ? (
            <div className="space-y-6">
              {(getSortedAndGroupedData() as CenterGroup[]).map((group, idx) => {
                const c = group.center;
                return (
                <details key={`${c.center_id}-${idx}`} className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <summary className="cursor-pointer px-6 py-5 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {c.center_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{c.center_name}</h3>
                        <p className="text-gray-600 text-sm">Centre de vote</p>
                      </div>
                    </div>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm text-center group-hover:shadow-md transition-shadow">
                        <div className="text-[11px] uppercase text-gray-500 font-medium mb-1">Inscrits</div>
                        <div className="font-bold text-gray-800 text-lg">{c.total_registered?.toLocaleString?.() || c.total_registered}</div>
                      </div>
                      <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm text-center group-hover:shadow-md transition-shadow">
                        <div className="text-[11px] uppercase text-gray-500 font-medium mb-1">Exprimés</div>
                        <div className="font-bold text-gray-800 text-lg">{c.total_expressed_votes?.toLocaleString?.() || c.total_expressed_votes}</div>
                      </div>
                       {/* <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm text-center group-hover:shadow-md transition-shadow">
                         <div className="text-[11px] uppercase text-gray-500 font-medium mb-1">Score</div>
                         <div className="font-bold text-blue-600 text-lg">{typeof c.score_pct === 'number' ? `${Math.min(Math.max(c.score_pct,0),100).toFixed(1)}%` : '-'}</div>
                       </div> */}
                      <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm text-center group-hover:shadow-md transition-shadow">
                        <div className="text-[11px] uppercase text-gray-500 font-medium mb-1">Participation</div>
                         <div className="font-bold text-green-600 text-lg">{typeof c.participation_pct === 'number' ? `${Math.min(Math.max(c.participation_pct,0),100).toFixed(2)}%` : '-'}</div>
                      </div>
                    </div>
                  </summary>
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Bureau
                              </div>
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">
                              <div className="flex items-center justify-end gap-2">
                                <Users className="w-4 h-4" />
                                Inscrits
                              </div>
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">
                              <div className="flex items-center justify-end gap-2">
                                <Vote className="w-4 h-4" />
                                Votants
                              </div>
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">
                              <div className="flex items-center justify-end gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Exprimés
                              </div>
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">
                              <div className="flex items-center justify-end gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Participation
                              </div>
                            </th>
                             {/* <th className="text-right px-4 py-3 font-semibold text-gray-700">
                               <div className="flex items-center justify-end gap-2">
                                 <Target className="w-4 h-4" />
                                 Score
                               </div>
                             </th> */}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {group.bureaux.sort((a, b) => {
                            // Trier les bureaux par numéro de bureau
                            const numA = parseInt(a.bureau_name?.match(/\d+/)?.[0] || '0');
                            const numB = parseInt(b.bureau_name?.match(/\d+/)?.[0] || '0');
                            return numA - numB;
                          }).map((b, i2) => (
                            <tr key={i2} className="hover:bg-blue-50 transition-colors duration-200">
                              <td className="px-4 py-3 font-medium text-gray-800">{b.bureau_name}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-700">{b.total_registered?.toLocaleString() ?? '-'}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-700">{b.total_voters?.toLocaleString() ?? '-'}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-700">{b.total_expressed_votes?.toLocaleString() ?? '-'}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  typeof b.participation_pct === 'number' && b.participation_pct >= 70 ? 'bg-green-100 text-green-800' :
                                  typeof b.participation_pct === 'number' && b.participation_pct >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {typeof b.participation_pct === 'number' ? `${Math.min(Math.max(b.participation_pct,0),100).toFixed(2)}%` : '-'}
                                </span>
                              </td>
                               {/* <td className="px-4 py-3 text-right">
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                   typeof b.score_pct === 'number' && b.score_pct >= 50 ? 'bg-blue-100 text-blue-800' :
                                   typeof b.score_pct === 'number' && b.score_pct >= 30 ? 'bg-indigo-100 text-indigo-800' :
                                   'bg-gray-100 text-gray-800'
                                 }`}>
                                   {typeof b.score_pct === 'number' ? `${Math.min(Math.max(b.score_pct,0),100).toFixed(1)}%` : '-'}
                                 </span>
                               </td> */}
                            </tr>
                          ))}
                          {group.bureaux.length === 0 && (
                            <tr>
                               <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                                <div className="flex flex-col items-center gap-2">
                                  <Target className="w-8 h-8 text-gray-400" />
                                  <span>Aucun bureau disponible</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              )})}
              {(getSortedAndGroupedData() as CenterGroup[]).length === 0 && (
                <div className="text-center text-gov-gray">Aucun centre à afficher.</div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Vue détaillée par bureau
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tous les bureaux de vote avec leurs statistiques complètes
                </p>
              </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Centre
                        </div>
                      </th>
                      <th className="text-left px-6 py-4 font-semibold">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Bureau
                        </div>
                      </th>
                      <th className="text-right px-6 py-4 font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <Users className="w-4 h-4" />
                          Inscrits
                        </div>
                      </th>
                      <th className="text-right px-6 py-4 font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <Vote className="w-4 h-4" />
                          Votants
                        </div>
                      </th>
                      <th className="text-right px-6 py-4 font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Votes
                        </div>
                      </th>
                      <th className="text-right px-6 py-4 font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Participation
                        </div>
                      </th>
                       {/* <th className="text-right px-6 py-4 font-semibold">
                         <div className="flex items-center justify-end gap-2">
                           <Target className="w-4 h-4" />
                           Score
                         </div>
                       </th> */}
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(getSortedAndGroupedData() as BureauData[]).map((b, idx) => (
                      <tr key={`${b.center_id}-${b.bureau_number}-${idx}`} className="hover:bg-blue-50 transition-colors duration-200 group">
                        <td className="px-6 py-4 font-medium text-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                              <span className="text-blue-700 font-bold text-sm">
                                {(b.center_name || centerNameById[b.center_id] || b.center_id)?.charAt(0) || 'C'}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{b.center_name || centerNameById[b.center_id] || b.center_id}</div>
                              <div className="text-xs text-gray-500">Centre de vote</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-800">{b.bureau_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-gray-800 text-lg">{b.total_registered?.toLocaleString() ?? '-'}</span>
                            <span className="text-xs text-gray-500">inscrits</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-gray-800 text-lg">{b.total_voters?.toLocaleString() ?? '-'}</span>
                            <span className="text-xs text-gray-500">votants</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-blue-600 text-lg">{b.total_expressed_votes?.toLocaleString?.() || b.total_expressed_votes}</span>
                            <span className="text-xs text-gray-500">exprimés</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              typeof b.participation_pct === 'number' && b.participation_pct >= 70 ? 'bg-green-100 text-green-800' :
                              typeof b.participation_pct === 'number' && b.participation_pct >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {typeof b.participation_pct === 'number' ? `${Math.min(Math.max(b.participation_pct, 0), 100).toFixed(2)}%` : (b.participation_pct || '-')}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">participation</span>
                          </div>
                        </td>
                         {/* <td className="px-6 py-4 text-right">
                           <div className="flex flex-col items-end">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                               typeof b.score_pct === 'number' && b.score_pct >= 50 ? 'bg-blue-100 text-blue-800' :
                               typeof b.score_pct === 'number' && b.score_pct >= 30 ? 'bg-indigo-100 text-indigo-800' :
                               'bg-gray-100 text-gray-800'
                             }`}>
                               {typeof b.score_pct === 'number' ? `${Math.min(Math.max(b.score_pct, 0), 100).toFixed(1)}%` : (b.score_pct || '-')}
                             </span>
                             <span className="text-xs text-gray-500 mt-1">score</span>
                           </div>
                         </td> */}
                    </tr>
                  ))}
                    {(getSortedAndGroupedData() as BureauData[]).length === 0 && (
                    <tr>
                         <td className="px-6 py-12 text-center text-gray-500" colSpan={6}>
                          <div className="flex flex-col items-center gap-3">
                            <BarChart3 className="w-12 h-12 text-gray-400" />
                            <span className="text-lg font-medium">Aucun bureau à afficher</span>
                            <span className="text-sm">Les données des bureaux ne sont pas encore disponibles</span>
                          </div>
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer modernisé */}
      <footer id="contact" className="border-t bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 mt-20 text-white relative overflow-hidden">
        {/* Fond décoratif */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="container mx-auto px-4 pt-10 pb-6 relative z-10">
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
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Ressources
              </h4>
              <ul className="space-y-1">
                <li><a href="#candidats" className="hover:opacity-80 flex items-center gap-2"><User className="w-3 h-3" /> Candidats</a></li>
                <li><a href="#circonscriptions" className="hover:opacity-80 flex items-center gap-2"><Building className="w-3 h-3" /> Circonscriptions / Bureaux</a></li>
                <li>
                  <div className="relative" onMouseEnter={() => setResultsMenuOpen(true)} onMouseLeave={() => setResultsMenuOpen(false)}>
                    <button className="hover:opacity-80 flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" />
                      {results?.election?.status?.toLowerCase() === 'terminée' ? results.election.title : 'Résultats'}
                    </button>
                    {resultsMenuOpen && (
                      <div className="absolute left-0 mt-2 bg-white text-gov-dark rounded shadow-lg border min-w-[260px] z-50 py-2 max-h-[96px] overflow-y-auto">
                        <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm flex items-center gap-2" onClick={() => navigate(`/election/${results.election.id}/results`)}>
                          <BarChart3 className="w-3 h-3" />
                          {results.election.title}
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              </ul>
            </div>

            {/* Partage */}
            <div className="order-2 md:order-3 text-sm text-white/90 md:justify-self-end max-w-sm">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Partager
              </h4>
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
