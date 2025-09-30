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
    
    console.log('[Analyse croisée] Filtrage centres par zone:', { 
      zoneType, 
      localElectionCentersCount: localElectionCenters.length,
      legislativeElectionCentersCount: legislativeElectionCenters.length 
    });

    if (zoneType === 'commune') {
      // Commune: 10 centres issus d'une élection Locale
      if (localElectionCenters.length > 0) {
        setFilteredCenters(localElectionCenters.slice(0, 10));
      } else {
        console.log('[Analyse croisée] Aucun centre local disponible, utilisation des centres généraux');
        setFilteredCenters(centers.slice(0, 10));
      }
    } else {
      // Département: prendre 16 centres des Législatives moins les 10 des Locales → 6 restants
      if (legislativeElectionCenters.length > 0) {
        const localIds = new Set(localElectionCenters.map(c => c.id));
        const legFirst16 = legislativeElectionCenters.slice(0, 16);
        const remaining = legFirst16.filter(c => !localIds.has(c.id));
        // Si pas assez (moins de 6), fallback en complétant avec d'autres centres légis
        const final = remaining.length >= 6
          ? remaining.slice(0, 6)
          : [...remaining, ...legislativeElectionCenters.slice(16)].slice(0, 6);
        setFilteredCenters(final);
      } else {
        console.log('[Analyse croisée] Aucun centre législatif disponible, utilisation des centres généraux');
        setFilteredCenters(centers.slice(0, 6));
      }
    }
    setSelectedCenterId('');
  }, [zoneType, localElectionCenters, legislativeElectionCenters, centers]);

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

        console.log('[Analyse croisée] Chargement bureaux...', { 
          selectedCenterId, 
          selectedCenterName, 
          selectionElectionId, 
          zoneType,
          isMobile: window.innerWidth < 768,
          filteredCentersCount: filteredCenters.length,
          localElectionCentersCount: localElectionCenters.length,
          legislativeElectionCentersCount: legislativeElectionCenters.length
        });

        // Méthode 0: Vérifier d'abord s'il y a des bureaux dans la table
        const { data: allBureauxCount, error: countError } = await supabase
          .from('voting_bureaux')
          .select('id', { count: 'exact' });

        console.log('[Analyse croisée] Nombre total de bureaux dans la table:', { allBureauxCount, countError });

        // Vérifier d'abord que le centre existe dans voting_centers
        const { data: centerCheck, error: centerCheckError } = await supabase
          .from('voting_centers')
          .select('id, name')
          .eq('id', selectedCenterId)
          .single();

        console.log('[Analyse croisée] Vérification centre:', { centerCheck, centerCheckError, selectedCenterId });

        if (centerCheckError || !centerCheck) {
          console.log('[Analyse croisée] Centre non trouvé dans voting_centers:', selectedCenterId);
          
          // Essayer de trouver le centre par nom si l'ID ne fonctionne pas
          if (selectedCenterName) {
            console.log('[Analyse croisée] Tentative de recherche du centre par nom:', selectedCenterName);
            const { data: centerByName, error: centerByNameError } = await supabase
              .from('voting_centers')
              .select('id, name')
              .ilike('name', `%${selectedCenterName}%`)
              .limit(1);
            
            console.log('[Analyse croisée] Centre trouvé par nom:', { centerByName, centerByNameError });
            
            if (centerByName && centerByName.length > 0) {
              console.log('[Analyse croisée] Utilisation du centre trouvé par nom:', centerByName[0]);
              // Mettre à jour l'ID du centre pour les recherches suivantes
              const foundCenterId = centerByName[0].id;
              // Recharger les bureaux avec le bon ID
              const { data: bureauData, error: bureauError } = await supabase
                .from('voting_bureaux')
                .select('id, name, center_id, voting_center_id')
                .or(`center_id.eq.${foundCenterId},voting_center_id.eq.${foundCenterId}`)
                .order('name');
              
              console.log('[Analyse croisée] Bureaux avec centre corrigé:', { bureauData, bureauError, foundCenterId });
              
              if (!bureauError && Array.isArray(bureauData) && bureauData.length > 0) {
                const list: BureauRow[] = bureauData.map((b: any) => ({ id: String(b.id), name: b.name }));
                setBureaux(list);
                console.log('[Analyse croisée] Bureaux trouvés avec centre corrigé:', list);
                return;
              }
            }
          }
          
          setBureaux([]);
          return;
        }

        // Méthode 1: rechercher par center_id directement
        const { data: bureauData, error: bureauError } = await supabase
          .from('voting_bureaux')
          .select('id, name, center_id')
          .eq('center_id', selectedCenterId)
          .order('name');

        console.log('[Analyse croisée] Méthode 1 - center_id:', { bureauData, bureauError, selectedCenterId });

        if (!bureauError && Array.isArray(bureauData) && bureauData.length > 0) {
          const list: BureauRow[] = bureauData.map((b: any) => ({ id: String(b.id), name: b.name }));
          setBureaux(list);
          console.log('[Analyse croisée] Bureaux trouvés via center_id:', list);
          return;
        }

        // Méthode 2: rechercher par voting_center_id
        const { data: votingCenterData, error: votingCenterError } = await supabase
          .from('voting_bureaux')
          .select('id, name, voting_center_id')
          .eq('voting_center_id', selectedCenterId)
          .order('name');

        console.log('[Analyse croisée] Méthode 2 - voting_center_id:', { votingCenterData, votingCenterError, selectedCenterId });

        if (!votingCenterError && Array.isArray(votingCenterData) && votingCenterData.length > 0) {
          const list: BureauRow[] = votingCenterData.map((b: any) => ({ id: String(b.id), name: b.name }));
          setBureaux(list);
          console.log('[Analyse croisée] Bureaux trouvés via voting_center_id:', list);
          return;
        }

        // Méthode 3: Recherche par jointure avec voting_centers
        const { data: joinData, error: joinError } = await supabase
          .from('voting_bureaux')
          .select('id, name, voting_centers!inner(id)')
          .eq('voting_centers.id', selectedCenterId)
          .order('name');

        console.log('[Analyse croisée] Méthode 3 - jointure:', { joinData, joinError });

        if (!joinError && Array.isArray(joinData) && joinData.length > 0) {
          const list: BureauRow[] = joinData.map((b: any) => ({ id: String(b.id), name: b.name }));
          setBureaux(list);
          console.log('[Analyse croisée] Bureaux trouvés via jointure:', list);
          return;
        }

        // Méthode 4: Recherche par election_id et center_id
        const { data: electionData, error: electionError } = await supabase
          .from('voting_bureaux')
          .select('id, name, election_id, center_id, voting_center_id')
          .eq('election_id', selectionElectionId)
          .or(`center_id.eq.${selectedCenterId},voting_center_id.eq.${selectedCenterId}`)
          .order('name');

        console.log('[Analyse croisée] Méthode 4 - election_id:', { electionData, electionError, selectionElectionId });

        if (!electionError && Array.isArray(electionData) && electionData.length > 0) {
          const list: BureauRow[] = electionData.map((b: any) => ({ id: String(b.id), name: b.name }));
          setBureaux(list);
          console.log('[Analyse croisée] Bureaux trouvés via election_id:', list);
          return;
        }


        // Méthode 5: Explorer la structure de la table voting_bureaux
        const { data: allBureaux, error: allBureauxError } = await supabase
          .from('voting_bureaux')
          .select('id, name, center_id, voting_center_id, election_id')
          .limit(10);

        console.log('[Analyse croisée] Structure table voting_bureaux:', { allBureaux, allBureauxError });

        // Méthode 6: Recherche par nom de centre (si disponible)
        if (selectedCenterName) {
          const { data: nameData, error: nameError } = await supabase
            .from('voting_bureaux')
            .select('id, name, voting_centers!inner(id, name)')
            .eq('voting_centers.name', selectedCenterName)
            .order('name');

          console.log('[Analyse croisée] Méthode 6 - recherche par nom:', { nameData, nameError, selectedCenterName });

          if (!nameError && Array.isArray(nameData) && nameData.length > 0) {
            const list: BureauRow[] = nameData.map((b: any) => ({ id: String(b.id), name: b.name }));
            setBureaux(list);
            console.log('[Analyse croisée] Bureaux trouvés via nom:', list);
            return;
          }

          // Méthode 7: Recherche par nom ilike (tolérant)
          const { data: nameIlikeData, error: nameIlikeError } = await supabase
            .from('voting_bureaux')
            .select('id, name, voting_centers!inner(id, name)')
            .ilike('voting_centers.name', `%${selectedCenterName}%`)
            .order('name');

          console.log('[Analyse croisée] Méthode 7 - recherche par nom ilike:', { nameIlikeData, nameIlikeError, selectedCenterName });

          if (!nameIlikeError && Array.isArray(nameIlikeData) && nameIlikeData.length > 0) {
            const list: BureauRow[] = nameIlikeData.map((b: any) => ({ id: String(b.id), name: b.name }));
            setBureaux(list);
            console.log('[Analyse croisée] Bureaux trouvés via nom ilike:', list);
            return;
          }
        }

        console.log('[Analyse croisée] Aucun bureau trouvé pour le centre:', { selectedCenterId, selectedCenterName });
        setBureaux([]);
      } catch (_) {
        setBureaux([]);
      } finally {
        setLoadingBureaux(false);
      }
    };
    loadBureaux();
  }, [selectedCenterId, selectedCenterName, zoneType, localElectionId, legislativeElectionId, electionId]);

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

        console.log('[Analyse croisée] Chargement candidats pour bureau:', { selectedBureauId, targetElectionId, zoneType });

        const { data, error } = await supabase
          .from('bureau_candidate_results_summary')
          .select('election_id, bureau_id, center_id, candidate_id, candidate_name, candidate_votes, candidate_percentage, candidate_participation_pct')
          .eq('election_id', targetElectionId)
          .eq('bureau_id', selectedBureauId as any)
          .order('candidate_votes', { ascending: false });
        
        console.log('[Analyse croisée] Résultat candidats:', { data, error, selectedBureauId, targetElectionId });

        if (!error && Array.isArray(data) && data.length > 0) {
          setBureauCandidateRows((data || []) as BureauCandidateSummaryRow[]);
        } else {
          setBureauCandidateRows([]);
        }
      } catch (err) {
        console.log('[Analyse croisée] Erreur chargement candidats:', err);
        setBureauCandidateRows([]);
      } finally {
        setLoading(false);
      }
    };
    loadBureauCandidateRows();
  }, [selectedBureauId, electionId, candidates, selectedCenterId]);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select value={zoneType} onValueChange={(v) => { setZoneType(v as ZoneType); setZoneKey(''); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une zone" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]" position="popper">
                    <SelectItem value="departement">Département</SelectItem>
                    <SelectItem value="commune">Commune</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{zoneType ? `Centre (${zoneType === 'departement' ? '6 max' : '10 max'})` : 'Centre'}</Label>
                <Select value={selectedCenterId} onValueChange={(v) => { setSelectedCenterId(v); setSelectedCenterName(filteredCenters.find(c => c.id === v)?.name || ''); setSelectedBureauId(''); setSelectedCandidateIds([]); }} disabled={!zoneType || filteredCenters.length === 0}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={zoneType ? 'Sélectionner un centre' : 'Choisir la zone d\'abord'} />
                  </SelectTrigger>
                  <SelectContent className="z-[100]" position="popper">
                    {filteredCenters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bureau</Label>
                <Select value={selectedBureauId} onValueChange={(v) => { setSelectedBureauId(String(v)); setSelectedCandidateIds([]); }} disabled={!selectedCenterId || bureaux.length === 0 || loadingBureaux}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      loadingBureaux ? 'Chargement...' :
                      !selectedCenterId ? 'Choisir un centre' : 
                      (bureaux.length ? 'Sélectionner un bureau' : 'Aucun bureau trouvé')
                    } />
                  </SelectTrigger>
                  <SelectContent className="z-[100]" position="popper">
                    {bureaux.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingBureaux && (
                  <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                    Chargement des bureaux...
                  </div>
                )}
                {!loadingBureaux && selectedCenterId && bureaux.length === 0 && (
                  <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-1">
                    Aucun bureau trouvé pour ce centre
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Candidats (min. 2)</Label>
                <div className="max-h-40 overflow-auto rounded border border-gray-200 p-2 bg-white min-h-[120px]">
                  {loading && <div className="text-sm text-gray-500 px-1 py-0.5">Chargement…</div>}
                  {!loading && bureauCandidateRows.length === 0 && (
                    <div className="text-sm text-gray-500 px-1 py-0.5">Aucun candidat pour ce bureau</div>
                  )}
                  {!loading && bureauCandidateRows.map(row => {
                    const id = String(row.candidate_id);
                    const checked = selectedCandidateIds.includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 rounded px-1 transition-colors">
                        <Checkbox checked={checked} onCheckedChange={(v) => {
                          const isChecked = Boolean(v);
                          setSelectedCandidateIds(prev => {
                            if (isChecked) return Array.from(new Set([...prev, id]));
                            return prev.filter(x => x !== id);
                          });
                        }} />
                        <span className="text-sm text-gray-800 flex-1">{row.candidate_name}</span>
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
                    <div className="space-y-4">
                      {/* Version mobile - cartes */}
                      <div className="block sm:hidden">
                        {displayedRows.map((row) => {
                          const party = candidateIdToParty.get(String(row.candidate_id));
                          const scorePct = typeof row.candidate_percentage === 'number' ? Math.min(Math.max(row.candidate_percentage, 0), 100) : undefined;
                          return (
                            <div key={String(row.candidate_id)} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <h3 className="font-semibold text-gray-800 text-sm mb-2">{row.candidate_name}</h3>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <span className="text-gray-500">Parti:</span>
                                  <p className="font-medium text-gray-700">{party || '-'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Score:</span>
                                  <p className="font-medium text-gray-700">
                                    {typeof scorePct === 'number' ? `${scorePct.toFixed(2)}%` : '-'}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-500">Voix:</span>
                                  <p className="font-bold text-lg text-gray-800">{(row.candidate_votes ?? 0).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Version desktop - tableau */}
                      <div className="hidden sm:block relative overflow-x-auto">
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


