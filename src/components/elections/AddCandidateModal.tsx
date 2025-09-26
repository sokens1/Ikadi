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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">Sélection des Candidats</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Choisissez les candidats pour cette élection</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden mb-4">
              <MultiSelect
                options={(candidates || []).map(c => ({
                  value: c.id,
                  label: c.name,
                  subtitle: c.party
                }))}
                selected={selectedCandidates}
                onSelectionChange={setSelectedCandidates}
                placeholder="Sélectionnez des candidats..."
                title="Candidats"
                icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e40af]" />}
                searchable={true}
                emptyMessage="Aucun candidat sélectionné"
                className="w-full"
              />
            </div>

            <div className="flex-shrink-0 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 flex-1 sm:flex-none min-h-[44px] sm:min-h-[40px]"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 flex-1 sm:flex-none min-h-[44px] sm:min-h-[40px]" 
                disabled={selectedCandidates.length === 0}
              >
                <span className="hidden xs:inline">Ajouter {selectedCandidates.length} candidat{selectedCandidates.length > 1 ? 's' : ''}</span>
                <span className="xs:hidden">Ajouter {selectedCandidates.length}</span>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateModal;
