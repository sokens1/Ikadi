/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Election } from '@/types/elections';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Select2, { Select2Option } from '@/components/ui/select2';
import { X, Save, Calendar, MapPin, Users, Building, Vote, Target, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import FloatingInput from '@/components/ui/floating-input';
import FloatingTextarea from '@/components/ui/floating-textarea';
import FloatingSelect from '@/components/ui/floating-select';
import { ModernForm, ModernFormSection, ModernFormGrid, ModernFormActions } from '@/components/ui/modern-form';
import MultiSelect from '@/components/ui/multi-select';

interface EditElectionModalProps {
  election: Election;
  onClose: () => void;
  onUpdate: (updatedData: Partial<Election>) => void;
}

const EditElectionModal: React.FC<EditElectionModalProps> = ({
  election,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    title: election.title,
    type: election.type,
    status: election.status,
    date: election.date.toISOString().split('T')[0],
    description: election.description || '',
    province: election.location.province,
    commune: election.location.commune,
    arrondissement: election.location.arrondissement,
    seatsAvailable: election.configuration.seatsAvailable || '',
    budget: election.configuration.budget || '',
    voteGoal: election.configuration.voteGoal || '',
    nbElecteurs: election.statistics.totalVoters || '',
    selectedCandidates: [] as string[],
    selectedCenters: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les données de localisation
  const [provinces, setProvinces] = useState<Array<{id: string, name: string}>>([]);
  // const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([]);
  const [communes, setCommunes] = useState<Array<{id: string, name: string}>>([]);
  const [arrondissements, setArrondissements] = useState<Array<{id: string, name: string}>>([]);
  
  // États pour les IDs sélectionnés
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  // const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>('');
  const [selectedArrondissementId, setSelectedArrondissementId] = useState<string>('');

  // États pour les données de candidats et centres
  const [candidates, setCandidates] = useState<Array<{identifiant: string, nom: string, parti: string, est_notre_candidat: boolean}>>([]);
  const [centers, setCenters] = useState<Array<{identifiant: string, nom: string, adresse: string, total_voters: number, total_bureaux: number}>>([]);

  // Charger les provinces
  const loadProvinces = async () => {
    try {
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setProvinces(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des provinces:', error);
    }
  };

  // Charger les départements
  // const loadDepartments = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('departments')
  //       .select('id, name')
  //       .order('name');
      
  //     if (error) throw error;
  //     setDepartments(data || []);
  //   } catch (error) {
  //     console.error('Erreur lors du chargement des départements:', error);
  //   }
  // };

  // Charger les communes
  const loadCommunes = async () => {
    try {
      const { data, error } = await supabase
        .from('communes')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCommunes(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des communes:', error);
    }
  };

  // Charger les arrondissements
  const loadArrondissements = async () => {
    try {
      const { data, error } = await supabase
        .from('arrondissements')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setArrondissements(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des arrondissements:', error);
    }
  };

  // Charger les candidats (essaie EN puis FR avec alias PostgREST)
  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('identifiant:id, nom:name, parti:party, est_notre_candidat:is_our_candidate')
        .order('name');
      if (!error) {
        setCandidates(data || []);
        return;
      }
      throw error;
    } catch (_) {
      try {
        const { data, error } = await supabase
          .from('candidats')
          .select('identifiant, nom, parti, est_notre_candidat')
          .order('nom');
        if (error) throw error;
        setCandidates(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des candidats:', error);
        setCandidates([]);
      }
    }
  };

  // Charger les centres de vote (essaie EN puis FR)
  const loadCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('voting_centers')
        .select('identifiant:id, nom:name, adresse:address, total_voters, total_bureaux')
        .order('name');
      if (!error) {
        setCenters(data || []);
        return;
      }
      throw error;
    } catch (_) {
      try {
        const { data, error } = await supabase
          .from('centres_de_vote')
          .select('identifiant, nom, adresse, total_voters, total_bureaux')
          .order('nom');
        if (error) throw error;
        setCenters(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des centres:', error);
        setCenters([]);
      }
    }
  };

  // Charger toutes les données
  useEffect(() => {
    loadProvinces();
    // loadDepartments();
    loadCommunes();
    loadArrondissements();
    loadCandidates();
    loadCenters();
  }, []);

  // Pré-sélectionner candidats et centres liés à l'élection (via tables de jonction)
  useEffect(() => {
    const loadLinkedSelections = async () => {
      try {
        const [{ data: ec, error: ecError }, { data: ez, error: ezError }] = await Promise.all([
          supabase.from('election_candidates').select('candidate_id').eq('election_id', election.id),
          supabase.from('election_centers').select('center_id').eq('election_id', election.id)
        ]);

        if (!ecError && ec) {
          const candidateIds = ec.map((r: any) => r.candidate_id as string);
          setFormData(prev => ({ ...prev, selectedCandidates: candidateIds }));
        }

        if (!ezError && ez) {
          const centerIds = ez.map((r: any) => r.center_id as string);
          setFormData(prev => ({ ...prev, selectedCenters: centerIds }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des liaisons candidats/centres:', error);
      }
    };

    loadLinkedSelections();
  }, [election.id]);

  // Initialiser les IDs sélectionnés avec les valeurs actuelles
  useEffect(() => {
    if (provinces.length > 0) {
      const currentProvince = provinces.find(p => p.name === formData.province);
      if (currentProvince) setSelectedProvinceId(currentProvince.id);
    }
  }, [provinces, formData.province]);

  // useEffect(() => {
  //   if (departments.length > 0) {
  //     const currentDepartment = departments.find(d => d.name === formData.department);
  //     if (currentDepartment) setSelectedDepartmentId(currentDepartment.id);
  //   }
  // }, [departments, formData.department]);

  useEffect(() => {
    if (communes.length > 0) {
      const currentCommune = communes.find(c => c.name === formData.commune);
      if (currentCommune) setSelectedCommuneId(currentCommune.id);
    }
  }, [communes, formData.commune]);

  useEffect(() => {
    if (arrondissements.length > 0) {
      const currentArrondissement = arrondissements.find(a => a.name === formData.arrondissement);
      if (currentArrondissement) setSelectedArrondissementId(currentArrondissement.id);
    }
  }, [arrondissements, formData.arrondissement]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fonction pour mettre à jour les liens candidats/centres
  const updateElectionLinks = async (electionId: string, candidateIds: string[], centerIds: string[]) => {
    try {
      console.log('updateElectionLinks appelé avec:', { electionId, candidateIds, centerIds });
      
      // Supprimer les anciens liens
      console.log('Suppression des anciens liens...');
      const { error: deleteCandidatesError } = await supabase
        .from('election_candidates')
        .delete()
        .eq('election_id', electionId);

      if (deleteCandidatesError) {
        console.error('Erreur lors de la suppression des candidats:', deleteCandidatesError);
        throw deleteCandidatesError;
      }

      const { error: deleteCentersError } = await supabase
        .from('election_centers')
        .delete()
        .eq('election_id', electionId);

      if (deleteCentersError) {
        console.error('Erreur lors de la suppression des centres:', deleteCentersError);
        throw deleteCentersError;
      }

      console.log('Anciens liens supprimés avec succès');

      // Créer les nouveaux liens candidats
      if (candidateIds.length > 0) {
        const candidateLinks = candidateIds.map(candidateId => ({
          election_id: electionId,
          candidate_id: candidateId,
          is_our_candidate: false // Par défaut, sera mis à jour si nécessaire
        }));

        console.log('Insertion des nouveaux liens candidats:', candidateLinks);

        const { data: candidateData, error: candidateError } = await supabase
          .from('election_candidates')
          .insert(candidateLinks)
          .select();

        if (candidateError) {
          console.error('Erreur lors de l\'insertion des candidats:', candidateError);
          throw candidateError;
        }

        console.log('Candidats insérés avec succès:', candidateData);
      } else {
        console.log('Aucun candidat à insérer');
      }

      // Créer les nouveaux liens centres
      if (centerIds.length > 0) {
        const centerLinks = centerIds.map(centerId => ({
          election_id: electionId,
          center_id: centerId
        }));

        console.log('Insertion des nouveaux liens centres:', centerLinks);

        const { data: centerData, error: centerError } = await supabase
          .from('election_centers')
          .insert(centerLinks)
          .select();

        if (centerError) {
          console.error('Erreur lors de l\'insertion des centres:', centerError);
          throw centerError;
        }

        console.log('Centres insérés avec succès:', centerData);
      } else {
        console.log('Aucun centre à insérer');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des liens:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre de l\'élection est requis');
      return;
    }

    if (!formData.type) {
      toast.error('Le type d\'élection est requis');
      return;
    }

    if (!formData.date) {
      toast.error('La date de l\'élection est requise');
      return;
    }

    if (new Date(formData.date) < new Date()) {
      toast.error('La date de l\'élection ne peut pas être dans le passé');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedData: Partial<Election> = {
        title: formData.title.trim(),
        type: formData.type as 'Législatives' | 'Locales' | 'Présidentielle',
        status: formData.status as 'À venir' | 'En cours' | 'Terminée' | 'Annulée',
        date: new Date(formData.date),
        description: formData.description.trim(),
        location: {
          province: formData.province,
          commune: formData.commune,
          arrondissement: formData.arrondissement,
          fullAddress: `${formData.commune}, ${formData.province}`,
        },
        configuration: {
          seatsAvailable: Number(formData.seatsAvailable) || 1,
          budget: Number(formData.budget) || 0,
          voteGoal: Number(formData.voteGoal) || 0,
          allowMultipleCandidates: election.configuration.allowMultipleCandidates,
          requirePhotoValidation: election.configuration.requirePhotoValidation,
        },
        statistics: {
          ...election.statistics,
          totalVoters: Number(formData.nbElecteurs) || 0,
        },
      };

      // Mettre à jour les liens candidats/centres
      console.log('Données de sélection avant mise à jour des liens:', {
        selectedCandidates: formData.selectedCandidates,
        selectedCenters: formData.selectedCenters
      });
      
      await updateElectionLinks(election.id, formData.selectedCandidates, formData.selectedCenters);

      await onUpdate(updatedData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            <div className="p-1.5 sm:p-2 bg-gov-blue/10 rounded-lg">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gov-blue" />
            </div>
            <span className="hidden xs:inline">Modification de l'élection</span>
            <span className="xs:hidden">Modifier élection</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm sm:text-base">
            Modifiez les informations de l'élection sélectionnée. Les champs marqués d'un astérisque (*) sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <ModernForm onSubmit={handleSubmit}>
          {/* Informations générales */}
          <ModernFormSection
            title="Informations Générales"
            description="Modifiez les paramètres de base de l'élection"
            icon={<Vote className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Titre de l'élection"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Élections Locales 2025"
                icon={<Building className="w-4 h-4" />}
                required
              />
              
              <FloatingSelect
                label="Type d'élection"
                value={formData.type}
                onChange={(value) => handleInputChange('type', value)}
                options={[
                  { value: "Législatives", label: "Législatives" },
                  { value: "Locales", label: "Locales" },
                  { value: "Présidentielle", label: "Présidentielle" }
                ]}
                icon={<Vote className="w-4 h-4" />}
                required
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Date de l'élection"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
                required
              />
              
              <FloatingSelect
                label="Statut"
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: "À venir", label: "À venir" },
                  { value: "En cours", label: "En cours" },
                  { value: "Terminée", label: "Terminée" },
                  { value: "Annulée", label: "Annulée" }
                ]}
                icon={<Target className="w-4 h-4" />}
              />
            </ModernFormGrid>

            <ModernFormGrid cols={1}>
              <FloatingTextarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description de l'élection..."
                rows={3}
                icon={<Building className="w-4 h-4" />}
                // helperText="Décrivez les objectifs et le contexte de cette élection"
              />
            </ModernFormGrid>
          </ModernFormSection>

          {/* Localisation */}
          <ModernFormSection
            title="Circonscription Électorale"
            description="Modifiez la zone géographique de l'élection"
            icon={<MapPin className="w-5 h-5" />}
          >
            <ModernFormGrid cols={1}>
              <Select2
                label="Province"
                placeholder="Rechercher une province..."
                options={provinces.map(p => ({ value: p.id, label: p.name }))}
                value={provinces.find(p => p.id === selectedProvinceId) ? 
                  { value: selectedProvinceId, label: provinces.find(p => p.id === selectedProvinceId)?.name || '' } : null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedProvinceId(selectedOption.value);
                    handleInputChange('province', selectedOption.label);
                  } else {
                    setSelectedProvinceId('');
                    handleInputChange('province', '');
                  }
                }}
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <Select2
                label="Commune"
                placeholder="Rechercher une commune..."
                options={communes.map(c => ({ value: c.id, label: c.name }))}
                value={communes.find(c => c.id === selectedCommuneId) ? 
                  { value: selectedCommuneId, label: communes.find(c => c.id === selectedCommuneId)?.name || '' } : null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedCommuneId(selectedOption.value);
                    handleInputChange('commune', selectedOption.label);
                  } else {
                    setSelectedCommuneId('');
                    handleInputChange('commune', '');
                  }
                }}
              />
              
              <Select2
                label="Arrondissement"
                placeholder="Rechercher un arrondissement..."
                options={arrondissements.map(a => ({ value: a.id, label: a.name }))}
                value={arrondissements.find(a => a.id === selectedArrondissementId) ? 
                  { value: selectedArrondissementId, label: arrondissements.find(a => a.id === selectedArrondissementId)?.name || '' } : null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedArrondissementId(selectedOption.value);
                    handleInputChange('arrondissement', selectedOption.label);
                  } else {
                    setSelectedArrondissementId('');
                    handleInputChange('arrondissement', '');
                  }
                }}
              />
            </ModernFormGrid>
          </ModernFormSection>

          {/* Configuration */}
          <ModernFormSection
            title="Configuration"
            description="Modifiez les paramètres de configuration de l'élection"
            icon={<Building className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Sièges disponibles"
                type="number"
                min="1"
                value={formData.seatsAvailable}
                onChange={(e) => handleInputChange('seatsAvailable', parseInt(e.target.value))}
                icon={<Target className="w-4 h-4" />}
                // helperText="Nombre de sièges à pourvoir"
              />
              
              <FloatingInput
                label="Nombre d'électeurs"
                type="number"
                min="0"
                value={formData.nbElecteurs}
                onChange={(e) => handleInputChange('nbElecteurs', parseInt(e.target.value))}
                placeholder="Ex: 50000"
                icon={<Users className="w-4 h-4" />}
                // helperText="Nombre total d'électeurs inscrits"
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Budget (FCFA)"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                icon={<Target className="w-4 h-4" />}
                // helperText="Budget alloué en francs CFA"
              />
              
              <FloatingInput
                label="Objectif de voix"
                type="number"
                min="0"
                value={formData.voteGoal}
                onChange={(e) => handleInputChange('voteGoal', parseInt(e.target.value))}
                icon={<Vote className="w-4 h-4" />}
                // helperText="Nombre de voix visées"
              />
            </ModernFormGrid>
          </ModernFormSection>

          {/* Configuration Électorale */}
          <ModernFormSection
            title="Configuration Électorale"
            description="Sélectionnez les candidats et centres de vote pour cette élection"
            icon={<Users className="w-5 h-5" />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sélection des candidats */}
              <MultiSelect
                options={candidates.map(candidate => ({
                  value: candidate.identifiant,
                  label: candidate.nom,
                  subtitle: candidate.parti,
                  metadata: { est_notre_candidat: candidate.est_notre_candidat }
                }))}
                selected={formData.selectedCandidates}
                onSelectionChange={(selected) => setFormData({...formData, selectedCandidates: selected})}
                placeholder="Rechercher et sélectionner des candidats..."
                title="Candidats"
                icon={<Users className="w-5 h-5 text-gov-blue" />}
                emptyMessage="Aucun candidat sélectionné"
                renderOption={(option) => (
                  <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-gov-blue/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gov-blue" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.subtitle}</p>
                      {option.metadata?.est_notre_candidat && (
                        <Badge className="bg-gov-blue text-white px-2 py-1 text-xs mt-1">
                          <Star className="w-3 h-3 mr-1" />
                          Notre Candidat
                        </Badge>
                      )}
                    </div>
                    <Checkbox
                      checked={formData.selectedCandidates.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!formData.selectedCandidates.includes(option.value)) {
                            setFormData({
                              ...formData,
                              selectedCandidates: [...formData.selectedCandidates, option.value]
                            });
                          }
                        } else {
                          setFormData({
                            ...formData,
                            selectedCandidates: formData.selectedCandidates.filter(id => id !== option.value)
                          });
                        }
                      }}
                    />
                  </div>
                )}
              />

              {/* Sélection des centres */}
              <MultiSelect
                options={centers.map(center => ({
                  value: center.identifiant,
                  label: center.nom,
                  subtitle: center.adresse,
                  metadata: { 
                    total_voters: center.total_voters, 
                    total_bureaux: center.total_bureaux 
                  }
                }))}
                selected={formData.selectedCenters}
                onSelectionChange={(selected) => setFormData({...formData, selectedCenters: selected})}
                placeholder="Rechercher et sélectionner des centres..."
                title="Centres de Vote"
                icon={<Building className="w-5 h-5 text-green-600" />}
                emptyMessage="Aucun centre sélectionné"
                renderOption={(option) => (
                  <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {option.metadata?.total_bureaux || 0} bureaux
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {option.metadata?.total_voters || 0} électeurs
                        </Badge>
                      </div>
                    </div>
                    <Checkbox
                      checked={formData.selectedCenters.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!formData.selectedCenters.includes(option.value)) {
                            setFormData({
                              ...formData,
                              selectedCenters: [...formData.selectedCenters, option.value]
                            });
                          }
                        } else {
                          setFormData({
                            ...formData,
                            selectedCenters: formData.selectedCenters.filter(id => id !== option.value)
                          });
                        }
                      }}
                    />
                  </div>
                )}
              />
            </div>

            {/* Récapitulatif automatique */}
            {(() => {
              const selectedCandidatesData = formData.selectedCandidates.map(id => 
                candidates.find(c => c.identifiant === id)
              ).filter(Boolean);

              const selectedCentersData = formData.selectedCenters.map(id => 
                centers.find(c => c.identifiant === id)
              ).filter(Boolean);

              const totalBureaux = selectedCentersData.reduce((sum, center) => sum + (center.total_bureaux || 0), 0);
              const totalElecteurs = selectedCentersData.reduce((sum, center) => sum + (center.total_voters || 0), 0);

              return (
                <div className="mt-8 p-6 bg-gradient-to-r from-gov-blue/5 to-green-50 rounded-xl border border-gov-blue/20">
                  <h5 className="font-semibold text-gov-blue mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Récapitulatif Automatique
                  </h5>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-gov-blue">{selectedCandidatesData.length}</div>
                      <div className="text-xs sm:text-sm text-gov-blue">Candidats</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">{selectedCentersData.length}</div>
                      <div className="text-xs sm:text-sm text-green-600">Centres</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-purple-600">{totalBureaux}</div>
                      <div className="text-xs sm:text-sm text-purple-600">Bureaux</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-orange-600">{totalElecteurs.toLocaleString('fr-FR')}</div>
                      <div className="text-xs sm:text-sm text-orange-600">Électeurs</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </ModernFormSection>

          {/* Actions - Mobile First */}
          <ModernFormActions>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Annuler</span>
              <span className="xs:hidden">Annuler</span>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-4 sm:px-8 py-2 sm:py-3 bg-gov-blue hover:bg-gov-blue-dark text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              <span className="xs:hidden">{isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </Button>
          </ModernFormActions>
        </ModernForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditElectionModal;
