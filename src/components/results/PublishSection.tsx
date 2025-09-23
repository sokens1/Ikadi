
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Upload, 
  Download, 
  Users, 
  TrendingUp,
  FileText,
  Eye,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PublishSectionProps {
  selectedElection: string;
}

const PublishSection: React.FC<PublishSectionProps> = ({ selectedElection }) => {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalResults, setFinalResults] = useState<any | null>(null);
  const [detailedResults, setDetailedResults] = useState<any[]>([]);
  const [centerBreakdown, setCenterBreakdown] = useState<any[]>([]);
  const [bureauBreakdown, setBureauBreakdown] = useState<any[]>([]);

  // Charger les résultats validés et calculer les agrégats (sans jointures PostgREST complexes)
  useEffect(() => {
    const loadFinalResults = async () => {
      if (!selectedElection) return;
      try {
        setLoading(true);
        // 1) Récupérer PV avec statut validé UNIQUEMENT
        const fetchPVs = async (status: string) => supabase
          .from('procès_verbaux')
          .select('id, bureau_id, total_voters, null_votes, votes_expressed, status, entered_at')
          .eq('election_id', selectedElection)
          .eq('status', status);

        const { data: pvs, error: pvError } = await fetchPVs('validated');
        if (pvError) throw pvError;

        // Restreindre aux centres liés à l'élection via election_centers
        const { data: ecRows, error: ecCentersErr } = await supabase
          .from('election_centers')
          .select('center_id')
          .eq('election_id', selectedElection);
        if (ecCentersErr) throw ecCentersErr;
        const allowedCenterIds = new Set((ecRows || []).map((r: any) => r.center_id));

        let filteredPvs = pvs || [];
        if (allowedCenterIds.size > 0) {
          const { data: bureauRows, error: bureauErr } = await supabase
          .from('voting_bureaux')
            .select('id, center_id')
            .in('center_id', Array.from(allowedCenterIds));
          if (bureauErr) throw bureauErr;
          const allowedBureauIds = new Set((bureauRows || []).map((b: any) => b.id));
          filteredPvs = filteredPvs.filter((pv: any) => allowedBureauIds.has(pv.bureau_id));
        }

        // 2) Récupérer résultats par candidat pour ces PV
        const pvIds = (filteredPvs || []).map(p => p.id);
        let crRows: any[] = [];
        if (pvIds.length > 0) {
          const { data: cr, error: crErr } = await supabase
            .from('candidate_results')
            .select('pv_id, candidate_id, votes, candidates!inner(id, name, party)')
            .in('pv_id', pvIds);
          if (crErr) throw crErr;
          crRows = cr || [];
        }

        // On n'utilise pas la vue agrégée ici pour respecter le filtre election_centers

        // 3) Récupérer la liste des candidats de l'élection (référence stricte)
        const { data: electionCands, error: ecErr } = await supabase
          .from('election_candidates')
          .select('candidates!inner(id, name, party)')
          .eq('election_id', selectedElection);
        if (ecErr) throw ecErr;
        const electionCandidates = (electionCands || []).map((row: any) => ({
          id: row.candidates.id,
          name: row.candidates.name,
          party: row.candidates.party || 'Indépendant'
        }));

        // 4) Récupérer libellés bureaux/centres
        const bureauIds = Array.from(new Set((filteredPvs || []).map(p => p.bureau_id).filter(Boolean)));
        let bureaux: any[] = [];
        let centers: any[] = [];
        if (bureauIds.length > 0) {
          const { data: bRows, error: bErr } = await supabase
            .from('voting_bureaux')
            .select('id, name, center_id')
            .in('id', bureauIds);
          if (bErr) throw bErr;
          bureaux = bRows || [];
          const centerIds = Array.from(new Set(bureaux.map(b => b.center_id)));
          if (centerIds.length > 0) {
            const { data: cRows, error: cErr } = await supabase
              .from('voting_centers')
              .select('id, name')
              .in('id', centerIds);
            if (cErr) throw cErr;
            centers = cRows || [];
          }
        }

        const bureauMap = new Map(bureaux.map(b => [b.id, b]));
        const centerMap = new Map(centers.map(c => [c.id, c]));

        // 5) Agrégations (n'afficher que les candidats de cette élection, même à 0 voix)
        const votesByCandidate: Record<string, { id: string; name: string; party: string; votes: number }> = {};
        electionCandidates.forEach(c => {
          votesByCandidate[c.id] = { id: c.id, name: c.name, party: c.party, votes: 0 };
        });
        let totalVotants = 0;
        let bulletinsNuls = 0;
        let totalInscrits = 0;

        // Agrégation locale à partir des candidate_results (respecte le filtre précédent)
        crRows.forEach((r: any) => {
            const cid = r.candidates?.id || r.candidate_id;
          if (!votesByCandidate[cid]) return;
            votesByCandidate[cid].votes += r.votes || 0;
          });

        (filteredPvs || []).forEach((pv: any) => {
          totalVotants += pv.total_voters || 0;
          bulletinsNuls += pv.null_votes || 0;
        });

        const candidates = Object.values(votesByCandidate).sort((a, b) => b.votes - a.votes);
        const totalVotes = candidates.reduce((s, c) => s + c.votes, 0);
        const candidatesWithPct = candidates.map((c, idx) => ({
          ...c,
          percentage: totalVotes > 0 ? +(100 * c.votes / totalVotes).toFixed(1) : 0,
          color: ['#22c55e','#ef4444','#3b82f6','#a855f7','#f59e0b','#06b6d4'][idx % 6]
        }));

        const validatedBureaux = (filteredPvs || []).length;
        const totalBureaux = validatedBureaux; // fallback si total inconnu

        setFinalResults({
          participation: {
            totalInscrits,
            totalVotants,
            tauxParticipation: totalBureaux > 0 ? Math.round((validatedBureaux / totalBureaux) * 1000)/10 : 0,
            bulletinsNuls,
            suffragesExprimes: totalVotes
          },
          candidates: candidatesWithPct,
          validatedBureaux,
          totalBureaux,
          lastUpdate: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });

        // 5) Résultats détaillés par bureau
        const detailed = (filteredPvs || []).map((pv: any) => {
          const b = bureauMap.get(pv.bureau_id);
          const c = b ? centerMap.get(b.center_id) : undefined;
          return {
            center: c?.name || 'Centre',
            bureau: b?.name || 'Bureau',
          inscrits: 0,
            votants: pv.total_voters || 0,
          notreCandidat: 0,
          adversaire1: 0,
          adversaire2: 0
          };
        });
        setDetailedResults(detailed);

        // 6) Chargement des breakdowns par centre et bureau (vues SQL)
        try {
          const [{ data: centersSum }, { data: bureauxSum }] = await Promise.all([
            supabase.from('center_results_summary').select('*').eq('election_id', selectedElection),
            supabase.from('bureau_results_summary').select('*').eq('election_id', selectedElection)
          ]);
          setCenterBreakdown(centersSum || []);
          setBureauBreakdown(bureauxSum || []);
        } catch (_) {
          setCenterBreakdown([]);
          setBureauBreakdown([]);
        }
      } catch (e) {
        console.error('Erreur chargement résultats finaux:', e);
        setFinalResults(null);
        setDetailedResults([]);
      } finally {
        setLoading(false);
      }
    };
    loadFinalResults();
  }, [selectedElection]);

  const pieChartData = useMemo(() => (
    finalResults && Array.isArray(finalResults.candidates)
      ? finalResults.candidates.map((candidate: any) => ({
          name: candidate.name || '—',
          value: Number(candidate.votes) || 0,
          percentage: Number(candidate.percentage) || 0,
          color: candidate.color || '#3b82f6'
        }))
      : []
  ), [finalResults]);

  const barChartData = useMemo(() => (
    finalResults && Array.isArray(finalResults.candidates)
      ? finalResults.candidates.map((candidate: any) => ({
          name: (candidate.name || '—').split(' ').slice(0, 2).join(' '),
          votes: Number(candidate.votes) || 0
        }))
      : []
  ), [finalResults]);

  const CenterAndBureauTables = () => (
    <div className="mt-8 space-y-8">
      {centerBreakdown.length > 0 && (
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="text-gov-dark">Par Centre de Vote</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centre</TableHead>
                  <TableHead className="text-right">Votants</TableHead>
                  <TableHead className="text-right">Nuls</TableHead>
                  <TableHead className="text-right">Exprimés</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centerBreakdown.map((row: any) => (
                  <TableRow key={`${row.center_id}`}>
                    <TableCell>{row.center_name}</TableCell>
                    <TableCell className="text-right">{Number(row.total_voters || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(row.total_null_votes || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(row.total_expressed_votes || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {bureauBreakdown.length > 0 && (
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="text-gov-dark">Par Bureau</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centre</TableHead>
                  <TableHead>Bureau</TableHead>
                  <TableHead className="text-right">Votants</TableHead>
                  <TableHead className="text-right">Nuls</TableHead>
                  <TableHead className="text-right">Exprimés</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bureauBreakdown.map((row: any) => (
                  <TableRow key={`${row.bureau_id}`}>
                    <TableCell>{centerBreakdown.find((c:any)=>c.center_id===row.center_id)?.center_name || 'Centre'}</TableCell>
                    <TableCell>{row.bureau_name}</TableCell>
                    <TableCell className="text-right">{Number(row.total_voters || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(row.total_null_votes || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(row.total_expressed_votes || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const handlePublish = async () => {
    try {
      // Marquer l'élection comme publiée
      const { error } = await supabase
        .from('elections')
        .update({ is_published: true, published_at: new Date().toISOString() })
        .eq('id', selectedElection);
      if (error) {
        console.error('Erreur publication:', error);
        return;
      }
      setShowPublishConfirm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const exportToPDF = () => {
    console.log('Export PDF...');
  };

  const exportToCSV = () => {
    console.log('Export CSV...');
  };

  return (
    <div className="space-y-6">
      {/* Statut de validation */}
      <Card className="gov-card border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Résultats Validés Prêts</h3>
                <p className="text-sm text-gray-600">
                  {finalResults ? (
                    <>
                      {finalResults.validatedBureaux} bureaux validés sur {finalResults.totalBureaux}
                      {' '}({finalResults.totalBureaux > 0 ? ((finalResults.validatedBureaux / finalResults.totalBureaux) * 100).toFixed(1) : 0}%)
                    </>
                  ) : '—'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Dernière mise à jour</div>
              <div className="font-medium">{finalResults?.lastUpdate || '—'}</div>
            </div>
          </div>
          <Progress 
            value={finalResults && finalResults.totalBureaux > 0 ? (finalResults.validatedBureaux / finalResults.totalBureaux) * 100 : 0} 
            className="mt-3"
          />
        </CardContent>
      </Card>

      {/* Résultats globaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPIs de participation */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <Users className="w-5 h-5" />
              <span>Participation Électorale</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                  {finalResults ? finalResults.participation.tauxParticipation : 0}%
                </div>
                <div className="text-sm text-gray-600">Taux de participation</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">
                    {finalResults ? finalResults.participation.totalVotants.toLocaleString() : 0}
                  </div>
                  <div className="text-gray-600">Votants</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {finalResults ? finalResults.participation.totalInscrits.toLocaleString() : 0}
                  </div>
                  <div className="text-gray-600">Inscrits</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {finalResults ? finalResults.participation.suffragesExprimes.toLocaleString() : 0}
                  </div>
                  <div className="text-gray-600">Exprimés</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                  {finalResults ? finalResults.participation.bulletinsNuls : 0}
                  </div>
                  <div className="text-gray-600">Bulletins nuls</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graphique camembert */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <BarChart3 className="w-5 h-5" />
              <span>Répartition des Voix</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                    label={({ percentage }: any) => `${percentage}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-500">Aucune donnée à afficher</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Détails par centre et par bureau */}
      <CenterAndBureauTables />

      {/* Tableau récapitulatif */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gov-gray">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Résultats Finaux par Candidat</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Données validées uniquement
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(finalResults ? finalResults.candidates : []).map((candidate: any, index: number) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-600">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.party}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: candidate.color }}>
                    {candidate.votes.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {candidate.percentage}% des voix
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Graphique en barres */}
          <div className="mt-6">
            {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="votes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-500">Aucune donnée à afficher</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions principales */}
      <div className="grid grid-cols-1 gap-4">
        {/* Publication */}
        <Card className="gov-card border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-blue-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  Publier les Résultats
                </h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Rendre les résultats visibles publiquement sur le tableau de bord
                </p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowPublishConfirm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    🚀 Publier les résultats
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Données Détaillées retirée sur demande */}
      </div>

      {/* Modal de confirmation de publication */}
      <Dialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Confirmer la publication</span>
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir publier ces résultats ? Cette action rendra les résultats 
              visibles publiquement sur le tableau de bord et ne pourra pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Résumé de la publication :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {finalResults ? finalResults.validatedBureaux : 0} bureaux validés</li>
                <li>• {finalResults ? finalResults.participation.suffragesExprimes.toLocaleString() : 0} suffrages exprimés</li>
                <li>• Taux de participation : {finalResults ? finalResults.participation.tauxParticipation : 0}%</li>
                <li>• Candidat en tête : {finalResults && finalResults.candidates[0] ? `${finalResults.candidates[0].name} (${finalResults.candidates[0].percentage}%)` : '—'}</li>
              </ul>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={handlePublish}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                Confirmer la publication
              </Button>
              <Button
                onClick={() => setShowPublishConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal vue détaillée */}
      <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résultats Détaillés par Bureau de Vote</DialogTitle>
            <DialogDescription>
              Vue complète des résultats validés pour tous les bureaux de vote
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centre de Vote</TableHead>
                  <TableHead>Bureau</TableHead>
                  <TableHead>Inscrits</TableHead>
                  <TableHead>Votants</TableHead>
                  <TableHead>Notre Candidat</TableHead>
                  <TableHead>Adversaire 1</TableHead>
                  <TableHead>Adversaire 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.center}</TableCell>
                    <TableCell>{result.bureau}</TableCell>
                    <TableCell>{result.inscrits}</TableCell>
                    <TableCell>{result.votants}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {result.notreCandidat}
                    </TableCell>
                    <TableCell>{result.adversaire1}</TableCell>
                    <TableCell>{result.adversaire2}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublishSection;
