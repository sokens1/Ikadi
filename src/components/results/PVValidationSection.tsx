
import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { toast } from 'sonner';

interface PVValidationSectionProps { selectedElection: string }

const PVValidationSection: React.FC<PVValidationSectionProps> = ({ selectedElection }) => {
  const [selectedPV, setSelectedPV] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'entered' | 'validated' | 'anomaly' | 'published'>('all');
  const [loading, setLoading] = useState(false);
  const [pvs, setPvs] = useState<any[]>([]);
  const [bureauxMap, setBureauxMap] = useState<Map<string, { id: string; name: string; center_id: string }>>(new Map());
  const [centersMap, setCentersMap] = useState<Map<string, { id: string; name: string }>>(new Map());
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<{ total_registered: number; total_voters: number; null_votes: number; votes_expressed: number }>({ total_registered: 0, total_voters: 0, null_votes: 0, votes_expressed: 0 });
  const [candidateResults, setCandidateResults] = useState<Array<{ id: string; name: string; votes: number }>>([]);
  const [newPvFile, setNewPvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!selectedElection) { setPvs([]); setBureauxMap(new Map()); setCentersMap(new Map()); setLoading(false); return; }
        const { data: pvRows, error: pvErr } = await supabase
          .from('procès_verbaux')
          .select('id, bureau_id, total_registered, total_voters, null_votes, votes_expressed, status, entered_at, pv_photo_url')
          .eq('election_id', selectedElection)
          .order('created_at', { ascending: false })
          .limit(500);
        if (pvErr) throw pvErr;
        // Filtrer les PV aux centres liés à l'élection via election_centers
        const bureauIds = Array.from(new Set((pvRows || []).map(r => r.bureau_id).filter(Boolean)));
        if (bureauIds.length) {
          const { data: bureaus, error: bErr } = await supabase
            .from('voting_bureaux')
            .select('id, name, center_id')
            .in('id', bureauIds);
          if (bErr) throw bErr;
          const centerIds = Array.from(new Set((bureaus || []).map(b => b.center_id)));
          // Restreindre aux centers de election_centers
          const { data: ecRows, error: ecErr } = await supabase
            .from('election_centers')
            .select('center_id')
            .eq('election_id', selectedElection);
          if (ecErr) throw ecErr;
          const allowedCenterIds = new Set((ecRows || []).map((r: any) => r.center_id));
          const filteredBureaus = (bureaus || []).filter(b => allowedCenterIds.has(b.center_id));
          const filteredCenterIds = Array.from(new Set(filteredBureaus.map(b => b.center_id)));
          const filteredPvRows = (pvRows || []).filter(r => filteredBureaus.some(b => b.id === r.bureau_id));
          setPvs(filteredPvRows);
          const { data: centers, error: cErr } = centerIds.length
            ? await supabase.from('voting_centers').select('id, name').in('id', filteredCenterIds)
            : { data: [], error: null } as any;
          if (cErr) throw cErr;
          setBureauxMap(new Map(filteredBureaus.map(b => [b.id, b])));
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
  }, [selectedElection]);

  const displayedPVs = useMemo(() => {
    const enriched = pvs.map(pv => {
      const bureau = bureauxMap.get(pv.bureau_id);
      const center = bureau ? centersMap.get(bureau.center_id) : undefined;
      return {
        id: pv.id,
        status: pv.status,
        bureauLabel: `${center?.name || 'Centre'} - ${bureau?.name || 'Bureau'}`,
        timestamp: pv.entered_at ? new Date(pv.entered_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        total_registered: pv.total_registered,
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

  const validateEditValues = () => {
    const errors: Record<string, string> = {};
    const inscrits = Number(editValues.total_registered) || 0;
    const votants = Number(editValues.total_voters) || 0;
    const nuls = Number(editValues.null_votes) || 0;
    const exprimes = Number(editValues.votes_expressed) || 0;
    const totalCandidat = candidateResults.reduce((s, c) => s + (Number(c.votes) || 0), 0);

    if (votants > inscrits) {
      errors.votants = `Le nombre de votants (${votants}) ne peut pas dépasser le nombre d'inscrits (${inscrits})`;
    }
    if (nuls + exprimes !== votants) {
      errors.total = `Bulletins nuls (${nuls}) + Suffrages exprimés (${exprimes}) = ${nuls + exprimes} ≠ Votants (${votants})`;
    }
    if (exprimes !== totalCandidat) {
      errors.candidateTotal = `Total voix candidats (${totalCandidat}) ≠ Suffrages exprimés (${exprimes})`;
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Charger les résultats par candidat pour le PV sélectionné
  useEffect(() => {
    const loadCandidateResults = async () => {
      if (!selectedPV) { setCandidateResults([]); return; }
      const { data, error } = await supabase
        .from('candidate_results')
        .select('id, votes, candidates(id, name)')
        .eq('pv_id', selectedPV);
      if (error) { console.error('Erreur chargement résultats candidats:', error); setCandidateResults([]); return; }
      const mapped = (data || []).map((r: any) => ({ id: r.candidates?.id || r.id, name: r.candidates?.name || 'Candidat', votes: r.votes || 0 }));
      setCandidateResults(mapped);
    };
    loadCandidateResults();
  }, [selectedPV]);

  useEffect(() => {
    if (!selectedPVData) return;
    setEditValues({
      total_registered: selectedPVData.total_registered || 0,
      total_voters: selectedPVData.total_voters || 0,
      null_votes: selectedPVData.null_votes || 0,
      votes_expressed: selectedPVData.votes_expressed || 0,
    });
  }, [selectedPVData]);

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
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setEditMode(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    {editMode ? (
                        <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span>Inscrits:</span>
                          <input className={`border rounded px-2 py-1 w-28 ${editErrors.votants ? 'border-red-500' : ''}`} type="number" value={editValues.total_registered} onChange={e => setEditValues(v => ({ ...v, total_registered: parseInt(e.target.value) || 0 }))} />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Votants:</span>
                          <input className={`border rounded px-2 py-1 w-28 ${editErrors.votants ? 'border-red-500' : ''}`} type="number" value={editValues.total_voters} onChange={e => setEditValues(v => ({ ...v, total_voters: parseInt(e.target.value) || 0 }))} />
                          </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Bulletins nuls:</span>
                          <input className={`border rounded px-2 py-1 w-28 ${editErrors.total ? 'border-red-500' : ''}`} type="number" value={editValues.null_votes} onChange={e => setEditValues(v => ({ ...v, null_votes: parseInt(e.target.value) || 0 }))} />
                          </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Suffrages exprimés:</span>
                          <input className={`border rounded px-2 py-1 w-28 ${editErrors.total || editErrors.candidateTotal ? 'border-red-500' : ''}`} type="number" value={editValues.votes_expressed} onChange={e => setEditValues(v => ({ ...v, votes_expressed: parseInt(e.target.value) || 0 }))} />
                          </div>
                        {(editErrors.votants || editErrors.total || editErrors.candidateTotal) && (
                          <div className="text-xs text-red-600 mt-2">
                            {editErrors.votants && <div>{editErrors.votants}</div>}
                            {editErrors.total && <div>{editErrors.total}</div>}
                            {editErrors.candidateTotal && <div>{editErrors.candidateTotal}</div>}
                          </div>
                        )}
                        </div>
                            ) : (
                              <>
                        <div className="flex justify-between"><span>Inscrits:</span><span className="font-medium">{editValues.total_registered || 0}</span></div>
                        <div className="flex justify-between"><span>Votants:</span><span className="font-medium">{editValues.total_voters || 0}</span></div>
                        <div className="flex justify-between"><span>Bulletins nuls:</span><span className="font-medium">{editValues.null_votes || 0}</span></div>
                        <div className="flex justify-between"><span>Suffrages exprimés:</span><span className="font-medium">{editValues.votes_expressed || 0}</span></div>
                              </>
                            )}
                        </div>
                      </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Document Scanné</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      {!selectedPVData.pv_photo_url && (
                        <h5 className="font-medium text-gray-900 mb-2">Aucun document</h5>
                      )}
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Button variant="outline" size="sm" disabled={!selectedPVData.pv_photo_url} onClick={() => selectedPVData.pv_photo_url && window.open(selectedPVData.pv_photo_url, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" /> Voir
                        </Button>
                        {editMode && (
                          <>
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="application/pdf,image/*" 
                              onChange={e => setNewPvFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                              Remplacer le document
                            </Button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Résultats par candidat */}
                  <div>
                <h4 className="font-medium text-gray-900 mb-3">Résultats par Candidat</h4>
                {candidateResults.length > 0 ? (
                  <div className="space-y-2">
                    {candidateResults.map(cr => (
                      <div key={cr.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{cr.name}</span>
                        {editMode ? (
                          <input
                            type="number"
                            className="border rounded px-2 py-1 w-24 text-right"
                            value={cr.votes}
                            onChange={e => {
                              const value = parseInt(e.target.value || '0');
                              setCandidateResults(prev => prev.map(c => c.id === cr.id ? { ...c, votes: value } : c));
                            }}
                          />
                        ) : (
                          <span className="font-semibold">{cr.votes}</span>
                        )}
                    </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Aucun résultat détaillé saisi</div>
                )}
                </div>

                <div>
                  <Label htmlFor="comment">Commentaire de validation</Label>
                <Textarea id="comment" placeholder="Ajouter un commentaire..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                </div>

              <div className="flex space-x-4 justify-end">
                {!editMode && (
                  <Button onClick={() => {
                    setEditValues({
                      total_registered: (editValues.total_registered || 0),
                      total_voters: (selectedPVData.total_voters || 0),
                      null_votes: (selectedPVData.null_votes || 0),
                      votes_expressed: (selectedPVData.votes_expressed || 0)
                    });
                    setEditMode(true);
                  }} variant="outline">
                    Modifier
                  </Button>
                )}
                {editMode && (
                  <Button onClick={async () => {
                    if (!selectedPV) return;
                    if (!validateEditValues()) {
                      toast.error("Veuillez corriger les incohérences avant d'enregistrer.");
                      return;
                    }
                    let pvPhotoUrl: string | null = null;
                    try {
                      if (newPvFile) {
                        const bucket = 'pv-uploads';
                        const path = `${selectedElection}/${selectedPV}/${Date.now()}_${newPvFile.name.replace(/\s+/g,'_')}`;
                        const { error: upErr } = await supabase.storage.from(bucket).upload(path, newPvFile, { upsert: true });
                        if (upErr) throw upErr;
                        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
                        pvPhotoUrl = pub?.publicUrl || null;
                      }
                      const updatePayload: any = {
                        total_registered: editValues.total_registered || 0,
                        total_voters: editValues.total_voters || 0,
                        null_votes: editValues.null_votes || 0,
                        votes_expressed: editValues.votes_expressed || 0,
                      };
                      if (pvPhotoUrl) updatePayload.pv_photo_url = pvPhotoUrl;
                      const { error: pvErr } = await supabase
                        .from('procès_verbaux')
                        .update(updatePayload)
                        .eq('id', selectedPV);
                      if (pvErr) throw pvErr;

                      for (const cr of candidateResults) {
                        const { data: existing } = await supabase
                          .from('candidate_results')
                          .select('id')
                          .eq('pv_id', selectedPV)
                          .eq('candidate_id', cr.id)
                          .maybeSingle();
                        if (existing?.id) {
                          await supabase
                            .from('candidate_results')
                            .update({ votes: cr.votes })
                            .eq('id', existing.id);
                        } else {
                          await supabase
                            .from('candidate_results')
                            .insert({ pv_id: selectedPV, candidate_id: cr.id, votes: cr.votes });
                        }
                      }

                      setPvs(prev => prev.map(p => p.id === selectedPV ? { ...p, total_voters: editValues.total_voters, null_votes: editValues.null_votes, votes_expressed: editValues.votes_expressed, pv_photo_url: pvPhotoUrl || p.pv_photo_url } : p));
                      setEditMode(false);
                      setNewPvFile(null);
                    } catch (err) {
                      console.error('Erreur maj PV/candidats:', err);
                      toast.error("Échec de l'enregistrement du PV");
                    }
                  }} className="bg-green-600 hover:bg-green-700 text-white">
                    Enregistrer
                  </Button>
                )}
                <Button onClick={async () => {
                  if (!selectedPV) return;
                  if (!confirm('Supprimer ce PV ? Cette action est irréversible.')) return;
                  // Supprimer d'abord les résultats liés
                  const { error: crErr } = await supabase
                    .from('candidate_results')
                    .delete()
                    .eq('pv_id', selectedPV);
                  if (crErr) { console.error('Erreur suppression résultats:', crErr); return; }
                  // Supprimer le PV
                  const { error: pvErr } = await supabase
                    .from('procès_verbaux')
                    .delete()
                    .eq('id', selectedPV);
                  if (pvErr) { console.error('Erreur suppression PV:', pvErr); return; }
                  // Mettre à jour l'état local
                  setPvs(prev => prev.filter(p => p.id !== selectedPV));
                  setDetailOpen(false);
                }} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  Supprimer
                  </Button>
                <Button onClick={async () => {
                  if (!selectedPV) return;
                  const { error } = await supabase
                    .from('procès_verbaux')
                    .update({ status: 'validated', validated_at: new Date().toISOString() })
                    .eq('id', selectedPV);
                  if (error) {
                    console.error('Erreur validation PV:', error);
                  } else {
                    setPvs(prev => prev.map(p => p.id === selectedPV ? { ...p, status: 'validated' } : p));
                    setDetailOpen(false);
                  }
                }} className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="w-4 h-4 mr-2" /> Valider
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
