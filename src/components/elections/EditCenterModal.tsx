/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Building, MapPin, Phone, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import FloatingInput from '@/components/ui/floating-input';
import FloatingTextarea from '@/components/ui/floating-textarea';
import { ModernForm, ModernFormSection, ModernFormGrid, ModernFormActions } from '@/components/ui/modern-form';

interface Center {
  id: string;
  name: string;
  address: string;
  responsable: string;
  contact: string;
  bureaux: number;
  voters: number;
}

interface EditCenterModalProps {
  center: Center;
  onClose: () => void;
  onUpdate: (updatedCenter: Center) => void;
}

const EditCenterModal: React.FC<EditCenterModalProps> = ({
  center,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: center.name,
    address: center.address,
    responsable: center.responsable,
    contact: center.contact,
    email: '',
    totalVoters: center.voters,
    totalBureaux: center.bureaux,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du centre est requis');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('L\'adresse du centre est requise');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mettre à jour le centre dans la base de données
      const { error } = await supabase
        .from('voting_centers')
        .update({
          name: formData.name.trim(),
          address: formData.address.trim(),
          contact_name: formData.responsable.trim(),
          contact_phone: formData.contact.trim(),
          contact_email: formData.email.trim(),
          total_voters: formData.totalVoters,
          total_bureaux: formData.totalBureaux,
          updated_at: new Date().toISOString(),
        })
        .eq('id', center.id);

      if (error) {
        console.error('Erreur lors de la mise à jour du centre:', error);
        toast.error('Erreur lors de la mise à jour du centre');
        return;
      }

      // Mettre à jour l'objet center local
      const updatedCenter: Center = {
        ...center,
        name: formData.name.trim(),
        address: formData.address.trim(),
        responsable: formData.responsable.trim(),
        contact: formData.contact.trim(),
        voters: formData.totalVoters,
        bureaux: formData.totalBureaux,
      };

      onUpdate(updatedCenter);
      toast.success('Centre modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du centre');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <Building className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <span className="hidden xs:inline">Modifier le Centre de Vote</span>
            <span className="xs:hidden">Modifier Centre</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm sm:text-base">
            Modifiez les informations du centre de vote sélectionné. Les champs marqués d'un astérisque (*) sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <ModernForm onSubmit={handleSubmit}>
          {/* Informations générales */}
          <ModernFormSection
            title="Informations Générales"
            description="Modifiez les paramètres de base du centre"
            icon={<Building className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Nom du Centre"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: EPP Alliance"
                icon={<Building className="w-4 h-4" />}
                required
              />
              
              <FloatingInput
                label="Nombre total d'électeurs"
                type="number"
                min="0"
                value={formData.totalVoters}
                onChange={(e) => handleInputChange('totalVoters', parseInt(e.target.value) || 0)}
                placeholder="Ex: 1200"
                icon={<Users className="w-4 h-4" />}
              />
            </ModernFormGrid>

            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Nombre de bureaux"
                type="number"
                min="1"
                value={formData.totalBureaux}
                onChange={(e) => handleInputChange('totalBureaux', parseInt(e.target.value) || 1)}
                placeholder="Ex: 4"
                icon={<Building className="w-4 h-4" />}
              />
              
              <FloatingInput
                label="Responsable du Centre"
                value={formData.responsable}
                onChange={(e) => handleInputChange('responsable', e.target.value)}
                placeholder="Ex: Jean Dupont"
                icon={<Users className="w-4 h-4" />}
              />
            </ModernFormGrid>

            <ModernFormGrid cols={1}>
              <FloatingTextarea
                label="Adresse du Centre"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Adresse complète du centre de vote..."
                rows={3}
                icon={<MapPin className="w-4 h-4" />}
                required
              />
            </ModernFormGrid>
          </ModernFormSection>

          {/* Contact */}
          <ModernFormSection
            title="Informations de Contact"
            description="Modifiez les coordonnées de contact du centre"
            icon={<Phone className="w-5 h-5" />}
          >
            <ModernFormGrid cols={2}>
              <FloatingInput
                label="Téléphone"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="Ex: +241 01 23 45 67"
                icon={<Phone className="w-4 h-4" />}
              />
              
              <FloatingInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Ex: centre@example.com"
                icon={<Mail className="w-4 h-4" />}
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
              className="px-4 sm:px-8 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
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

export default EditCenterModal;
