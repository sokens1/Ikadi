/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Save, Users, Star, Building } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import FloatingInput from '@/components/ui/floating-input';
import { ModernForm, ModernFormSection, ModernFormGrid, ModernFormActions } from '@/components/ui/modern-form';

interface Candidate {
  id: string;
  name: string;
  party: string;
  isOurCandidate: boolean;
  photo?: string;
}

interface EditCandidateModalProps {
  candidate: Candidate;
  onClose: () => void;
  onUpdate: (updatedCandidate: Candidate) => void;
}

const EditCandidateModal: React.FC<EditCandidateModalProps> = ({
  candidate,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: candidate.name,
    party: candidate.party,
    isOurCandidate: candidate.isOurCandidate,
    photo: candidate.photo || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du candidat est requis');
      return;
    }

    if (!formData.party.trim()) {
      toast.error('Le parti politique est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mettre à jour le candidat dans la base de données
      const { error } = await supabase
        .from('candidates')
        .update({
          name: formData.name.trim(),
          party: formData.party.trim(),
          is_our_candidate: formData.isOurCandidate,
          photo_url: formData.photo.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidate.id);

      if (error) {
        console.error('Erreur lors de la mise à jour du candidat:', error);
        toast.error('Erreur lors de la mise à jour du candidat');
        return;
      }

      // Mettre à jour l'objet candidate local
      const updatedCandidate: Candidate = {
        ...candidate,
        name: formData.name.trim(),
        party: formData.party.trim(),
        isOurCandidate: formData.isOurCandidate,
        photo: formData.photo.trim(),
      };

      onUpdate(updatedCandidate);
      toast.success('Candidat modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du candidat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <span className="hidden xs:inline">Modifier le Candidat</span>
            <span className="xs:hidden">Modifier Candidat</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm sm:text-base">
            Modifiez les informations du candidat sélectionné. Les champs marqués d'un astérisque (*) sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <ModernForm onSubmit={handleSubmit}>
          {/* Informations générales */}
          <ModernFormSection
            title="Informations du Candidat"
            description="Modifiez les paramètres de base du candidat"
            icon={<Users className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Nom complet"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Jean Dupont"
                icon={<Users className="w-4 h-4" />}
                required
              />
              
              <FloatingInput
                label="Parti politique"
                value={formData.party}
                onChange={(e) => handleInputChange('party', e.target.value)}
                placeholder="Ex: PDG, UDB, Indépendant"
                icon={<Building className="w-4 h-4" />}
                required
              />
            </ModernFormGrid>

            <ModernFormGrid cols={1}>
              <FloatingInput
                label="URL de la photo"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
                placeholder="Ex: https://example.com/photo.jpg"
                icon={<Users className="w-4 h-4" />}
              />
            </ModernFormGrid>

            {/* Checkbox pour notre candidat */}
            <div className="flex items-center space-x-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Checkbox
                id="isOurCandidate"
                checked={formData.isOurCandidate}
                onCheckedChange={(checked) => handleInputChange('isOurCandidate', checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label 
                htmlFor="isOurCandidate" 
                className="text-sm font-medium text-purple-900 cursor-pointer flex items-center gap-2"
              >
                <Star className="w-4 h-4 text-purple-600" />
                Notre candidat (candidat soutenu par notre organisation)
              </Label>
            </div>
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
              className="px-4 sm:px-8 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
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

export default EditCandidateModal;
