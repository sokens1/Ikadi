
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Edit, Trash2 } from 'lucide-react';

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
  number: string;
  voters: number;
  president: string;
}

interface CenterDetailModalProps {
  center: Center;
  onClose: () => void;
}

const CenterDetailModal: React.FC<CenterDetailModalProps> = ({ center, onClose }) => {
  const [showAddBureau, setShowAddBureau] = useState(false);
  const [bureaux, setBureaux] = useState<Bureau[]>([
    {
      id: '1',
      number: 'Bureau 01',
      voters: 350,
      president: 'Marie OBAME'
    },
    {
      id: '2',
      number: 'Bureau 02',
      voters: 345,
      president: 'Jean NDONG'
    },
    {
      id: '3',
      number: 'Bureau 03',
      voters: 368,
      president: 'Paul ONDO'
    },
    {
      id: '4',
      number: 'Bureau 04',
      voters: 357,
      president: '(non assigné)'
    }
  ]);

  const [newBureau, setNewBureau] = useState({
    number: '',
    voters: 0,
    president: ''
  });

  const handleAddBureau = () => {
    if (newBureau.number) {
      const bureau: Bureau = {
        id: Date.now().toString(),
        number: newBureau.number,
        voters: newBureau.voters,
        president: newBureau.president || '(non assigné)'
      };
      setBureaux([...bureaux, bureau]);
      setNewBureau({ number: '', voters: 0, president: '' });
      setShowAddBureau(false);
    }
  };

  const handleRemoveBureau = (id: string) => {
    setBureaux(bureaux.filter(b => b.id !== id));
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="bureauNumber">Numéro/ID du Bureau</Label>
                    <Input
                      id="bureauNumber"
                      value={newBureau.number}
                      onChange={(e) => setNewBureau({ ...newBureau, number: e.target.value })}
                      placeholder="Ex: Bureau 05"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bureauVoters">Nombre d'électeurs</Label>
                    <Input
                      id="bureauVoters"
                      type="number"
                      value={newBureau.voters}
                      onChange={(e) => setNewBureau({ ...newBureau, voters: parseInt(e.target.value) || 0 })}
                      placeholder="350"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bureauPresident">Président du bureau</Label>
                    <Input
                      id="bureauPresident"
                      value={newBureau.president}
                      onChange={(e) => setNewBureau({ ...newBureau, president: e.target.value })}
                      placeholder="Nom du président"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button onClick={handleAddBureau} disabled={!newBureau.number}>
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
                    <TableHead>ID/Numéro du Bureau</TableHead>
                    <TableHead>Nombre d'électeurs</TableHead>
                    <TableHead>Président du bureau</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bureaux.map((bureau) => (
                    <TableRow key={bureau.id}>
                      <TableCell className="font-medium">{bureau.number}</TableCell>
                      <TableCell>{bureau.voters.toLocaleString('fr-FR')}</TableCell>
                      <TableCell>{bureau.president}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total des électeurs dans les bureaux:</span>
                <span className="font-bold">
                  {bureaux.reduce((sum, bureau) => sum + bureau.voters, 0).toLocaleString('fr-FR')}
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
