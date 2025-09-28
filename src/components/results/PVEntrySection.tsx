import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  Upload,
  FileText,
  Calculator,
  ArrowLeft,
  Calendar,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PVEntrySectionProps {
  onClose: () => void;
  selectedElection: string;
}

const PVEntrySection: React.FC<PVEntrySectionProps> = ({ onClose, selectedElection }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [electionInfo, setElectionInfo] = useState<any>(null);
  const [candidatesData, setCandidatesData] = useState<any[]>([]);
  const [votingCenters, setVotingCenters] = useState<any[]>([]);
  const [votingBureaux, setVotingBureaux] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    province: '',
    ville: '',
    centre: '',
    bureau: '',
    inscrits: '',
    votants: '',
    bulletinsNuls: '',
    suffragesExprimes: '',
    candidateVotes: {} as Record<string, string>,
    uploadedFile: null as File | null
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Charger les centres et bureaux de vote depuis Supabase
  useEffect(() => {
    const loadVotingCenters = async () => {
      if (!selectedElection) return;
      
      try {
        // Filtrer STRICTEMENT par centres liés à l'élection via table de liaison election_centers
        const { data: ecRows, error: ecError } = await supabase
          .from('election_centers')
          .select('center_id')
          .eq('election_id', selectedElection);

        if (ecError) {
          console.error('Erreur lors du chargement des election_centers:', ecError);
          setVotingCenters([]);
          setVotingBureaux([]);
          return;
        }

        const centerIds = (ecRows || []).map((r: any) => r.center_id).filter(Boolean);

        if (centerIds.length === 0) {
          setVotingCenters([]);
          setVotingBureaux([]);
          return;
        }

        const { data: centers, error: centersError } = await supabase
          .from('voting_centers')
          .select('id, name')
          .in('id', centerIds);

        if (centersError) {
          console.error('Erreur lors du chargement des centres:', centersError);
          setVotingCenters([]);
          setVotingBureaux([]);
          return;
        }

        setVotingCenters(centers || []);

        const { data: bureaux, error: bureauxError } = await supabase
          .from('voting_bureaux')
          .select('id, name, center_id, registered_voters')
          .in('center_id', centerIds);

        if (bureauxError) {
          console.error('Erreur lors du chargement des bureaux:', bureauxError);
          setVotingBureaux([]);
          return;
        }

        setVotingBureaux(bureaux || []);
        
      } catch (error) {
        console.error('Erreur lors du chargement des centres/bureaux:', error);
        setVotingCenters([]);
        setVotingBureaux([]);
      }
    };
    
    loadVotingCenters();
  }, [selectedElection]);

  // Charger les informations de l'élection et ses candidats
  useEffect(() => {
    const loadElectionData = async () => {
      if (!selectedElection) return;
      
      try {
        setLoading(true);
        
        // Récupérer les infos de l'élection
        const { data: election, error: electionError } = await supabase
          .from('elections')
          .select('*')
          .eq('id', selectedElection)
          .single();
        
        if (electionError) throw electionError;
        setElectionInfo(election);
        
        // Récupérer uniquement les candidats liés à l'élection sélectionnée
        const { data: candidatesLinked, error: candidatesError } = await supabase
          .from('election_candidates')
          .select(`
            candidates!candidate_id(id, name, party)
          `)
          .eq('election_id', selectedElection);
        if (candidatesError) throw candidatesError;

        const mappedCandidates = (candidatesLinked || []).map((item: any) => ({
          id: item.candidates.id,
          name: item.candidates.name,
          party: item.candidates.party || 'Indépendant'
        }));

        setCandidatesData(mappedCandidates);

        // Pré-remplissage depuis DataEntrySection si présent
        try {
          const preCenterId = localStorage.getItem('pv_prefill_center_id') || '';
          const preCenterName = localStorage.getItem('pv_prefill_center_name') || '';
          const preBureauId = localStorage.getItem('pv_prefill_bureau_id') || '';
          const preBureauName = localStorage.getItem('pv_prefill_bureau_name') || '';
          if (preCenterId) {
            setFormData(prev => ({ ...prev, centre: preCenterId }));
          }
          if (preBureauId) {
            // récupérer inscrits pour le bureau
            const { data: bInfo } = await supabase
              .from('voting_bureaux')
              .select('registered_voters')
              .eq('id', preBureauId)
              .single();
            const rv = bInfo?.registered_voters || 0;
            setFormData(prev => ({ ...prev, bureau: preBureauId, inscrits: String(rv) }));
          }
          // nettoyer
          localStorage.removeItem('pv_prefill_center_id');
          localStorage.removeItem('pv_prefill_center_name');
          localStorage.removeItem('pv_prefill_bureau_id');
          localStorage.removeItem('pv_prefill_bureau_name');
        } catch {}
        
      } catch (error) {
        console.error('Erreur lors du chargement des données de l\'élection:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadElectionData();
  }, [selectedElection]);

  // Validation en temps réel
  const validateParticipation = () => {
    const errors: Record<string, string> = {};
    const votants = parseInt(formData.votants) || 0;
    const nuls = parseInt(formData.bulletinsNuls) || 0;
    const exprimes = parseInt(formData.suffragesExprimes) || 0;
    // Inscrits saisis en priorité, sinon depuis le bureau sélectionné
    const selectedBureau = votingBureaux.find(b => b.id === formData.bureau);
    const inscrits = (parseInt(formData.inscrits) || 0) || (selectedBureau?.registered_voters || 0);

    if (votants > inscrits) {
      errors.votants = `Le nombre de votants (${votants}) ne peut pas dépasser le nombre d'inscrits (${inscrits})`;
    }

    if ((nuls + exprimes) !== votants && votants > 0) {
      errors.total = `Bulletins nuls (${nuls}) + Suffrages exprimés (${exprimes}) = ${nuls + exprimes} ≠ Votants (${votants})`;
    }

    return errors;
  };

  const validateCandidateVotes = () => {
    const errors: Record<string, string> = {};
    if (!candidatesData || candidatesData.length === 0) return errors;
    const exprimes = parseInt(formData.suffragesExprimes) || 0;
    const totalVotes = Object.values(formData.candidateVotes).reduce((sum, votes) => sum + (parseInt(votes) || 0), 0);
    if (totalVotes !== exprimes && exprimes > 0) {
      errors.candidateTotal = `Total des voix des candidats (${totalVotes}) ≠ Suffrages exprimés (${exprimes})`;
    }
    return errors;
  };

  const handleStepValidation = (step: number) => {
    let errors: Record<string, string> = {};
    
    if (step === 2) {
      errors = validateParticipation();
    } else if (step === 3) {
      errors = { ...validateParticipation(), ...validateCandidateVotes() };
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (handleStepValidation(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, uploadedFile: file });
    }
  };

  const ensureBucketExists = async (bucket: string) => {
    // Supabase Storage n'a pas d'API REST directe listant les buckets via client JS v2,
    // on tente createBucket (idempotent côté serveur si même nom), sinon on ignore si déjà existant.
    try {
      // @ts-ignore: createBucket disponible sur supabase.storage via admin policies si autorisé
      await supabase.storage.createBucket(bucket, { public: true });
    } catch (err: any) {
      // Si existe déjà, on continue
      if (!(`${err?.message || ''}`.toLowerCase().includes('already exists'))) {
        // On ignore l'erreur, l'upload échouera s'il n'existe vraiment pas
      }
    }
  };

  const uploadPVFile = async (file: File, electionId: string, centerId: string, bureauId: string) => {
    const bucket = 'pv-uploads';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
    const relPath = `${electionId}/${centerId || 'center'}/${bureauId || 'bureau'}/${timestamp}_${safeName}`;

    // Première tentative
    let { data: uploadData, error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(relPath, file, { cacheControl: '3600', upsert: true, contentType: file.type || undefined });

    // Si bucket introuvable, tenter de le créer puis réessayer
    if (uploadErr && (`${uploadErr?.message || ''}`.toLowerCase().includes('bucket not found') || `${uploadErr?.error || ''}`.toLowerCase().includes('bucket'))) {
      await ensureBucketExists(bucket);
      ({ data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(relPath, file, { cacheControl: '3600', upsert: true, contentType: file.type || undefined }));
    }

    if (uploadErr) throw uploadErr;
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uploadData!.path);
    return publicUrlData.publicUrl;
  };

  const fetchRegisteredVotersForBureau = async (bureauId: string): Promise<number> => {
    if (!bureauId) return 0;
    try {
      const { data, error } = await supabase
        .from('voting_bureaux')
        .select('registered_voters')
        .eq('id', bureauId)
        .single();
      if (error) return 0;
      return data?.registered_voters || 0;
    } catch {
      return 0;
    }
  };

  // Fonction pour synchroniser les inscrits avec la table voting_bureaux
  const syncRegisteredVotersWithBureau = async (bureauId: string, registeredVoters: number) => {
    if (!bureauId || registeredVoters < 0) return;
    
    try {
      const { error } = await supabase
        .from('voting_bureaux')
        .update({ 
          registered_voters: registeredVoters,
          updated_at: new Date().toISOString()
        })
        .eq('id', bureauId);
      
      if (error) {
        console.error('Erreur lors de la synchronisation des inscrits:', error);
        toast.warning('Les inscrits ont été enregistrés dans le PV mais la synchronisation avec le bureau a échoué.');
      } else {
        console.log(`✅ Inscrits synchronisés: Bureau ${bureauId} -> ${registeredVoters} inscrits`);
      }
    } catch (err) {
      console.error('Erreur lors de la synchronisation des inscrits:', err);
      toast.warning('Les inscrits ont été enregistrés dans le PV mais la synchronisation avec le bureau a échoué.');
    }
  };

  const handleSubmitPV = async () => {
    if (!canSubmit() || !selectedElection) return;
    try {
      setSubmitting(true);
      const bureauId = formData.bureau;
      const centerId = formData.centre;

      // Récupérer les inscrits du bureau si possible, mais prioriser champ saisi
      let registeredVoters = parseInt(formData.inscrits) || 0;
      try {
        const { data: bInfo, error: bErr } = await supabase
          .from('voting_bureaux')
          .select('registered_voters')
          .eq('id', bureauId)
          .single();
        if (!bErr && bInfo && !registeredVoters) {
          registeredVoters = bInfo.registered_voters || 0;
          setFormData(prev => ({ ...prev, inscrits: String(registeredVoters) }));
        }
      } catch (e) {
        // ignore et rester à 0
      }

      let pvPhotoUrl: string | null = null;
      if (formData.uploadedFile) {
        try {
          pvPhotoUrl = await uploadPVFile(formData.uploadedFile, selectedElection, centerId, bureauId);
        } catch (uploadErr: any) {
          console.error('Upload PV échoué:', uploadErr);
          toast.warning(`Upload du PV échoué: ${uploadErr?.message || 'erreur inconnue'}. Enregistrement sans fichier.`);
        }
      }

      const total_voters = parseInt(formData.votants) || 0;
      const null_votes = parseInt(formData.bulletinsNuls) || 0;
      const votes_expressed = parseInt(formData.suffragesExprimes) || 0;

      // Empêcher une double saisie: si un PV existe déjà pour (election_id, bureau_id), on met à jour au lieu d'insérer
      const { data: existingPv, error: findPvErr } = await supabase
        .from('procès_verbaux')
        .select('id')
        .eq('election_id', selectedElection)
        .eq('bureau_id', bureauId)
        .limit(1)
        .maybeSingle();
      if (findPvErr) throw findPvErr;

      let pv;
      if (existingPv?.id) {
        const { data: updated, error: updateErr } = await supabase
          .from('procès_verbaux')
          .update({
            total_registered: registeredVoters,
            total_voters,
            null_votes,
            votes_expressed,
            status: 'entered',
            entered_at: new Date().toISOString(),
            pv_photo_url: pvPhotoUrl || undefined
          })
          .eq('id', existingPv.id)
          .select()
          .single();
        if (updateErr) throw updateErr;
        pv = updated;
        
        // Synchroniser les inscrits avec la table voting_bureaux pour les mises à jour aussi
        await syncRegisteredVotersWithBureau(bureauId, registeredVoters);
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('procès_verbaux')
          .insert({
            election_id: selectedElection,
            bureau_id: bureauId,
            total_registered: registeredVoters,
            total_voters,
            null_votes,
            votes_expressed,
            status: 'entered',
            entered_at: new Date().toISOString(),
            pv_photo_url: pvPhotoUrl
          })
          .select()
          .single();
        if (insertErr) throw insertErr;
        pv = inserted;
        
        // Synchroniser les inscrits avec la table voting_bureaux pour les nouveaux PV aussi
        await syncRegisteredVotersWithBureau(bureauId, registeredVoters);
      }

      const candidateEntries = Object.entries(formData.candidateVotes)
        .map(([candidateId, votes]) => ({
          pv_id: pv.id,
          candidate_id: candidateId,
          votes: parseInt(votes) || 0
        }));
      if (candidateEntries.length > 0) {
        const { error: crErr } = await supabase.from('candidate_results').insert(candidateEntries);
        if (crErr) throw crErr;
      }

      toast.success(existingPv?.id ? 'PV mis à jour avec succès.' : 'PV enregistré avec succès.');
      onClose();
    } catch (err) {
      console.error('Erreur soumission PV:', err);
      toast.error('Échec enregistrement PV');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = () => {
    const step2Valid = Object.keys(validateParticipation()).length === 0;
    const step3Valid = Object.keys(validateCandidateVotes()).length === 0;
    // La pièce-jointe n'est pas obligatoire à la saisie
    return step2Valid && step3Valid;
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (currentStep === step) return <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{step}</div>;
    return <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">{step}</div>;
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification du Bureau de Vote</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des centres de vote...</p>
                </div>
              </div>
            ) : votingCenters.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun centre de vote trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Aucun centre de vote n'est configuré pour cette élection dans la zone géographique correspondante.
                </p>
                <p className="text-sm text-gray-500">
                  Veuillez d'abord configurer les centres de vote dans la section "Gestion des Élections".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="centre">Centre de Vote</Label>
                  <Select 
                    value={formData.centre} 
                    onValueChange={(value) => setFormData({ ...formData, centre: value, bureau: '' })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un centre" />
                    </SelectTrigger>
                    <SelectContent>
                      {votingCenters.map((center) => (
                        <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bureau">Bureau de Vote</Label>
                  <Select 
                    value={formData.bureau} 
                    onValueChange={async (value) => {
                      const rv = await fetchRegisteredVotersForBureau(value);
                      setFormData({ ...formData, bureau: value, inscrits: String(rv) });
                    }}
                    disabled={!formData.centre || loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un bureau" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.centre && votingBureaux
                        .filter(bureau => bureau.center_id === formData.centre)
                        .map((bureau) => (
                          <SelectItem key={bureau.id} value={bureau.id}>{bureau.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.bureau && (() => {
              const selectedBureau = votingBureaux.find(b => b.id === formData.bureau);
              const selectedCenter = votingCenters.find(c => c.id === formData.centre);
              
              return (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Information du Bureau</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Centre:</span>
                      <span className="font-semibold ml-2">{selectedCenter?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Bureau:</span>
                      <span className="font-semibold ml-2">{selectedBureau?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saisie des Chiffres de Participation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="inscrits">Inscrits</Label>
                <Input 
                  id="inscrits" 
                  type="number" 
                  value={formData.inscrits}
                  onChange={(e) => setFormData({ ...formData, inscrits: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="votants">Nombre de Votants</Label>
                <Input
                  id="votants"
                  type="number"
                  value={formData.votants}
                  onChange={(e) => setFormData({ ...formData, votants: e.target.value, suffragesExprimes: String((parseInt(e.target.value)||0) - (parseInt(formData.bulletinsNuls)||0)) })}
                  className={validationErrors.votants ? 'border-red-500' : ''}
                />
                {validationErrors.votants && (
                  <div className="flex items-center space-x-1 mt-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">{validationErrors.votants}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="bulletinsNuls">Bulletins Nuls</Label>
                <Input
                  id="bulletinsNuls"
                  type="number"
                  value={formData.bulletinsNuls}
                  onChange={(e) => setFormData({ ...formData, bulletinsNuls: e.target.value, suffragesExprimes: String((parseInt(formData.votants)||0) - (parseInt(e.target.value)||0)) })}
                />
              </div>

              <div>
                <Label htmlFor="suffragesExprimes">Suffrages Exprimés</Label>
                <Input id="suffragesExprimes" type="number" value={formData.suffragesExprimes} readOnly />
              </div>
            </div>

            {validationErrors.total && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{validationErrors.total}</span>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Vérification Automatique</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Bulletins nuls + Suffrages exprimés:</span>
                  <span className="font-semibold">
                    {(parseInt(formData.bulletinsNuls) || 0) + (parseInt(formData.suffragesExprimes) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nombre de votants:</span>
                  <span className="font-semibold">{parseInt(formData.votants) || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saisie des Résultats par Candidat</h3>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Chargement des candidats...</p>
                </div>
              ) : candidatesData.length > 0 ? (
                candidatesData.map((candidate) => (
                  <div key={candidate.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.party}</p>
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="Voix"
                          value={formData.candidateVotes[candidate.id] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            candidateVotes: { ...formData.candidateVotes, [candidate.id]: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucun candidat trouvé pour cette élection</p>
                </div>
              )}
            </div>

            {validationErrors.candidateTotal && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{validationErrors.candidateTotal}</span>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Vérification des Résultats</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Total voix candidats:</span>
                  <span className="font-semibold">
                    {Object.values(formData.candidateVotes).reduce((sum, votes) => sum + (parseInt(votes) || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Suffrages exprimés:</span>
                  <span className="font-semibold">{parseInt(formData.suffragesExprimes) || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import du PV Scanné</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Téléverser le PV physique</h4>
              <p className="text-sm text-gray-600 mb-4">Formats acceptés: PDF, JPG, PNG (max. 10MB)</p>
              {!formData.uploadedFile && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  ⚠️ Aucun fichier ajouté. Le PV peut être saisi et apparaître dans l'onglet Publier, mais ne pourra pas être validé sans PV physique.
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                Choisir un fichier
              </Button>
              
              {formData.uploadedFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-green-700">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{formData.uploadedFile.name}</span>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vérification et Soumission</h3>
            
            <div className="space-y-6">
              {/* Résumé des données */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé des Données Saisies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Bureau de Vote</h4>
                    <p className="text-sm text-gray-600">
                      {(() => {
                        const centerName = votingCenters.find(c => c.id === formData.centre)?.name || 'Centre inconnu';
                        const bureauName = votingBureaux.find(b => b.id === formData.bureau)?.name || 'Bureau inconnu';
                        return `${centerName} → ${bureauName}`;
                      })()}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Participation</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Votants:</span>
                        <span className="font-semibold ml-2">{formData.votants}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bulletins nuls:</span>
                        <span className="font-semibold ml-2">{formData.bulletinsNuls}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Suffrages exprimés:</span>
                        <span className="font-semibold ml-2">{formData.suffragesExprimes}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Résultats par Candidat</h4>
                    <div className="space-y-2">
                      {candidatesData.length > 0 ? (
                        candidatesData.map((candidate) => (
                          <div key={candidate.id} className="flex justify-between text-sm">
                            <span>{candidate.name}</span>
                            <span className="font-semibold">{formData.candidateVotes[candidate.id] || 0} voix</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Aucun candidat chargé</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Document Attaché</h4>
                    {formData.uploadedFile ? (
                      <div className="flex items-center space-x-2 text-green-700">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{formData.uploadedFile.name}</span>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">Aucun document attaché</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </Button>
        <h2 className="text-xl font-bold text-gray-900">Assistant de Saisie PV</h2>
      </div>

      {/* Informations de l'élection */}
      {electionInfo && (
        <Card className="gov-card border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{electionInfo.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(electionInfo.election_date).toLocaleDateString('fr-FR', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <Badge variant={electionInfo.status === 'En cours' ? 'default' : 'secondary'}>
                      {electionInfo.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{candidatesData.length} candidats</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Type: {electionInfo.type || 'Élection'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress bar */}
      <Card className="gov-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                {getStepIcon(step)}
                {step < 5 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
              </div>
            ))}
          </div>
          
          <Progress value={(currentStep / 5) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Étape {currentStep} sur 5</span>
            <span>{Math.round((currentStep / 5) * 100)}% complété</span>
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card className="gov-card">
        <CardContent className="p-6">
          {(() => {
            const centerName = votingCenters.find(c => c.id === formData.centre)?.name || '—';
            const bureauName = votingBureaux.find(b => b.id === formData.bureau)?.name || '—';
            const hasContext = !!formData.centre || !!formData.bureau;
            return hasContext ? (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between text-sm text-blue-900">
                <div>
                  <span>Centre: <span className="font-semibold">{centerName}</span></span>
                  <span className="mx-2">•</span>
                  <span>Bureau: <span className="font-semibold">{bureauName}</span></span>
                </div>
                {formData.inscrits && (
                  <div className="text-blue-800">Inscrits: <span className="font-semibold">{formData.inscrits}</span></div>
                )}
              </div>
            ) : null;
          })()}

          {renderWizardStep()}
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            
            {currentStep < 5 ? (
              <Button 
                onClick={nextStep}
                disabled={!formData.bureau && currentStep === 1}
                className="bg-gov-blue hover:bg-gov-blue-dark"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmitPV}
                disabled={!canSubmit() || submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {submitting ? 'Soumission...' : 'Soumettre le PV'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PVEntrySection;
