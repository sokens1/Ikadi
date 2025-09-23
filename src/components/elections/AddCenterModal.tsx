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
      onSubmit(centersToAdd);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Sélection des Centres de Vote</div>
              <div className="text-sm text-gray-600">Choisissez les centres de vote pour cette élection</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            <Button variant="ghost" onClick={onClose} className="absolute right-4 top-4" type="button">
              <X className="w-5 h-5" />
            </Button>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="pt-2">
          <ModernForm>
            <ModernFormSection title="Centres de Vote">
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
            </ModernFormSection>

            <ModernFormActions>
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
              <Button type="submit" className="btn-primary" disabled={selectedCenters.length === 0}>
                Ajouter {selectedCenters.length} centre{selectedCenters.length > 1 ? 's' : ''}
              </Button>
            </ModernFormActions>
          </ModernForm>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCenterModal;
