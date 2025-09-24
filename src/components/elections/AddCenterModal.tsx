/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ModernForm, ModernFormSection, ModernFormActions } from '@/components/ui/modern-form';
import MultiSelect from '@/components/ui/multi-select';
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
      <DialogContent className="max-w-2xl p-4 sm:p-6">
        <DialogHeader className="pb-4 sm:pb-6">
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

        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Centres de Vote</h3>
              <MultiSelect
                options={(centers || []).map(c => ({
                  value: c.id,
                  label: c.name,
                  subtitle: c.address
                }))}
                selected={selectedCenters}
                onSelectionChange={setSelectedCenters}
                placeholder="Sélectionnez des centres..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="text-sm px-4 py-2">Annuler</Button>
            <Button type="button" onClick={handleSubmit} className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm px-4 py-2" disabled={selectedCenters.length === 0}>
              <span className="hidden xs:inline">Ajouter {selectedCenters.length} centre{selectedCenters.length > 1 ? 's' : ''}</span>
              <span className="xs:hidden">Ajouter {selectedCenters.length}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCenterModal;
