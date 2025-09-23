
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gov-gray">Détails du Centre de Vote</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Partie 1: Détails du Centre */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{center.name}</h3>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Modifier ce centre
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Adresse:</span>
                <p className="text-gray-900">{center.address}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Responsable:</span>
                <p className="text-gray-900">{center.responsable}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Contact:</span>
                <p className="text-gray-900">{center.contact}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Total Électeurs:</span>
                <p className="text-gray-900 font-bold">{center.voters.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Partie 2: Liste des Bureaux */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bureaux de Vote ({bureaux.length})</h3>
              <Button onClick={() => setShowAddBureau(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un bureau
              </Button>
            </div>

            {showAddBureau && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-3">Nouveau Bureau</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="bureauName">Nom du Bureau</Label>
                    <Input
                      id="bureauName"
                      value={newBureau.name}
                      onChange={(e) => setNewBureau({ ...newBureau, name: e.target.value })}
                      placeholder="Ex: Bureau 05"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bureauVoters">Nombre d'électeurs</Label>
                    <Input
                      id="bureauVoters"
                      type="number"
                      value={newBureau.registered_voters}
                      onChange={(e) => setNewBureau({ ...newBureau, registered_voters: parseInt(e.target.value) || 0 })}
                      placeholder="350"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button onClick={handleAddBureau} disabled={!newBureau.name.trim()}>
                    Ajouter
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddBureau(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom du Bureau</TableHead>
                    <TableHead>Nombre d'électeurs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        Chargement des bureaux...
                      </TableCell>
                    </TableRow>
                  ) : bureaux.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        Aucun bureau de vote configuré pour ce centre
                      </TableCell>
                    </TableRow>
                  ) : (
                    bureaux.map((bureau) => (
                      <TableRow key={bureau.id}>
                        <TableCell className="font-medium">{bureau.name}</TableCell>
                        <TableCell>{(bureau.registered_voters || 0).toLocaleString('fr-FR')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveBureau(bureau.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
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
