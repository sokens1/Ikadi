
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCenter: (centerData: any) => void;
}

const AddCenterModal = ({ open, onOpenChange, onAddCenter }: AddCenterModalProps) => {
  const [centerForm, setCenterForm] = useState({
    name: '',
    address: '',
    responsible: '',
    contact: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (centerForm.name && centerForm.address) {
      onAddCenter(centerForm);
      setCenterForm({
        name: '',
        address: '',
        responsible: '',
        contact: '',
        notes: ''
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un centre de vote</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="centerName">Nom du centre *</Label>
            <Input
              id="centerName"
              value={centerForm.name}
              onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
              placeholder="Ex: EPP de l'Alliance"
              required
            />
          </div>

          <div>
            <Label htmlFor="centerAddress">Adresse *</Label>
            <Textarea
              id="centerAddress"
              value={centerForm.address}
              onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
              placeholder="Ex: Quartier Alliance, Moanda"
              required
            />
          </div>

          <div>
            <Label htmlFor="centerResponsible">Responsable du centre</Label>
            <Input
              id="centerResponsible"
              value={centerForm.responsible}
              onChange={(e) => setCenterForm({ ...centerForm, responsible: e.target.value })}
              placeholder="Nom du responsable"
            />
          </div>

          <div>
            <Label htmlFor="centerContact">Contact</Label>
            <Input
              id="centerContact"
              value={centerForm.contact}
              onChange={(e) => setCenterForm({ ...centerForm, contact: e.target.value })}
              placeholder="Téléphone ou email"
            />
          </div>

          <div>
            <Label htmlFor="centerNotes">Notes</Label>
            <Textarea
              id="centerNotes"
              value={centerForm.notes}
              onChange={(e) => setCenterForm({ ...centerForm, notes: e.target.value })}
              placeholder="Informations supplémentaires (optionnel)"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter le centre
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCenterModal;
