
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  party: string;
  photo?: string;
  isOurCandidate: boolean;
}

interface AddCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCandidate: (candidateData: any) => void;
  existingCandidates: Candidate[];
}

const AddCandidateModal = ({ open, onOpenChange, onAddCandidate, existingCandidates }: AddCandidateModalProps) => {
  const [candidateForm, setCandidateForm] = useState({
    firstName: '',
    lastName: '',
    party: '',
    isOurCandidate: false
  });

  const hasOurCandidate = existingCandidates.some(c => c.isOurCandidate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (candidateForm.firstName && candidateForm.lastName) {
      onAddCandidate(candidateForm);
      setCandidateForm({
        firstName: '',
        lastName: '',
        party: '',
        isOurCandidate: false
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un candidat</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom(s) *</Label>
              <Input
                id="firstName"
                value={candidateForm.firstName}
                onChange={(e) => setCandidateForm({ ...candidateForm, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={candidateForm.lastName}
                onChange={(e) => setCandidateForm({ ...candidateForm, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="party">Parti politique / Appartenance</Label>
            <Input
              id="party"
              value={candidateForm.party}
              onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
              placeholder="Ex: Parti Démocratique Gabonais"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ourCandidate"
              checked={candidateForm.isOurCandidate}
              onCheckedChange={(checked) => setCandidateForm({ ...candidateForm, isOurCandidate: checked as boolean })}
              disabled={hasOurCandidate && !candidateForm.isOurCandidate}
            />
            <Label htmlFor="ourCandidate" className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>C'est notre candidat</span>
            </Label>
          </div>

          {hasOurCandidate && !candidateForm.isOurCandidate && (
            <p className="text-sm text-gray-600">
              Un candidat est déjà marqué comme "notre candidat". 
              Vous pouvez modifier cette sélection depuis la liste des candidats.
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter le candidat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateModal;
