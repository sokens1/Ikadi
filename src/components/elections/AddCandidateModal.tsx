/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { X, Users, Search, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filtrer les candidats selon le terme de recherche
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    return candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  // Toggle sélection d'un candidat
  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-gray-900">Sélection des Candidats</div>
              <div className="text-xs sm:text-sm text-gray-600">Choisissez les candidats pour cette élection</div>
            </div>
            <Button variant="ghost" onClick={onClose} className="flex-shrink-0 p-2" type="button">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Candidats</h3>
              
              {/* Barre de recherche */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] outline-none"
                  />
                </div>
              </div>

              {/* Liste des candidats */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Aucun candidat trouvé</p>
                  </div>
                ) : (
                  filteredCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCandidates.includes(candidate.id)
                          ? 'border-[#1e40af] bg-[#1e40af]/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleCandidate(candidate.id)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedCandidates.includes(candidate.id)
                            ? 'border-[#1e40af] bg-[#1e40af]'
                            : 'border-gray-300'
                        }`}>
                          {selectedCandidates.includes(candidate.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{candidate.name}</div>
                        <div className="text-sm text-gray-500 truncate">{candidate.party}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Actions fixes en bas */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-600">
              {selectedCandidates.length} candidat{selectedCandidates.length > 1 ? 's' : ''} sélectionné{selectedCandidates.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="text-sm px-4 py-2">
                Annuler
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm px-4 py-2" 
                disabled={selectedCandidates.length === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Valider
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateModal;
