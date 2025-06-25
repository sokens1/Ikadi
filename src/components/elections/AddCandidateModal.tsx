
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface Candidate {
  name: string;
  party: string;
  isOurCandidate: boolean;
  photo?: string;
}

interface AddCandidateModalProps {
  onClose: () => void;
  onSubmit: (candidate: Candidate) => void;
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Candidate>({
    name: '',
    party: '',
    isOurCandidate: false,
    photo: '/placeholder.svg'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.party) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gov-gray">Ajouter un Candidat</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Nom et Prénom(s) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nom complet du candidat"
              required
            />
          </div>

          <div>
            <Label htmlFor="party">Parti politique / Appartenance *</Label>
            <Input
              id="party"
              value={formData.party}
              onChange={(e) => setFormData({ ...formData, party: e.target.value })}
              placeholder="Nom du parti politique"
              required
            />
          </div>

          <div>
            <Label htmlFor="photo">Photo du candidat (URL)</Label>
            <Input
              id="photo"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="URL de la photo"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ourCandidate"
              checked={formData.isOurCandidate}
              onChange={(e) => setFormData({ ...formData, isOurCandidate: e.target.checked })}
              className="w-4 h-4 text-gov-blue border-gray-300 rounded focus:ring-gov-blue"
            />
            <Label htmlFor="ourCandidate" className="text-sm font-medium text-gray-700">
              C'est notre candidat
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="gov-bg-primary hover:bg-gov-blue-dark">
              Ajouter le candidat
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
