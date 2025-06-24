
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { OperationFormData } from '../CreateOperationWizard';

interface StepOneProps {
  formData: OperationFormData;
  updateFormData: (data: Partial<OperationFormData>) => void;
}

const StepOne = ({ formData, updateFormData }: StepOneProps) => {
  const operationTypes = [
    'Meeting / Rassemblement public',
    'Porte-à-porte / Canvassing',
    'Distribution de tracts / Affichage',
    'Rencontre avec les notables / leaders communautaires',
    'Opération de collage d\'affiches',
    'Autre'
  ];

  const provinces = ['Maritime', 'Plateaux', 'Centrale', 'Kara', 'Savanes'];
  const cities = ['Lomé', 'Sokodé', 'Kara', 'Atakpamé', 'Dapaong'];
  const districts = ['Golfe', 'Vo', 'Yoto', 'Zio', 'Lacs'];
  const neighborhoods = ['Akébé-Ville', 'Nyékonakpoé', 'Bé', 'Tokoin', 'Adidogomé'];

  return (
    <div className="space-y-6">
      {/* Titre de l'Opération */}
      <div className="space-y-2">
        <Label htmlFor="title">Titre de l'Opération *</Label>
        <Input
          id="title"
          placeholder="Ex: Grande rencontre citoyenne à Akébé-Ville"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
        />
      </div>

      {/* Type d'Opération */}
      <div className="space-y-2">
        <Label>Type d'Opération *</Label>
        <Select value={formData.type} onValueChange={(value) => updateFormData({ type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le type d'opération" />
          </SelectTrigger>
          <SelectContent>
            {operationTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.type === 'Autre' && (
          <Input
            placeholder="Précisez le type d'opération"
            value={formData.customType || ''}
            onChange={(e) => updateFormData({ customType: e.target.value })}
          />
        )}
      </div>

      {/* Date et Heure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Label>Date et Heure de Début *</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "PPP", { locale: fr }) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => updateFormData({ startDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              className="w-32"
              value={formData.startTime}
              onChange={(e) => updateFormData({ startTime: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Date et Heure de Fin</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? format(formData.endDate, "PPP", { locale: fr }) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => updateFormData({ endDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              className="w-32"
              value={formData.endTime}
              onChange={(e) => updateFormData({ endTime: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Lieu */}
      <div className="space-y-4">
        <Label>Lieu *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm text-gray-600">Province</Label>
            <Select value={formData.province} onValueChange={(value) => updateFormData({ province: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Ville</Label>
            <Select value={formData.city} onValueChange={(value) => updateFormData({ city: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Arrondissement</Label>
            <Select value={formData.district} onValueChange={(value) => updateFormData({ district: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Arrondissement" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Quartier</Label>
            <Select value={formData.neighborhood} onValueChange={(value) => updateFormData({ neighborhood: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Quartier" />
              </SelectTrigger>
              <SelectContent>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Adresse précise</Label>
          <Input
            placeholder="Adresse exacte du lieu de l'opération"
            value={formData.exactAddress}
            onChange={(e) => updateFormData({ exactAddress: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default StepOne;
