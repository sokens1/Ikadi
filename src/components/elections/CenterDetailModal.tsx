
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Bureau {
  id: number;
  number: string;
  voterCount: number;
  president?: string;
}

interface VotingCenter {
  id: number;
  name: string;
  address: string;
  responsible?: string;
  contact?: string;
  bureaus: Bureau[];
}

interface CenterDetailModalProps {
  center: VotingCenter;
  onClose: () => void;
  onUpdateCenter: (updatedCenter: VotingCenter) => void;
}

const CenterDetailModal = ({ center, onClose, onUpdateCenter }: CenterDetailModalProps) => {
  const [isEditingCenter, setIsEditingCenter] = useState(false);
  const [isAddingBureau, setIsAddingBureau] = useState(false);
  const [editingBureau, setEditingBureau] = useState<Bureau | null>(null);
  
  const [centerForm, setCenterForm] = useState({
    name: center.name,
    address: center.address,
    responsible: center.responsible || '',
    contact: center.contact || ''
  });

  const [bureauForm, setBureauForm] = useState({
    number: '',
    voterCount: 0,
    president: ''
  });

  const [bureaus, setBureaus] = useState<Bureau[]>(center.bureaus);

  const handleUpdateCenter = () => {
    const updatedCenter = {
      ...center,
      ...centerForm,
      bureaus
    };
    onUpdateCenter(updatedCenter);
    setIsEditingCenter(false);
  };

  const handleAddBureau = () => {
    if (bureauForm.number) {
      const newBureau: Bureau = {
        id: Date.now(),
        number: bureauForm.number,
        voterCount: bureauForm.voterCount,
        president: bureauForm.president || undefined
      };
      setBureaus([...bureaus, newBureau]);
      setBureauForm({ number: '', voterCount: 0, president: '' });
      setIsAddingBureau(false);
    }
  };

  const handleEditBureau = (bureau: Bureau) => {
    setBureauForm({
      number: bureau.number,
      voterCount: bureau.voterCount,
      president: bureau.president || ''
    });
    setEditingBureau(bureau);
  };

  const handleUpdateBureau = () => {
    if (editingBureau) {
      setBureaus(bureaus.map(b => 
        b.id === editingBureau.id 
          ? { ...b, ...bureauForm, president: bureauForm.president || undefined }
          : b
      ));
      setEditingBureau(null);
      setBureauForm({ number: '', voterCount: 0, president: '' });
    }
  };

  const handleDeleteBureau = (id: number) => {
    setBureaus(bureaus.filter(b => b.id !== id));
  };

  const totalVoters = bureaus.reduce((sum, bureau) => sum + bureau.voterCount, 0);

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Détails du Centre de Vote</DialogTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section Centre */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Informations du Centre</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingCenter(!isEditingCenter)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditingCenter ? 'Annuler' : 'Modifier'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingCenter ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="centerName">Nom du centre</Label>
                    <Input
                      id="centerName"
                      value={centerForm.name}
                      onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="centerAddress">Adresse</Label>
                    <Textarea
                      id="centerAddress"
                      value={centerForm.address}
                      onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="centerResponsible">Responsable</Label>
                      <Input
                        id="centerResponsible"
                        value={centerForm.responsible}
                        onChange={(e) => setCenterForm({ ...centerForm, responsible: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="centerContact">Contact</Label>
                      <Input
                        id="centerContact"
                        value={centerForm.contact}
                        onChange={(e) => setCenterForm({ ...centerForm, contact: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleUpdateCenter}>
                    Sauvegarder les modifications
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <strong>Nom:</strong> {center.name}
                  </div>
                  <div>
                    <strong>Adresse:</strong> {center.address}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Responsable:</strong> {center.responsible || 'Non assigné'}
                    </div>
                    <div>
                      <strong>Contact:</strong> {center.contact || 'Non renseigné'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section Bureaux */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Bureaux de Vote ({bureaus.length})
                  <span className="text-sm text-gray-600 ml-2">
                    - {totalVoters.toLocaleString('fr-FR')} électeurs
                  </span>
                </CardTitle>
                <Button onClick={() => setIsAddingBureau(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un bureau
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Formulaire d'ajout/édition de bureau */}
              {(isAddingBureau || editingBureau) && (
                <Card className="mb-4 bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="bureauNumber">Numéro/Nom du bureau</Label>
                          <Input
                            id="bureauNumber"
                            value={bureauForm.number}
                            onChange={(e) => setBureauForm({ ...bureauForm, number: e.target.value })}
                            placeholder="Ex: Bureau 01"
                          />
                        </div>
                        <div>
                          <Label htmlFor="voterCount">Nombre d'électeurs</Label>
                          <Input
                            id="voterCount"
                            type="number"
                            value={bureauForm.voterCount}
                            onChange={(e) => setBureauForm({ ...bureauForm, voterCount: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="president">Président du bureau</Label>
                          <Input
                            id="president"
                            value={bureauForm.president}
                            onChange={(e) => setBureauForm({ ...bureauForm, president: e.target.value })}
                            placeholder="Optionnel"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {editingBureau ? (
                          <Button onClick={handleUpdateBureau}>
                            Modifier le bureau
                          </Button>
                        ) : (
                          <Button onClick={handleAddBureau}>
                            Ajouter le bureau
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingBureau(false);
                            setEditingBureau(null);
                            setBureauForm({ number: '', voterCount: 0, president: '' });
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Liste des bureaux */}
              {bureaus.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun bureau de vote ajouté</p>
                  <p className="text-sm">Cliquez sur "Ajouter un bureau" pour commencer</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-600 border-b pb-2">
                    <div>Bureau</div>
                    <div>Électeurs</div>
                    <div>Président</div>
                    <div>Actions</div>
                  </div>
                  {bureaus.map((bureau) => (
                    <div key={bureau.id} className="grid grid-cols-4 gap-4 py-2 border-b items-center">
                      <div className="font-medium">{bureau.number}</div>
                      <div>{bureau.voterCount.toLocaleString('fr-FR')}</div>
                      <div>{bureau.president || 'Non assigné'}</div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditBureau(bureau)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteBureau(bureau.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CenterDetailModal;
