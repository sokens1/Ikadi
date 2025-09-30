import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';

type ZoneType = 'departement' | 'commune';

interface CrossAnalysisSectionProps {
  electionId: string;
}

interface CenterRow {
  id: string;
  name: string;
}

interface BureauRow {
  id: string;
  name: string;
}

interface CandidateRow {
  id: string;
  name: string;
  party?: string;
}

interface BureauCandidateSummaryRow {
  election_id: string;
  bureau_id: string;
  center_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_votes: number;
  candidate_percentage?: number;
  candidate_participation_pct?: number;
}

const CrossAnalysisSection: React.FC<CrossAnalysisSectionProps> = ({ electionId }) => {
  const [zoneType, setZoneType] = useState<ZoneType | ''>('');
  const [zoneKey, setZoneKey] = useState<string>('');
  const [centers, setCenters] = useState<CenterRow[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<CenterRow[]>([]);
  const [localElectionCenters, setLocalElectionCenters] = useState<CenterRow[]>([]);
  const [legislativeElectionCenters, setLegislativeElectionCenters] = useState<CenterRow[]>([]);
  const [localElectionId, setLocalElectionId] = useState<string | null>(null);
  const [legislativeElectionId, setLegislativeElectionId] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [selectedCenterName, setSelectedCenterName] = useState<string>('');
  const [bureaux, setBureaux] = useState<BureauRow[]>([]);
  const [selectedBureauId, setSelectedBureauId] = useState<string>('');
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [bureauCandidateRows, setBureauCandidateRows] = useState<BureauCandidateSummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBureaux, setLoadingBureaux] = useState(false);

  // Charger centres rattachés à l'élection (via election_centers),
  // + préparer une liste spécifique des centres d'une élection "Locale" dans la même commune (pour la zone Commune)
  useEffect(() => {
    const loadCenters = async () => {
      try {
        // 0) Charger info élection courante (pour récupérer commune_id)
        const { data: cur, error: curErr } = await supabase
          .from('elections')
          .select('id, type, commune_id, department_id')
          .eq('id', electionId)
          .single();

        // 1) Centres de l'élection en cours
        const { data: ecData, error: ecError } = await supabase
          .from('election_centers')
          .select('center_id, voting_centers!inner(id, name)')
          .eq('election_id', electionId);

        if (!ecError && Array.isArray(ecData) && ecData.length > 0) {
          const list: CenterRow[] = ecData
            .map((row: any) => row.voting_centers)
            .filter((c: any) => c && c.id)
            .map((c: any) => ({ id: String(c.id), name: c.name }));
          setCenters(list);
        } else {
          // 2) Fallback: tous les centres
          const { data, error } = await supabase
            .from('voting_centers')
            .select('id, name')
            .order('name');
          if (error) throw error;
          const list: CenterRow[] = (data || []).map((c: any) => ({ id: String(c.id), name: c.name }));
          setCenters(list);
        }

        // 3) Préparer centres pour la zone "Commune" depuis une élection Locale
        try {
          // Si l'élection courante est Locale, utiliser ses centres; sinon chercher la dernière Locale dans la même commune
          const isCurrentLocal = String(cur?.type || '').toLowerCase().includes('locale');
          let localElectionId: string | null = null;

          if (isCurrentLocal) {
            localElectionId = String(cur?.id || electionId);
          } else {
            // Chercher une élection Locale dans la même commune; sinon, fallback sur même département
            let q = supabase
              .from('elections')
              .select('id, type, commune_id, department_id')
              .ilike('type', '%locale%')
              .order('election_date', { ascending: false })
              .limit(1);
            if (cur?.commune_id) q = q.eq('commune_id', cur.commune_id);
            else if (cur?.department_id) q = q.eq('department_id', cur.department_id);
            const { data: localElections, error: localErr } = await q;
            if (!localErr && Array.isArray(localElections) && localElections.length > 0) {
              localElectionId = String(localElections[0].id);
            }
          }

          if (localElectionId) {
            const { data: ecLocal, error: ecLocalErr } = await supabase
              .from('election_centers')
              .select('center_id, voting_centers!inner(id, name)')
              .eq('election_id', localElectionId);
            if (!ecLocalErr && Array.isArray(ecLocal)) {
              const localList: CenterRow[] = ecLocal
                .map((row: any) => row.voting_centers)
                .filter((c: any) => c && c.id)
                .map((c: any) => ({ id: String(c.id), name: c.name }));
              setLocalElectionCenters(localList);
              setLocalElectionId(localElectionId);
            } else {
              setLocalElectionCenters([]);
              setLocalElectionId(null);
            }
          } else {
            setLocalElectionCenters([]);
            setLocalElectionId(null);
          }
        } catch (_) {
          setLocalElectionCenters([]);
          setLocalElectionId(null);
        }

        // 4) Préparer centres pour la zone "Département" depuis une élection Législative
        try {
          const isCurrentLegislative = String(cur?.type || '').toLowerCase().includes('législ');
          let legislativeElectionId: string | null = null;

          if (isCurrentLegislative) {
            legislativeElectionId = String(cur?.id || electionId);
          } else {
            // Chercher une élection Législative dans le même département (prioritaire), sinon même commune
            let q = supabase
              .from('elections')
              .select('id, type, department_id, commune_id')
              .ilike('type', '%législ%')
              .order('election_date', { ascending: false })
              .limit(1);
            if (cur?.department_id) q = q.eq('department_id', cur.department_id);
            else if (cur?.commune_id) q = q.eq('commune_id', cur.commune_id);
            const { data: legis, error: legisErr } = await q;
            if (!legisErr && Array.isArray(legis) && legis.length > 0) {
              legislativeElectionId = String(legis[0].id);
            }
          }

          if (legislativeElectionId) {
            const { data: ecLeg, error: ecLegErr } = await supabase
              .from('election_centers')
              .select('center_id, voting_centers!inner(id, name)')
              .eq('election_id', legislativeElectionId);
            if (!ecLegErr && Array.isArray(ecLeg)) {
              const legList: CenterRow[] = ecLeg
                .map((row: any) => row.voting_centers)
                .filter((c: any) => c && c.id)
                .map((c: any) => ({ id: String(c.id), name: c.name }));
              setLegislativeElectionCenters(legList);
              setLegislativeElectionId(legislativeElectionId);
            } else {
              setLegislativeElectionCenters([]);
              setLegislativeElectionId(null);
            }
          } else {
            setLegislativeElectionCenters([]);
            setLegislativeElectionId(null);
          }
        } catch (_) {
          setLegislativeElectionCenters([]);
          setLegislativeElectionId(null);
        }
      } catch (_) {
        setCenters([]);
        setLocalElectionCenters([]);
        setLegislativeElectionCenters([]);
        setLocalElectionId(null);
        setLegislativeElectionId(null);
      }
    };
    loadCenters();
  }, [electionId]);

  // Charger candidats rattachés à l'élection (pour récupérer le parti), fallback global
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        // 1) Candidats rattachés à l'élection
        const { data: ecData, error: ecError } = await supabase
          .from('election_candidates')
          .select('candidate_id, candidates!inner(id, name, party)')
          .eq('election_id', electionId);

        if (!ecError && Array.isArray(ecData) && ecData.length > 0) {
          const list: CandidateRow[] = ecData
            .map((row: any) => row.candidates)
            .filter((c: any) => c && c.id)
            .map((c: any) => ({ id: String(c.id), name: c.name, party: c.party || undefined }));
          setCandidates(list);
          return;
        }

        // 2) Fallback: tous les candidats
        const { data, error } = await supabase
          .from('candidates')
          .select('id, name, party')
          .order('name');
        if (error) throw error;
        const list: CandidateRow[] = (data || []).map((c: any) => ({ id: String(c.id), name: c.name, party: c.party || undefined }));
        setCandidates(list);
      } catch (_) {
        setCandidates([]);
      }
    };
    loadCandidates();
  }, [electionId]);

  // Filtrer centres selon zone
  useEffect(() => {
    if (!zoneType) {
      setFilteredCenters([]);
      setSelectedCenterId('');
      return;
    }
    if (zoneType === 'commune') {
      // Commune: 10 centres issus d'une élection Locale
      setFilteredCenters(localElectionCenters.slice(0, 10));
    } else {
      // Département: prendre 16 centres des Législatives moins les 10 des Locales → 6 restants
      const localIds = new Set(localElectionCenters.map(c => c.id));
      const legFirst16 = legislativeElectionCenters.slice(0, 16);
      const remaining = legFirst16.filter(c => !localIds.has(c.id));
      // Si pas assez (moins de 6), fallback en complétant avec d'autres centres légis
      const final = remaining.length >= 6
        ? remaining.slice(0, 6)
        : [...remaining, ...legislativeElectionCenters.slice(16)].slice(0, 6);
      setFilteredCenters(final);
    }
    setSelectedCenterId('');
  }, [zoneType, centers, localElectionCenters]);

  // Charger bureaux du centre (en essayant de filtrer par election_id quand possible)
  useEffect(() => {
    const loadBureaux = async () => {
      if (!selectedCenterId) {
        setBureaux([]);
        setSelectedBureauId('');
        return;
      }
      try {
        setLoadingBureaux(true);
        // Déterminer l'élection liée à la sélection courante
        const selectionElectionId = zoneType === 'commune'
          ? (localElectionId || electionId)
          : (legislativeElectionId || electionId);

        // Requête OR sur center_id ou voting_center_id, avec filtre election_id si dispo
        // Note: PostgREST or() nécessite des colonnes valides, on tente la version la plus générale
        const { data: orData, error: orErr } = await supabase
          .from('voting_bureaux')
          .select('id, name, center_id, voting_center_id, election_id')
          .or(`center_id.eq.${selectedCenterId},voting_center_id.eq.${selectedCenterId}`)
          .order('name');

        if (!orErr && Array.isArray(orData) && orData.length > 0) {
          // Si election_id présent, filtrer côté client pour l'élection en cours selon la zone
          const filtered = orData.filter((b: any) => !b.election_id || String(b.election_id) === String(selectionElectionId));
          const list: BureauRow[] = (filtered.length > 0 ? filtered : orData).map((b: any) => ({ id: String(b.id), name: b.name }));
          setBureaux(list);
          return;
        }

        setBureaux([]);
      } catch (_) {
        setBureaux([]);
      } finally {
        setLoadingBureaux(false);
      }
    };
    loadBureaux();
  }, [selectedCenterId, zoneType, localElectionId, legislativeElectionId]);

  // Charger résultats candidats pour le bureau sélectionné (pour constituer la liste à cocher et les métriques)
  useEffect(() => {
    const loadBureauCandidateRows = async () => {
      if (!selectedBureauId || !electionId) {
        setBureauCandidateRows([]);
        return;
      }
      try {
        setLoading(true);
        // Choisir l'élection en fonction de la zone sélectionnée
        const targetElectionId = zoneType === 'commune'
          ? (localElectionId || electionId)
          : (legislativeElectionId || electionId);

        const { data, error } = await supabase
          .from('bureau_candidate_results_summary')
          .select('election_id, bureau_id, center_id, candidate_id, candidate_name, candidate_votes, candidate_percentage, candidate_participation_pct')
          .eq('election_id', targetElectionId)
          .eq('bureau_id', selectedBureauId as any)
          .order('candidate_votes', { ascending: false });
        if (error) throw error;
        setBureauCandidateRows((data || []) as BureauCandidateSummaryRow[]);
      } catch (_) {
        setBureauCandidateRows([]);
      } finally {
        setLoading(false);
      }
    };
    loadBureauCandidateRows();
  }, [selectedBureauId, electionId]);

  const candidateIdToParty = useMemo(() => {
    const map = new Map<string, string | undefined>();
    candidates.forEach(c => map.set(c.id, c.party));
    return map;
  }, [candidates]);

  const displayedRows = useMemo(() => {
    if (selectedCandidateIds.length < 2) return [] as BureauCandidateSummaryRow[];
    const setIds = new Set(selectedCandidateIds);
    return bureauCandidateRows.filter(row => setIds.has(String(row.candidate_id)));
  }, [bureauCandidateRows, selectedCandidateIds]);

  return (
    <section id="cross-analysis" className="py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="gov-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gov-gray">Analyse croisée</CardTitle>
              {(zoneType || selectedCenterId || selectedBureauId || selectedCandidateIds.length > 0 || bureauCandidateRows.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setZoneType('');
                  setZoneKey('');
                  setFilteredCenters([]);
                  setSelectedCenterId('');
                  setSelectedCenterName('');
                  setBureaux([]);
                  setSelectedBureauId('');
                  setSelectedCandidateIds([]);
                  setBureauCandidateRows([]);
                }}
              >
                Réinitialiser
              </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select value={zoneType} onValueChange={(v) => { setZoneType(v as ZoneType); setZoneKey(''); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="departement">Département</SelectItem>
                    <SelectItem value="commune">Commune</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{zoneType ? `Centre (${zoneType === 'departement' ? '6 max' : '10 max'})` : 'Centre'}</Label>
                <Select value={selectedCenterId} onValueChange={(v) => { setSelectedCenterId(v); setSelectedCenterName(filteredCenters.find(c => c.id === v)?.name || ''); setSelectedBureauId(''); setSelectedCandidateIds([]); }} disabled={!zoneType || filteredCenters.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={zoneType ? 'Sélectionner un centre' : 'Choisir la zone d’abord'} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCenters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bureau</Label>
                <Select value={selectedBureauId} onValueChange={(v) => { setSelectedBureauId(String(v)); setSelectedCandidateIds([]); }} disabled={!selectedCenterId || bureaux.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedCenterId ? 'Choisir un centre' : (bureaux.length ? 'Sélectionner un bureau' : 'Aucun bureau')} />
                  </SelectTrigger>
                  <SelectContent>
                    {bureaux.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Candidats (min. 2)</Label>
                <div className="max-h-40 overflow-auto rounded border border-gray-200 p-2 bg-white">
                  {loading && <div className="text-sm text-gray-500 px-1 py-0.5">Chargement…</div>}
                  {!loading && bureauCandidateRows.length === 0 && (
                    <div className="text-sm text-gray-500 px-1 py-0.5">Aucun candidat pour ce bureau</div>
                  )}
                  {!loading && bureauCandidateRows.map(row => {
                    const id = String(row.candidate_id);
                    const checked = selectedCandidateIds.includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 py-1 cursor-pointer">
                        <Checkbox checked={checked} onCheckedChange={(v) => {
                          const isChecked = Boolean(v);
                          setSelectedCandidateIds(prev => {
                            if (isChecked) return Array.from(new Set([...prev, id]));
                            return prev.filter(x => x !== id);
                          });
                        }} />
                        <span className="text-sm text-gray-800">{row.candidate_name}</span>
                      </label>
                    );
                  })}
                </div>
                {selectedCandidateIds.length > 0 && selectedCandidateIds.length < 2 && (
                  <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1">Veuillez sélectionner au moins 2 candidats</div>
                )}
              </div>
            </div>

            {/* Tableau comparatif */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Comparatif des résultats</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCandidateIds.length < 2 ? (
                    <div className="text-sm text-gray-500">Sélectionnez au moins 2 candidats pour afficher le comparatif.</div>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <table className="min-w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 border">Candidat</th>
                            <th className="text-left px-3 py-2 border">Parti</th>
                            <th className="text-right px-3 py-2 border">Voix</th>
                            <th className="text-right px-3 py-2 border">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedRows.map((row) => {
                            const party = candidateIdToParty.get(String(row.candidate_id));
                            const scorePct = typeof row.candidate_percentage === 'number' ? Math.min(Math.max(row.candidate_percentage, 0), 100) : undefined;
                            return (
                              <tr key={String(row.candidate_id)} className="odd:bg-white even:bg-gray-50">
                                <td className="px-3 py-2 border font-medium text-gray-800">{row.candidate_name}</td>
                                <td className="px-3 py-2 border text-gray-700">{party || '-'}</td>
                                <td className="px-3 py-2 border text-right font-semibold">{(row.candidate_votes ?? 0).toLocaleString()}</td>
                                <td className="px-3 py-2 border text-right">
                                  {typeof scorePct === 'number' ? `${scorePct.toFixed(2)}%` : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CrossAnalysisSection;


