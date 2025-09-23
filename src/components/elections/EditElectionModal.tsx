import React, { useState, useEffect } from 'react';
import { Election } from '@/types/elections';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Select2, { Select2Option } from '@/components/ui/select2';
import { X, Save, Calendar, MapPin, Users, Building, Vote, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import FloatingInput from '@/components/ui/floating-input';
import FloatingTextarea from '@/components/ui/floating-textarea';
import FloatingSelect from '@/components/ui/floating-select';
import { ModernForm, ModernFormSection, ModernFormGrid, ModernFormActions } from '@/components/ui/modern-form';

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
    department: election.location.department,
    commune: election.location.commune,
    arrondissement: election.location.arrondissement,
    seatsAvailable: election.configuration.seatsAvailable,
    budget: election.configuration.budget || 0,
    voteGoal: election.configuration.voteGoal || 0,
    nbElecteurs: election.statistics.totalVoters || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Initialiser les IDs sélectionnés avec les valeurs actuelles
  useEffect(() => {
    if (provinces.length > 0) {
      const currentProvince = provinces.find(p => p.name === formData.province);
      if (currentProvince) setSelectedProvinceId(currentProvince.id);
    }
  }, [provinces, formData.province]);

  useEffect(() => {
    if (departments.length > 0) {
      const currentDepartment = departments.find(d => d.name === formData.department);
      if (currentDepartment) setSelectedDepartmentId(currentDepartment.id);
    }
  }, [departments, formData.department]);

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
          department: formData.department,
          commune: formData.commune,
          arrondissement: formData.arrondissement,
          fullAddress: `${formData.commune}, ${formData.department}`,
        },
        configuration: {
          seatsAvailable: formData.seatsAvailable,
          budget: formData.budget,
          voteGoal: formData.voteGoal,
          allowMultipleCandidates: election.configuration.allowMultipleCandidates,
          requirePhotoValidation: election.configuration.requirePhotoValidation,
        },
        statistics: {
          ...election.statistics,
          totalVoters: formData.nbElecteurs,
        },
      };

      await onUpdate(updatedData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-gov-blue/10 rounded-lg">
              <Calendar className="h-6 w-6 text-gov-blue" />
            </div>
            Modifier l'élection
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
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
                helperText="Décrivez les objectifs et le contexte de cette élection"
              />
            </ModernFormGrid>
          </ModernFormSection>

          {/* Localisation */}
          <ModernFormSection
            title="Circonscription Électorale"
            description="Modifiez la zone géographique de l'élection"
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
                    handleInputChange('province', selectedOption.label);
                  } else {
                    setSelectedProvinceId('');
                    handleInputChange('province', '');
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
                    handleInputChange('department', selectedOption.label);
                  } else {
                    setSelectedDepartmentId('');
                    handleInputChange('department', '');
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
                onChange={(e) => handleInputChange('seatsAvailable', parseInt(e.target.value) || 1)}
                icon={<Target className="w-4 h-4" />}
                helperText="Nombre de sièges à pourvoir"
              />
              
              <FloatingInput
                label="Nombre d'électeurs"
                type="number"
                min="0"
                value={formData.nbElecteurs}
                onChange={(e) => handleInputChange('nbElecteurs', parseInt(e.target.value) || 0)}
                placeholder="Ex: 50000"
                icon={<Users className="w-4 h-4" />}
                helperText="Nombre total d'électeurs inscrits"
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Budget (FCFA)"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                icon={<Target className="w-4 h-4" />}
                helperText="Budget alloué en francs CFA"
              />
              
              <FloatingInput
                label="Objectif de voix"
                type="number"
                min="0"
                value={formData.voteGoal}
                onChange={(e) => handleInputChange('voteGoal', parseInt(e.target.value) || 0)}
                icon={<Vote className="w-4 h-4" />}
                helperText="Nombre de voix visées"
              />
            </ModernFormGrid>
          </ModernFormSection>

          {/* Actions */}
          <ModernFormActions>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl border-2 hover:bg-gray-100 transition-all duration-300"
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gov-blue hover:bg-gov-blue-dark text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </ModernFormActions>
        </ModernForm>
      </DialogContent>
    </Dialog>
  );
};

export default EditElectionModal;
