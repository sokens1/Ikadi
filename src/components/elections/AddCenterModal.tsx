
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface Center {
  name: string;
  address: string;
  responsable: string;
  contact: string;
  bureaux: number;
  voters: number;
}

interface AddCenterModalProps {
  onClose: () => void;
  onSubmit: (center: Center) => void;
}

const AddCenterModal: React.FC<AddCenterModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Center>({
    name: '',
    address: '',
    responsable: '',
    contact: '',
    bureaux: 1,
    voters: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.address && formData.bureaux > 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gov-gray">Ajouter un Centre de Vote</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Nom du centre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: EPP de l'Alliance"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ex: Quartier Alliance, Moanda"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsable">Responsable du centre</Label>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                placeholder="Nom du responsable"
              />
            </div>

            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+241 XX XX XX XX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bureaux">Nombre de bureaux de vote *</Label>
              <Input
                id="bureaux"
                type="number"
                value={formData.bureaux}
                onChange={(e) => setFormData({ ...formData, bureaux: parseInt(e.target.value) || 1 })}
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="voters">Nombre d'électeurs</Label>
              <Input
                id="voters"
                type="number"
                value={formData.voters}
                onChange={(e) => setFormData({ ...formData, voters: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="Estimation"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="gov-bg-primary hover:bg-gov-blue-dark">
              Ajouter le centre
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCenterModal;
