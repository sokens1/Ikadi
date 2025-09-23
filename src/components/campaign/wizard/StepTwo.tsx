
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { OperationFormData } from '../CreateOperationWizard';

interface StepTwoProps {
  formData: OperationFormData;
  updateFormData: (data: Partial<OperationFormData>) => void;
}

const StepTwo = ({ formData, updateFormData }: StepTwoProps) => {
  const responsibles = [
    'Jean Dupont',
    'Marie Koffi',
    'Paul Mensah',
    'Fatou Diallo',
    'Kofi Asante'
  ];

  const teams = [
    'Équipe Communication',
    'Équipe Terrain Nord',
    'Équipe Terrain Sud',
    'Équipe Logistique',
    'Équipe Jeunes'
  ];

  const handleTeamToggle = (team: string, checked: boolean) => {
    const updatedTeams = checked
      ? [...formData.assignedTeams, team]
      : formData.assignedTeams.filter(t => t !== team);
    updateFormData({ assignedTeams: updatedTeams });
  };

  const updateResources = (field: keyof OperationFormData['resources'], value: any) => {
    updateFormData({
      resources: {
        ...formData.resources,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Responsable de l'Opération */}
      <div className="space-y-2">
        <Label>Responsable de l'Opération *</Label>
        <Select value={formData.responsible} onValueChange={(value) => updateFormData({ responsible: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un responsable" />
          </SelectTrigger>
          <SelectContent>
            {responsibles.map((responsible) => (
              <SelectItem key={responsible} value={responsible}>{responsible}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Équipes / Volontaires Assignés */}
      <div className="space-y-3">
        <Label>Équipes / Volontaires Assignés</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teams.map((team) => (
            <div key={team} className="flex items-center space-x-2">
              <Checkbox
                id={team}
                checked={formData.assignedTeams.includes(team)}
                onCheckedChange={(checked) => handleTeamToggle(team, checked as boolean)}
              />
              <Label htmlFor={team} className="text-sm font-normal">{team}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Objectifs Clés */}
      <div className="space-y-2">
        <Label htmlFor="objectives">Objectifs Clés *</Label>
        <Textarea
          id="objectives"
          placeholder="Ex: Toucher 500 foyers, Obtenir 100 nouvelles promesses de vote, Assurer une couverture médiatique locale"
          value={formData.objectives}
          onChange={(e) => updateFormData({ objectives: e.target.value })}
          rows={3}
        />
      </div>

      {/* Ressources Matérielles Nécessaires */}
      <div className="space-y-4">
        <Label>Ressources Matérielles Nécessaires</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Tracts / Flyers</Label>
            <Input
              type="number"
              placeholder="Quantité"
              value={formData.resources.tracts || ''}
              onChange={(e) => updateResources('tracts', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Affiches</Label>
            <Input
              type="number"
              placeholder="Quantité"
              value={formData.resources.posters || ''}
              onChange={(e) => updateResources('posters', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">T-shirts / Casquettes</Label>
            <Input
              type="number"
              placeholder="Quantité"
              value={formData.resources.tshirts || ''}
              onChange={(e) => updateResources('tshirts', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="sound"
              checked={formData.resources.sound}
              onCheckedChange={(checked) => updateResources('sound', checked as boolean)}
            />
            <Label htmlFor="sound" className="text-sm font-normal">Sonorisation</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Autre (précisez)</Label>
          <Input
            placeholder="Autres ressources nécessaires"
            value={formData.resources.other}
            onChange={(e) => updateResources('other', e.target.value)}
          />
        </div>
      </div>

      {/* Budget Prévisionnel */}
      <div className="space-y-2">
        <Label htmlFor="budget">Budget Prévisionnel (€/XAF) - Optionnel</Label>
        <Input
          id="budget"
          type="number"
          placeholder="Montant estimé"
          value={formData.budget || ''}
          onChange={(e) => updateFormData({ budget: parseInt(e.target.value) || 0 })}
        />
      </div>
    </div>
  );
};

export default StepTwo;
