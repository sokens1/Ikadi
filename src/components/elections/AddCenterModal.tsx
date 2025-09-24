/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { X, Building, Search, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Center {
  id: string;
  name: string;
  address: string;
  responsable: string;
  contact: string;
  bureaux: number;
  voters: number;
}

interface AddCenterModalProps {
  onClose: () => void;
  onSubmit: (centers: Center[]) => void;
}

const AddCenterModal: React.FC<AddCenterModalProps> = ({ onClose, onSubmit }) => {
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [centers, setCenters] = useState<Array<{id: string, name: string, address: string, total_voters: number, total_bureaux: number}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Charger les centres disponibles
  useEffect(() => {
    const loadCenters = async () => {
      try {
        setLoading(true);
        // Essayer d'abord avec 'voting_centers', puis avec 'centres_de_vote' si ça échoue
        let { data, error } = await supabase
          .from('voting_centers')
          .select('id, name, address, total_voters, total_bureaux')
          .order('name');

        if (error && (error.code === 'PGRST116' || error.code === 'PGRST205')) {
          // Table 'voting_centers' n'existe pas, essayer 'centres_de_vote'
          const result = await supabase
            .from('centres_de_vote')
            .select('id, nom, adresse, total_voters, total_bureaux')
            .order('nom');
          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error('Erreur lors du chargement des centres:', error);
          toast.error('Erreur lors du chargement des centres');
          return;
        }

        // Transformer les données selon le format de la table
        const transformedCenters = (data || []).map((center: any) => ({
          id: center.id,
          name: center.name || center.nom || '',
          address: center.address || center.adresse || '',
          totalVoters: center.total_voters || 0,
          totalBureaux: center.total_bureaux || 0
        }));

        setCenters(transformedCenters);
      } catch (error) {
        console.error('Erreur lors du chargement des centres:', error);
        toast.error('Erreur lors du chargement des centres');
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []);

  // Filtrer les centres selon le terme de recherche
  const filteredCenters = useMemo(() => {
    if (!searchTerm) return centers;
    return centers.filter(center => 
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [centers, searchTerm]);

  // Toggle sélection d'un centre
  const toggleCenter = (centerId: string) => {
    setSelectedCenters(prev => 
      prev.includes(centerId) 
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AddCenterModal - handleSubmit appelé');
    console.log('selectedCenters:', selectedCenters);
    console.log('centers disponibles:', centers);
    
    if (selectedCenters.length > 0) {
      const centersToAdd = centers
        .filter(c => selectedCenters.includes(c.id))
        .map(c => ({
          id: c.id,
          name: c.name,
          address: c.address,
          responsable: '',
          contact: '',
          bureaux: c.total_bureaux || 0,
          voters: c.total_voters || 0
        }));
      
      console.log('centersToAdd:', centersToAdd);
      onSubmit(centersToAdd);
    } else {
      console.log('Aucun centre sélectionné');
      toast.error('Veuillez sélectionner au moins un centre');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-xl font-bold text-gray-900">Sélection des Centres de Vote</div>
              <div className="text-xs sm:text-sm text-gray-600">Choisissez les centres de vote pour cette élection</div>
            </div>
            <Button variant="ghost" onClick={onClose} className="flex-shrink-0 p-2" type="button">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Centres de Vote</h3>
              
              {/* Barre de recherche */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un centre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] outline-none"
                  />
                </div>
              </div>

              {/* Liste des centres */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {filteredCenters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Aucun centre trouvé</p>
                  </div>
                ) : (
                  filteredCenters.map(center => (
                    <div
                      key={center.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCenters.includes(center.id)
                          ? 'border-[#1e40af] bg-[#1e40af]/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleCenter(center.id)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedCenters.includes(center.id)
                            ? 'border-[#1e40af] bg-[#1e40af]'
                            : 'border-gray-300'
                        }`}>
                          {selectedCenters.includes(center.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{center.name}</div>
                        <div className="text-sm text-gray-500 truncate">{center.address}</div>
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
              {selectedCenters.length} centre{selectedCenters.length > 1 ? 's' : ''} sélectionné{selectedCenters.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="text-sm px-4 py-2">
                Annuler
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm px-4 py-2" 
                disabled={selectedCenters.length === 0}
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

export default AddCenterModal;
