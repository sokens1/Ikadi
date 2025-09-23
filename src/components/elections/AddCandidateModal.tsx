/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ModernForm, ModernFormSection, ModernFormActions } from '@/components/ui/modern-form';
import MultiSelect from '@/components/ui/multi-select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  name: string;
  party: string;
  isOurCandidate: boolean;
  photo?: string;
}

interface AddCandidateModalProps {
  onClose: () => void;
  onSubmit: (candidates: Candidate[]) => void;
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ onClose, onSubmit }) => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Array<{id: string, name: string, party: string, isOurCandidate: boolean}>>([]);
  const [loading, setLoading] = useState(true);

  // Charger les candidats disponibles
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        // Essayer d'abord avec 'candidats', puis avec 'candidates' si ça échoue
        let { data, error } = await supabase
          .from('candidats')
          .select('id, nom, parti, est_notre_candidat')
          .order('nom');

        if (error && (error.code === 'PGRST116' || error.code === 'PGRST205')) {
          // Table 'candidats' n'existe pas, essayer 'candidates'
          const result = await supabase
            .from('candidates')
            .select('id, name, party, is_our_candidate')
            .order('name');
          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error('Erreur lors du chargement des candidats:', error);
          toast.error('Erreur lors du chargement des candidats');
          return;
        }

        // Transformer les données selon le format de la table
        const transformedCandidates = (data || []).map((candidate: any) => ({
          id: candidate.id,
          name: candidate.nom || candidate.name || '',
          party: candidate.parti || candidate.party || '',
          isOurCandidate: candidate.est_notre_candidat || candidate.is_our_candidate || false
        }));

        setCandidates(transformedCandidates);
      } catch (error) {
        console.error('Erreur lors du chargement des candidats:', error);
        toast.error('Erreur lors du chargement des candidats');
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AddCandidateModal - handleSubmit appelé');
    console.log('selectedCandidates:', selectedCandidates);
    console.log('candidates disponibles:', candidates);
    
    if (selectedCandidates.length > 0) {
      const candidatesToAdd = candidates
        .filter(c => selectedCandidates.includes(c.id))
        .map(c => ({
          id: c.id,
          name: c.name,
          party: c.party,
          isOurCandidate: c.isOurCandidate,
          photo: '/placeholder.svg'
        }));
      
      console.log('candidatesToAdd:', candidatesToAdd);
      onSubmit(candidatesToAdd);
    } else {
      console.log('Aucun candidat sélectionné');
      toast.error('Veuillez sélectionner au moins un candidat');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gov-blue/10 rounded-lg">
              <Users className="w-5 h-5 text-gov-blue" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Sélection des Candidats</div>
              <div className="text-sm text-gray-600">Choisissez les candidats qui participeront à cette élection</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            <Button variant="ghost" onClick={onClose} className="absolute right-4 top-4" type="button">
              <X className="w-5 h-5" />
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <ModernForm onSubmit={handleSubmit}>
            <ModernFormSection title="Candidats">
              <MultiSelect
                options={(candidates || []).map(c => ({
                  value: c.id,
                  label: c.name,
                  subtitle: c.party
                }))}
                selected={selectedCandidates}
                onSelectionChange={setSelectedCandidates}
                placeholder="Sélectionnez des candidats..."
              />
            </ModernFormSection>

            <ModernFormActions>
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
              <Button type="submit" className="btn-primary" disabled={selectedCandidates.length === 0}>
                Ajouter {selectedCandidates.length} candidat{selectedCandidates.length > 1 ? 's' : ''}
              </Button>
            </ModernFormActions>
          </ModernForm>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateModal;
