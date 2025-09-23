
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Edit, Trash2 } from 'lucide-react';
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

interface Bureau {
  id: string;
  name: string;
  center_id: string;
  registered_voters?: number;
}

interface CenterDetailModalProps {
  center: Center;
  onClose: () => void;
}

const CenterDetailModal: React.FC<CenterDetailModalProps> = ({ center, onClose }) => {
  const [showAddBureau, setShowAddBureau] = useState(false);
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(true);

  const [newBureau, setNewBureau] = useState({
    name: '',
    registered_voters: 0
  });

  // Charger les bureaux depuis Supabase
  useEffect(() => {
    const fetchBureaux = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('voting_bureaux')
          .select('*')
          .eq('center_id', center.id)
          .order('name', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des bureaux:', error);
          toast.error('Erreur lors du chargement des bureaux');
          return;
        }

        setBureaux(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des bureaux:', error);
        toast.error('Erreur lors du chargement des bureaux');
      } finally {
        setLoading(false);
      }
    };

    fetchBureaux();
  }, [center.id]);

  const handleAddBureau = async () => {
    if (!newBureau.name.trim()) {
      toast.error('Le nom du bureau est requis');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('voting_bureaux')
        .insert({
          name: newBureau.name.trim(),
          center_id: center.id,
          registered_voters: newBureau.registered_voters || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout du bureau:', error);
        toast.error(`Erreur lors de l'ajout du bureau: ${error.message}`);
        return;
      }

      setBureaux([...bureaux, data]);
      setNewBureau({ name: '', registered_voters: 0 });
      setShowAddBureau(false);
      toast.success('Bureau ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bureau:', error);
      toast.error('Erreur lors de l\'ajout du bureau');
    }
  };

  const handleRemoveBureau = async (id: string) => {
    try {
      const { error } = await supabase
        .from('voting_bureaux')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du bureau:', error);
        toast.error('Erreur lors de la suppression du bureau');
        return;
      }

      setBureaux(bureaux.filter(b => b.id !== id));
      toast.success('Bureau supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du bureau:', error);
      toast.error('Erreur lors de la suppression du bureau');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gov-gray">Détails du Centre de Vote</h2>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 overflow-auto max-h-[calc(90vh-120px)] space-y-4 sm:space-y-6">
          {/* Partie 1: Détails du Centre */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold">{center.name}</h3>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Modifier ce centre</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Adresse:</span>
                <p className="text-gray-900 text-xs sm:text-sm break-words">{center.address}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Responsable:</span>
                <p className="text-gray-900 text-xs sm:text-sm">{center.responsable}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Contact:</span>
                <p className="text-gray-900 text-xs sm:text-sm">{center.contact}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">Total Électeurs:</span>
                <p className="text-gray-900 font-bold text-xs sm:text-sm">{center.voters.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Partie 2: Liste des Bureaux */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold">Bureaux de Vote ({bureaux.length})</h3>
              <Button onClick={() => setShowAddBureau(true)} className="w-full sm:w-auto">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Ajouter un bureau</span>
              </Button>
            </div>

            {showAddBureau && (
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Nouveau Bureau</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="bureauName" className="text-xs sm:text-sm">Nom du Bureau</Label>
                    <Input
                      id="bureauName"
                      value={newBureau.name}
                      onChange={(e) => setNewBureau({ ...newBureau, name: e.target.value })}
                      placeholder="Ex: Bureau 05"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bureauVoters" className="text-xs sm:text-sm">Nombre d'électeurs</Label>
                    <Input
                      id="bureauVoters"
                      type="number"
                      value={newBureau.registered_voters}
                      onChange={(e) => setNewBureau({ ...newBureau, registered_voters: parseInt(e.target.value) || 0 })}
                      placeholder="350"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <Button onClick={handleAddBureau} disabled={!newBureau.name.trim()} className="w-full sm:w-auto text-xs sm:text-sm">
                    Ajouter
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddBureau(false)} className="w-full sm:w-auto text-xs sm:text-sm">
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Nom du Bureau</TableHead>
                    <TableHead className="text-xs sm:text-sm">Nombre d'électeurs</TableHead>
                    <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <span className="text-xs sm:text-sm">Chargement des bureaux...</span>
                      </TableCell>
                    </TableRow>
                  ) : bureaux.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm">
                        Aucun bureau de vote configuré pour ce centre
                      </TableCell>
                    </TableRow>
                  ) : (
                    bureaux.map((bureau) => (
                      <TableRow key={bureau.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{bureau.name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{(bureau.registered_voters || 0).toLocaleString('fr-FR')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1 sm:space-x-2">
                            <Button variant="outline" size="sm" className="p-1 sm:p-2">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveBureau(bureau.id)}
                              className="p-1 sm:p-2"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                <span className="font-medium">Total des électeurs dans les bureaux:</span>
                <span className="font-bold">
                  {bureaux.reduce((sum, bureau) => sum + (bureau.registered_voters || 0), 0).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterDetailModal;
