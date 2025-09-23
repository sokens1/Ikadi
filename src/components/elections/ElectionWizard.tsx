import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Star, Trash2, Edit, Search, Calendar, MapPin, Users, Building, Vote, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import FloatingInput from '@/components/ui/floating-input';
import FloatingTextarea from '@/components/ui/floating-textarea';
import FloatingSelect from '@/components/ui/floating-select';
import FloatingCheckbox from '@/components/ui/floating-checkbox';
import Select2, { Select2Option } from '@/components/ui/select2';
import { ModernForm, ModernFormSection, ModernFormGrid, ModernFormActions } from '@/components/ui/modern-form';

interface Candidate {
  id: string;
  name: string;
  party: string;
  isOurCandidate: boolean;
  photo?: string;
}

interface ElectionWizardProps {
  onClose: () => void;
  onSubmit?: (election: any) => void;
  onSuccess?: () => void;
}

const ElectionWizard: React.FC<ElectionWizardProps> = ({ onClose, onSubmit, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1
    name: '',
    type: '',
    date: '',
    seatsAvailable: 1,
    budget: 0,
    voteGoal: 0,
    
    // Étape 2
    province: '',
    department: '',
    commune: '',
    arrondissement: '',
    
    // Étape 3
    candidates: [] as Candidate[],
    
    // Étape 4
    totalCenters: 0,
    averageBureaux: 0,
    totalVoters: 0
  });

  const [currentCandidate, setCurrentCandidate] = useState({
    name: '',
    party: '',
    isOurCandidate: false
  });

  // États pour les données de localisation
  const [provinces, setProvinces] = useState<Array<{id: string, name: string}>>([]);
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([]);
  const [communes, setCommunes] = useState<Array<{id: string, name: string}>>([]);
  const [arrondissements, setArrondissements] = useState<Array<{id: string, name: string}>>([]);
  
  // États pour les IDs sélectionnés
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>('');
  const [selectedArrondissementId, setSelectedArrondissementId] = useState<string>('');

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
  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error);
    }
  };

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

  // Charger toutes les données de localisation
  useEffect(() => {
    loadProvinces();
    loadDepartments();
    loadCommunes();
    loadArrondissements();
  }, []);

  const steps = [
    'Informations Générales',
    'Circonscription Électorale',
    'Candidats',
    'Centres et Bureaux',
    'Récapitulatif'
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddCandidate = () => {
    if (currentCandidate.name && currentCandidate.party) {
      const newCandidates = [...formData.candidates];
      
      // Si c'est notre candidat, désélectionner les autres
      if (currentCandidate.isOurCandidate) {
        newCandidates.forEach(c => c.isOurCandidate = false);
      }
      
      const candidate: Candidate = {
        id: Date.now().toString(),
        name: currentCandidate.name,
        party: currentCandidate.party,
        isOurCandidate: currentCandidate.isOurCandidate
      };
      
      setFormData({ ...formData, candidates: [...newCandidates, candidate] });
      setCurrentCandidate({ name: '', party: '', isOurCandidate: false });
    }
  };

  const handleRemoveCandidate = (id: string) => {
    setFormData({
      ...formData,
      candidates: formData.candidates.filter(c => c.id !== id)
    });
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const election = {
        name: formData.name,
        type: formData.type,
        date: formData.date,
        seatsAvailable: formData.seatsAvailable,
        budget: formData.budget,
        voteGoal: formData.voteGoal,
        province: formData.province,
        department: formData.department,
        commune: formData.commune,
        arrondissement: formData.arrondissement,
        candidates: formData.candidates,
        totalCenters: formData.totalCenters,
        averageBureaux: formData.averageBureaux,
        totalVoters: formData.totalVoters
      };
      
      onSubmit(election);
    } else if (onSuccess) {
      onSuccess();
    }
  };

  const canProceed = () => {
    let canProceedResult = false;
    
    switch (currentStep) {
      case 1:
        // Vérifie que les champs requis sont remplis
        canProceedResult = formData.name.trim() !== '' && 
                         formData.type.trim() !== '' && 
                         formData.date.trim() !== '';
        console.log('Étape 1 - Peut continuer:', canProceedResult, {
          name: formData.name,
          type: formData.type,
          date: formData.date
        });
        break;
      case 2:
        // Vérifie que la province et la commune sont renseignées
        canProceedResult = formData.province.trim() !== '' && 
                         formData.commune.trim() !== '';
        console.log('Étape 2 - Peut continuer:', canProceedResult, {
          province: formData.province,
          commune: formData.commune
        });
        break;
      case 3:
        // Les candidats sont optionnels, donc on peut toujours passer à l'étape suivante
        canProceedResult = true;
        console.log('Étape 3 - Peut continuer: true (optionnel)');
        break;
      case 4:
        // Vérifie que les nombres sont strictement positifs
        canProceedResult = formData.totalCenters > 0 && 
                         formData.averageBureaux > 0 && 
                         formData.totalVoters > 0;
        console.log('Étape 4 - Peut continuer:', canProceedResult, {
          totalCenters: formData.totalCenters,
          averageBureaux: formData.averageBureaux,
          totalVoters: formData.totalVoters
        });
        break;
      case 5:
        // Dernière étape, toujours possible de valider
        canProceedResult = true;
        console.log('Étape 5 - Peut continuer: true (dernière étape)');
        break;
      default:
        canProceedResult = false;
        console.log('Étape inconnue - Peut continuer: false');
    }
    
    console.log(`[canProceed] Étape ${currentStep}:`, canProceedResult);
    return canProceedResult;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ModernFormSection
            title="Informations Générales"
            description="Définissez les paramètres de base de votre élection"
            icon={<Vote className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Nom de l'élection"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Législatives 2023 - Siège unique Moanda"
                icon={<Building className="w-4 h-4" />}
                required
              />
              
              <FloatingSelect
                label="Type d'élection"
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value })}
                options={[
                  { value: "Législatives", label: "Législatives" },
                  { value: "Locales", label: "Locales (Départementales / Municipales)" },
                  { value: "Présidentielle", label: "Présidentielle" }
                ]}
                icon={<Vote className="w-4 h-4" />}
                required
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Date du scrutin"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                icon={<Calendar className="w-4 h-4" />}
                required
              />
              
              <FloatingInput
                label="Siège(s) à pourvoir"
                type="number"
                value={formData.seatsAvailable}
                onChange={(e) => setFormData({ ...formData, seatsAvailable: parseInt(e.target.value) || 1 })}
                min="1"
                icon={<Target className="w-4 h-4" />}
                required
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Budget alloué à la campagne (FCFA)"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                placeholder="0"
                icon={<Building className="w-4 h-4" />}
                helperText="Montant en francs CFA"
              />
              
              <FloatingInput
                label="Objectif de voix"
                type="number"
                value={formData.voteGoal}
                onChange={(e) => setFormData({ ...formData, voteGoal: parseInt(e.target.value) || 0 })}
                placeholder="0"
                icon={<Users className="w-4 h-4" />}
                helperText="Nombre de voix visées"
              />
            </ModernFormGrid>
          </ModernFormSection>
        );
        
      case 2:
        return (
          <ModernFormSection
            title="Circonscription Électorale"
            description="Définissez la zone géographique de votre élection"
            icon={<MapPin className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <Select2
                label="Province"
                placeholder="Rechercher une province..."
                options={provinces.map(p => ({ value: p.id, label: p.name }))}
                value={provinces.find(p => p.id === selectedProvinceId) ? 
                  { value: selectedProvinceId, label: provinces.find(p => p.id === selectedProvinceId)?.name || '' } : null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedProvinceId(selectedOption.value);
                    setFormData({ ...formData, province: selectedOption.label });
                  } else {
                    setSelectedProvinceId('');
                    setFormData({ ...formData, province: '' });
                  }
                }}
              />
              
              <Select2
                label="Département"
                placeholder="Rechercher un département..."
                options={departments.map(d => ({ value: d.id, label: d.name }))}
                value={departments.find(d => d.id === selectedDepartmentId) ? 
                  { value: selectedDepartmentId, label: departments.find(d => d.id === selectedDepartmentId)?.name || '' } : null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedDepartmentId(selectedOption.value);
                    setFormData({ ...formData, department: selectedOption.label });
                  } else {
                    setSelectedDepartmentId('');
                    setFormData({ ...formData, department: '' });
                  }
                }}
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <Select2
                label="Commune / Canton / District"
                placeholder="Rechercher une commune..."
                options={communes.map(c => ({ value: c.id, label: c.name }))}
                value={communes.find(c => c.id === selectedCommuneId) ? 
                  { value: selectedCommuneId, label: communes.find(c => c.id === selectedCommuneId)?.name || '' } : null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedCommuneId(selectedOption.value);
                    setFormData({ ...formData, commune: selectedOption.label });
                  } else {
                    setSelectedCommuneId('');
                    setFormData({ ...formData, commune: '' });
                  }
                }}
              />
              
              <Select2
                label="Arrondissement / Siège"
                placeholder="Rechercher un arrondissement..."
                options={arrondissements.map(a => ({ value: a.id, label: a.name }))}
                value={arrondissements.find(a => a.id === selectedArrondissementId) ? 
                  { value: selectedArrondissementId, label: arrondissements.find(a => a.id === selectedArrondissementId)?.name || '' } : null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setSelectedArrondissementId(selectedOption.value);
                    setFormData({ ...formData, arrondissement: selectedOption.label });
                  } else {
                    setSelectedArrondissementId('');
                    setFormData({ ...formData, arrondissement: '' });
                  }
                }}
              />
            </ModernFormGrid>
          </ModernFormSection>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <ModernFormSection
              title="Ajouter un candidat"
              description="Définissez les candidats qui participeront à cette élection"
              icon={<Users className="w-5 h-5" />}
            >
              <ModernFormGrid cols={2}>
                <FloatingInput
                  label="Nom et Prénom(s)"
                  value={currentCandidate.name}
                  onChange={(e) => setCurrentCandidate({ ...currentCandidate, name: e.target.value })}
                  placeholder="Nom complet du candidat"
                  icon={<Users className="w-4 h-4" />}
                  required
                />
                
                <FloatingInput
                  label="Parti politique / Appartenance"
                  value={currentCandidate.party}
                  onChange={(e) => setCurrentCandidate({ ...currentCandidate, party: e.target.value })}
                  placeholder="Nom du parti"
                  icon={<Building className="w-4 h-4" />}
                  required
                />
              </ModernFormGrid>
              
              <div className="flex items-center justify-center">
                <FloatingCheckbox
                  label="C'est notre candidat prioritaire"
                  checked={currentCandidate.isOurCandidate}
                  onChange={(checked) => setCurrentCandidate({ ...currentCandidate, isOurCandidate: checked })}
                  helperText="Marquez cette case si ce candidat est votre candidat principal"
                />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleAddCandidate} 
                  className="px-8 py-3 bg-gov-blue hover:bg-gov-blue-dark text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!currentCandidate.name || !currentCandidate.party}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Ajouter ce candidat
                </Button>
              </div>
            </ModernFormSection>
            
            {formData.candidates.length > 0 && (
              <ModernFormSection
                title={`Candidats ajoutés (${formData.candidates.length})`}
                description="Liste des candidats configurés pour cette élection"
                icon={<Star className="w-5 h-5" />}
              >
                <div className="space-y-3">
                  {formData.candidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gov-blue/10 rounded-lg">
                          <Users className="w-5 h-5 text-gov-blue" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{candidate.name}</span>
                            {candidate.isOurCandidate && (
                              <Badge className="bg-gov-blue text-white px-2 py-1 text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Notre Candidat
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">{candidate.party}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCandidate(candidate.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ModernFormSection>
            )}
          </div>
        );
        
      case 4:
        return (
          <ModernFormSection
            title="Centres et Bureaux de Vote"
            description="Configurez l'organisation territoriale de votre élection"
            icon={<Building className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Nombre total de Centres de Vote prévus"
                type="number"
                value={formData.totalCenters}
                onChange={(e) => setFormData({ ...formData, totalCenters: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 12"
                min="1"
                icon={<Building className="w-4 h-4" />}
                required
                helperText="Nombre de centres de vote dans la circonscription"
              />
              
              <FloatingInput
                label="Nombre moyen de Bureaux de Vote par Centre"
                type="number"
                value={formData.averageBureaux}
                onChange={(e) => setFormData({ ...formData, averageBureaux: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 4"
                min="1"
                icon={<Target className="w-4 h-4" />}
                required
                helperText="Estimation du nombre de bureaux par centre"
              />
            </ModernFormGrid>

            <ModernFormGrid cols={1}>
              <FloatingInput
                label="Nombre total d'Électeurs inscrits (estimation)"
                type="number"
                value={formData.totalVoters}
                onChange={(e) => setFormData({ ...formData, totalVoters: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 15240"
                min="1"
                icon={<Users className="w-4 h-4" />}
                required
                helperText="Nombre total d'électeurs inscrits dans la circonscription"
              />
            </ModernFormGrid>
            
            {formData.totalCenters > 0 && formData.averageBureaux > 0 && (
              <div className="bg-gradient-to-r from-gov-blue/5 to-gov-blue-light/5 p-6 rounded-xl border border-gov-blue/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gov-blue rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gov-blue">Estimation automatique</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gov-blue">{formData.totalCenters}</div>
                    <div className="text-sm text-gov-blue">Centres de vote</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gov-blue">{formData.averageBureaux}</div>
                    <div className="text-sm text-gov-blue">Bureaux par centre</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gov-blue">{formData.totalCenters * formData.averageBureaux}</div>
                    <div className="text-sm text-gov-blue">Total bureaux</div>
                  </div>
                </div>
              </div>
            )}
          </ModernFormSection>
        );
        
      case 5:
        const ourCandidate = formData.candidates.find(c => c.isOurCandidate);
        return (
          <div className="space-y-6">
            <ModernFormSection
              title="Récapitulatif de l'élection"
              description="Vérifiez les informations avant de créer l'élection"
              icon={<Check className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-4 bg-gov-blue/5 rounded-xl border border-gov-blue/20">
                    <h5 className="font-semibold text-gov-blue mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Informations Générales
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gov-blue">Nom :</span>
                        <span className="text-sm text-gov-blue">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gov-blue">Type :</span>
                        <span className="text-sm text-gov-blue">{formData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gov-blue">Date :</span>
                        <span className="text-sm text-gov-blue">
                          {formData.date ? new Date(formData.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Non définie'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Circonscription
                    </h5>
                    <div className="text-sm text-green-900">
                      {formData.province} {formData.department ? `→ ${formData.department}` : ''} {formData.commune ? `→ ${formData.commune}` : ''} {formData.arrondissement ? `→ ${formData.arrondissement}` : ''}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Candidats & Structure
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-purple-700">Candidats :</span>
                        <span className="text-sm text-purple-900">
                          {formData.candidates.length} {ourCandidate && `(dont ${ourCandidate.name})`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-purple-700">Centres :</span>
                        <span className="text-sm text-purple-900">{formData.totalCenters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-purple-700">Bureaux :</span>
                        <span className="text-sm text-purple-900">~{formData.totalCenters * formData.averageBureaux}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-purple-700">Électeurs :</span>
                        <span className="text-sm text-purple-900">~{formData.totalVoters.toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {formData.budget > 0 && (
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <h5 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Budget & Objectifs
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-orange-700">Budget :</span>
                          <span className="text-sm text-orange-900">{formData.budget.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        {formData.voteGoal > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-orange-700">Objectif voix :</span>
                            <span className="text-sm text-orange-900">{formData.voteGoal.toLocaleString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ModernFormSection>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header moderne */}
        <div className="relative bg-gradient-to-r from-gov-blue to-gov-blue-light p-6 text-white">
          <div className="absolute inset-0 bg-black/10 rounded-t-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Configurer une nouvelle élection</h2>
              <p className="text-gov-blue-light/80 mt-1">Étape {currentStep} sur 5 : {steps[currentStep - 1]}</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="text-white hover:bg-white/20 rounded-xl p-2"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Progress moderne */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  index + 1 <= currentStep 
                    ? 'bg-gov-blue text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-3 text-sm font-medium hidden sm:inline transition-colors duration-300 ${
                  index + 1 <= currentStep ? 'text-gov-blue' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-4 rounded-full transition-all duration-300 ${
                    index + 1 < currentStep ? 'bg-gov-blue' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content avec scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <ModernForm>
            {renderStep()}
          </ModernForm>
        </div>

        {/* Footer moderne */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 rounded-xl border-2 hover:bg-gray-100 transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Précédent</span>
              <span className="sm:hidden">Préc.</span>
            </Button>
            
            <div className="flex space-x-3">
              {currentStep < 5 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center px-8 py-3 bg-gov-blue hover:bg-gov-blue-dark text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <span className="sm:hidden">Suiv.</span>
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              {currentStep === 5 && (
                <Button
                  onClick={handleSubmit}
                  className="flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Check className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Créer l'élection</span>
                  <span className="sm:hidden">Créer</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionWizard;
