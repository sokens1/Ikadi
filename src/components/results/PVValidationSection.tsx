
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileCheck, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  User,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PVValidationSection = () => {
  const [selectedPV, setSelectedPV] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'entered' | 'validated' | 'anomaly' | 'published'>('all');
  const [loading, setLoading] = useState(false);
  const [pvs, setPvs] = useState<any[]>([]);
  const [bureauxMap, setBureauxMap] = useState<Map<string, { id: string; name: string; center_id: string }>>(new Map());
  const [centersMap, setCentersMap] = useState<Map<string, { id: string; name: string }>>(new Map());
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: pvRows, error: pvErr } = await supabase
          .from('procès_verbaux')
          .select('id, bureau_id, total_voters, null_votes, votes_expressed, status, entered_at, pv_photo_url')
          .order('created_at', { ascending: false })
          .limit(500);
        if (pvErr) throw pvErr;
        setPvs(pvRows || []);
        const bureauIds = Array.from(new Set((pvRows || []).map(r => r.bureau_id).filter(Boolean)));
        if (bureauIds.length) {
          const { data: bureaus, error: bErr } = await supabase
            .from('voting_bureaux')
            .select('id, name, center_id')
            .in('id', bureauIds);
          if (bErr) throw bErr;
          const centerIds = Array.from(new Set((bureaus || []).map(b => b.center_id)));
          const { data: centers, error: cErr } = centerIds.length
            ? await supabase.from('voting_centers').select('id, name').in('id', centerIds)
            : { data: [], error: null } as any;
          if (cErr) throw cErr;
          setBureauxMap(new Map((bureaus || []).map(b => [b.id, b])));
          setCentersMap(new Map((centers || []).map(c => [c.id, c])));
        } else {
          setBureauxMap(new Map());
          setCentersMap(new Map());
        }
      } catch (e) {
        console.error('Erreur chargement PV:', e);
        setPvs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayedPVs = useMemo(() => {
    const enriched = pvs.map(pv => {
      const bureau = bureauxMap.get(pv.bureau_id);
      const center = bureau ? centersMap.get(bureau.center_id) : undefined;
      return {
        id: pv.id,
        status: pv.status,
        bureauLabel: `${center?.name || 'Centre'} - ${bureau?.name || 'Bureau'}`,
        timestamp: pv.entered_at ? new Date(pv.entered_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        total_voters: pv.total_voters,
        votes_expressed: pv.votes_expressed,
        null_votes: pv.null_votes,
        pv_photo_url: pv.pv_photo_url,
      };
    });
    if (filter === 'all') return enriched;
    return enriched.filter(e => e.status === filter);
  }, [pvs, bureauxMap, centersMap, filter]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'entered':
        return 'Saisi';
      case 'validated':
        return 'Validé';
      case 'anomaly':
        return 'Anomalie';
      case 'published':
        return 'Publié';
      default:
        return status;
    }
  };

  const getPriorityBadge = (status: string) => (
    <Badge className={
      status === 'validated' ? 'bg-green-100 text-green-800 border-green-200'
      : status === 'anomaly' ? 'bg-red-100 text-red-800 border-red-200'
      : status === 'entered' ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-orange-100 text-orange-800 border-orange-200'
    }>
      {getStatusLabel(status)}
    </Badge>
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'anomaly':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredPVs = displayedPVs;

  const handleValidation = (action: 'approve' | 'reject' | 'correction') => {
    // Handle validation action
    console.log(`Action: ${action}, PV: ${selectedPV}, Comment: ${comment}`);
    setSelectedPV(null);
    setComment('');
  };

  const selectedPVData = useMemo(() => filteredPVs.find(pv => pv.id === selectedPV), [filteredPVs, selectedPV]);

  return (
    <div className="space-y-6">
      {/* Filtres et statistiques */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gov-gray">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5" />
              <span>File d'Attente de Validation</span>
            </div>
            <Badge className="bg-orange-100 text-orange-800">
              {loading ? '...' : pvs.length} PV
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} size="sm">Tous</Button>
            <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')} size="sm">En attente</Button>
            <Button variant={filter === 'entered' ? 'default' : 'outline'} onClick={() => setFilter('entered')} size="sm">Saisis</Button>
            <Button variant={filter === 'validated' ? 'default' : 'outline'} onClick={() => setFilter('validated')} size="sm">Validés</Button>
            <Button variant={filter === 'anomaly' ? 'default' : 'outline'} onClick={() => setFilter('anomaly')} size="sm">Anomalie</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Liste des PV en attente */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="text-lg text-gov-gray">PV à Valider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPVs.map((pv) => (
                <div 
                  key={pv.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPV === pv.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => { setSelectedPV(pv.id); setDetailOpen(true); }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(pv.status)}
                      <span className="font-medium text-gray-900">{pv.bureauLabel}</span>
                    </div>
                    {getPriorityBadge(pv.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{pv.timestamp}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Votants: {pv.total_voters}</span>
                    <span>Exprimés: {pv.votes_expressed}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* Modal détails PV */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails du PV</DialogTitle>
          </DialogHeader>
          {selectedPVData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedPVData.status)}
                  <span className="font-semibold">{(() => {
                    const bureau = bureauxMap.get(pvs.find(p=>p.id===selectedPVData.id)?.bureau_id || '');
                    const center = bureau ? centersMap.get(bureau.center_id) : undefined;
                    return `${center?.name || 'Centre'} - ${bureau?.name || 'Bureau'}`;
                  })()}</span>
                </div>
                {getPriorityBadge(selectedPVData.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Participation</h4>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1 text-sm">
                    <div className="flex justify-between"><span>Votants:</span><span className="font-medium">{selectedPVData.total_voters}</span></div>
                    <div className="flex justify-between"><span>Bulletins nuls:</span><span className="font-medium">{selectedPVData.null_votes ?? 0}</span></div>
                    <div className="flex justify-between"><span>Suffrages exprimés:</span><span className="font-medium">{selectedPVData.votes_expressed ?? 0}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Document Scanné</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <h5 className="font-medium text-gray-900 mb-2">{selectedPVData.pv_photo_url ? 'Document attaché' : 'Aucun document'}</h5>
                    <Button variant="outline" size="sm" disabled={!selectedPVData.pv_photo_url} onClick={() => selectedPVData.pv_photo_url && window.open(selectedPVData.pv_photo_url, '_blank')}>
                      <Eye className="w-4 h-4 mr-2" /> Voir le document
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Commentaire de validation</Label>
                <Textarea id="comment" placeholder="Ajouter un commentaire..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
              </div>

              <div className="flex space-x-4">
                <Button onClick={() => handleValidation('approve')} className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approuver
                </Button>
                <Button onClick={() => handleValidation('correction')} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                  <MessageSquare className="w-4 h-4 mr-2" /> Demander Correction
                </Button>
                <Button onClick={() => handleValidation('reject')} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-2" /> Rejeter
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PVValidationSection;
