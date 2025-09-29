/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Building, Users, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import FloatingInput from '@/components/ui/floating-input';
import { ModernForm, ModernFormSection, ModernFormGrid, ModernFormActions } from '@/components/ui/modern-form';

// Fonction utilitaire pour gérer les valeurs null/undefined
const safeString = (value: string | null | undefined): string => {
  return value?.trim() || '';
};

const safeNumber = (value: number | null | undefined): number => {
  return value || 0;
};

interface Bureau {
  id: string;
  name: string;
  registered_voters: number;
  president_name: string;
  president_phone: string;
  urns_count: number;
}

interface EditBureauModalProps {
  bureau: Bureau;
  centerId: string;
  onClose: () => void;
  onUpdate: (updatedBureau: Bureau) => void;
}

const EditBureauModal: React.FC<EditBureauModalProps> = ({
  bureau,
  centerId,
  onClose,
  onUpdate,
}) => {
  // Vérification de sécurité pour s'assurer que le bureau existe
  if (!bureau) {
    console.error('EditBureauModal: bureau is null or undefined');
    onClose();
    return null;
  }

  const [formData, setFormData] = useState({
    name: safeString(bureau.name),
    registered_voters: safeNumber(bureau.registered_voters),
    president_name: safeString(bureau.president_name),
    president_phone: safeString(bureau.president_phone),
    urns_count: safeNumber(bureau.urns_count),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ?? (typeof value === 'string' ? '' : 0),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation avec vérifications de sécurité
    const name = safeString(formData.name);
    const presidentName = safeString(formData.president_name);
    const presidentPhone = safeString(formData.president_phone);
    
    if (!name) {
      toast.error('Le nom du bureau est requis');
      return;
    }

    if (formData.registered_voters < 0) {
      toast.error('Le nombre d\'électeurs ne peut pas être négatif');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mettre à jour le bureau dans la base de données
      // ATTENTION: Ne pas mettre à jour registered_voters car cela cause des conflits entre élections
      // Les inscrits sont maintenant gérés uniquement dans les PV (procès_verbaux.total_registered)
      const { error } = await supabase
        .from('voting_bureaux')
        .update({
          name: name,
          // registered_voters: formData.registered_voters, // SUPPRIMÉ pour éviter les conflits entre élections
          president_name: presidentName,
          president_phone: presidentPhone,
          urns_count: formData.urns_count,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bureau.id);

      if (error) {
        console.error('Erreur lors de la mise à jour du bureau:', error);
        toast.error('Erreur lors de la mise à jour du bureau');
        return;
      }

      // Mettre à jour l'objet bureau local
      const updatedBureau: Bureau = {
        ...bureau,
        name: name,
        registered_voters: formData.registered_voters,
        president_name: presidentName,
        president_phone: presidentPhone,
        urns_count: formData.urns_count,
      };

      onUpdate(updatedBureau);
      toast.success('Bureau modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du bureau');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <span className="hidden xs:inline">Modifier le Bureau de Vote</span>
            <span className="xs:hidden">Modifier Bureau</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm sm:text-base">
            Modifiez les informations du bureau de vote sélectionné. Les champs marqués d'un astérisque (*) sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <ModernForm onSubmit={handleSubmit}>
          {/* Informations générales */}
          <ModernFormSection
            title="Informations du Bureau"
            description="Modifiez les paramètres de base du bureau"
            icon={<Building className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Nom du Bureau"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Bureau 1"
                icon={<Building className="w-4 h-4" />}
                required
              />
              
              <FloatingInput
                label="Nombre d'électeurs inscrits"
                type="number"
                min="0"
                value={formData.registered_voters}
                onChange={(e) => handleInputChange('registered_voters', parseInt(e.target.value) || 0)}
                placeholder="Ex: 350"
                icon={<Users className="w-4 h-4" />}
                required
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Nombre d'urnes"
                type="number"
                min="0"
                value={formData.urns_count}
                onChange={(e) => handleInputChange('urns_count', parseInt(e.target.value) || 0)}
                placeholder="Ex: 2"
                icon={<Building className="w-4 h-4" />}
              />
              
              <FloatingInput
                label="Nom du Président"
                value={formData.president_name}
                onChange={(e) => handleInputChange('president_name', e.target.value)}
                placeholder="Ex: Marie Martin"
                icon={<Users className="w-4 h-4" />}
              />
            </ModernFormGrid>

            <ModernFormGrid cols={1}>
              <FloatingInput
                label="Téléphone du Président"
                value={formData.president_phone}
                onChange={(e) => handleInputChange('president_phone', e.target.value)}
                placeholder="Ex: +241 01 23 45 67"
                icon={<Phone className="w-4 h-4" />}
              />
            </ModernFormGrid>
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
              className="px-4 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
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

export default EditBureauModal;
