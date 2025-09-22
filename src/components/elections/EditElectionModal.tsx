import React, { useState, useEffect } from 'react';
import { Election } from '@/types/elections';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Calendar, MapPin, Users, Building } from 'lucide-react';
import { toast } from 'sonner';

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="h-5 w-5 text-blue-600" />
            Modifier l'élection
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'élection sélectionnée. Les champs marqués d'un astérisque (*) sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'élection *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Élections Locales 2025"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type d'élection *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Législatives">Législatives</SelectItem>
                      <SelectItem value="Locales">Locales</SelectItem>
                      <SelectItem value="Présidentielle">Présidentielle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date de l'élection *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="À venir">À venir</SelectItem>
                      <SelectItem value="En cours">En cours</SelectItem>
                      <SelectItem value="Terminée">Terminée</SelectItem>
                      <SelectItem value="Annulée">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description de l'élection..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    placeholder="Ex: Estuaire"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Ex: Libreville"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commune">Commune</Label>
                  <Input
                    id="commune"
                    value={formData.commune}
                    onChange={(e) => handleInputChange('commune', e.target.value)}
                    placeholder="Ex: Libreville"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrondissement">Arrondissement</Label>
                  <Input
                    id="arrondissement"
                    value={formData.arrondissement}
                    onChange={(e) => handleInputChange('arrondissement', e.target.value)}
                    placeholder="Ex: 1er Arrondissement"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-600" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seatsAvailable">Sièges disponibles</Label>
                  <Input
                    id="seatsAvailable"
                    type="number"
                    min="1"
                    value={formData.seatsAvailable}
                    onChange={(e) => handleInputChange('seatsAvailable', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (FCFA)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voteGoal">Objectif de voix</Label>
                  <Input
                    id="voteGoal"
                    type="number"
                    min="0"
                    value={formData.voteGoal}
                    onChange={(e) => handleInputChange('voteGoal', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditElectionModal;
