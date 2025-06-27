import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Edit3,
  User,
  Clock,
  MapPin,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertTriangle
} from 'lucide-react';

interface Election {
  id: string;
  name: string;
  date: string;
  status: string;
  candidates: Array<{
    id: string;
    name: string;
    party: string;
    photo?: string;
  }>;
  totalCenters: number;
  totalBureaux: number;
}

interface ValidationSectionProps {
  pendingCount: number;
  election?: Election;
}

const ValidationSection: React.FC<ValidationSectionProps> = ({ pendingCount, election }) => {
  const [filter, setFilter] = useState('all');
  const [selectedPV, setSelectedPV] = useState<string | null>(null);
  const [validationComment, setValidationComment] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Mock data pour les PV en attente - utilise les candidats de l'élection si disponible
  const candidateNames = election?.candidates?.map(c => c.name) || ['Notre Candidat', 'Adversaire A', 'Adversaire B'];
  
  const pendingPVs = [
    {
      id: 'PV001',
      center: 'EPP de l\'Alliance',
      bureau: 'Bureau 02',
      agent: 'B. Kassa',
      submittedAt: '18h12',
      hasAnomaly: false,
      data: {
        inscrits: 350,
        votants: 290,
        bulletinsNuls: 5,
        candidateVotes: {
          [candidateNames[0]]: 185,
          [candidateNames[1]]: 80,
          [candidateNames[2]]: 20
        }
      },
      imageUrl: '/placeholder-pv.jpg'
    },
    {
      id: 'PV002',
      center: 'Lycée d\'État',
      bureau: 'Bureau 02',
      agent: 'I. Koumba',
      submittedAt: '18h15',
      hasAnomaly: true,
      anomalyReason: 'Les votes exprimés > nombre de votants',
      data: {
        inscrits: 280,
        votants: 250,
        bulletinsNuls: 8,
        candidateVotes: {
          [candidateNames[0]]: 120,
          [candidateNames[1]]: 95,
          [candidateNames[2]]: 35
        }
      },
      imageUrl: '/placeholder-pv.jpg'
    },
    {
      id: 'PV003',
      center: 'Centre Municipal',
      bureau: 'Bureau 01',
      agent: 'M. Assele',
      submittedAt: '18h10',
      hasAnomaly: true,
      anomalyReason: 'Photo du PV illisible',
      data: {
        inscrits: 320,
        votants: 275,
        bulletinsNuls: 12,
        candidateVotes: {
          [candidateNames[0]]: 140,
          [candidateNames[1]]: 78,
          [candidateNames[2]]: 45
        }
      },
      imageUrl: '/placeholder-pv.jpg'
    }
  ];

  const filteredPVs = pendingPVs.filter(pv => {
    if (filter === 'all') return true;
    if (filter === 'anomalies') return pv.hasAnomaly;
    if (filter === 'recent') return true; // Tri par récence à implémenter
    return true;
  });

  const selectedPVData = pendingPVs.find(pv => pv.id === selectedPV);

  const calculateTotal = (votes: Record<string, number>) => {
    return Object.values(votes).reduce((sum, vote) => sum + vote, 0);
  };

  const isDataConsistent = (pv: any) => {
    const totalVotes = calculateTotal(pv.data.candidateVotes);
    const expectedVotes = pv.data.votants - pv.data.bulletinsNuls;
    return totalVotes === expectedVotes;
  };

  const handleValidation = (action: 'approve' | 'reject' | 'correct') => {
    console.log(`Action: ${action}, PV: ${selectedPV}, Comment: ${validationComment}`);
    setShowValidationModal(false);
    setSelectedPV(null);
    setValidationComment('');
  };

  const openValidationModal = (pvId: string) => {
    setSelectedPV(pvId);
    setShowValidationModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Affichage de l'élection courante */}
      {election && (
        <Card className="gov-card bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{election.name}</h3>
                <p className="text-sm text-blue-700">{election.candidates.length} candidats • {election.totalBureaux} bureaux</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {election.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gov-gray">
            <span>File d'Attente de Validation</span>
            <Badge className="bg-orange-100 text-orange-800">
              {pendingCount} PV en attente
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Tous ({pendingPVs.length})
            </Button>
            <Button
              variant={filter === 'anomalies' ? 'default' : 'outline'}
              onClick={() => setFilter('anomalies')}
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Avec Anomalies ({pendingPVs.filter(pv => pv.hasAnomaly).length})
            </Button>
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              onClick={() => setFilter('recent')}
              size="sm"
            >
              Les plus récents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des PV */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPVs.map((pv) => (
          <Card key={pv.id} className="gov-card hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* En-tête */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">
                        {pv.center} - {pv.bureau}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{pv.agent}</span>
                      </div>
                    </div>
                  </div>
                  {pv.hasAnomaly && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>

                {/* Anomalie */}
                {pv.hasAnomaly && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    🚩 {pv.anomalyReason}
                  </div>
                )}

                {/* Résultats rapides */}
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {candidateNames[0]} : {pv.data.candidateVotes[candidateNames[0]]} voix
                  </div>
                  <div className="text-xs text-gray-500">
                    Soumis à {pv.submittedAt}
                  </div>
                </div>

                {/* Vérification de cohérence */}
                <div className="flex items-center space-x-2 text-xs">
                  {isDataConsistent(pv) ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-green-700">Données cohérentes</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span className="text-red-700">Incohérence détectée</span>
                    </>
                  )}
                </div>

                {/* Action */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openValidationModal(pv.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Examiner le PV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de validation */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Validation du {selectedPVData?.id} - {selectedPVData?.center} {selectedPVData?.bureau}
            </DialogTitle>
          </DialogHeader>

          {selectedPVData && (
            <div className="space-y-6">
              {/* Interface côte à côte */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document scanné */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Document Scanné</h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">PV_{selectedPVData.id}_scan.jpg</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="aspect-[3/4] bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-2" />
                        <p>Image du PV scanné</p>
                        <p className="text-sm">Cliquez pour agrandir</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Données saisies */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Données Saisies</h4>
                  <div className="space-y-4">
                    {/* Participation */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Participation</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Nombre d'inscrits :</span>
                          <span className="font-medium">{selectedPVData.data.inscrits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nombre de votants :</span>
                          <span className="font-medium">{selectedPVData.data.votants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bulletins nuls :</span>
                          <span className="font-medium">{selectedPVData.data.bulletinsNuls}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Suffrages exprimés :</span>
                          <span className="font-medium">
                            {selectedPVData.data.votants - selectedPVData.data.bulletinsNuls}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Résultats par candidat */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Résultats par Candidat</h5>
                      <div className="space-y-2">
                        {Object.entries(selectedPVData.data.candidateVotes).map(([candidate, votes]) => (
                          <div key={candidate} className="flex justify-between text-sm">
                            <span className="font-medium">{candidate}</span>
                            <span className="font-medium">{votes} voix</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t pt-2 font-medium">
                          <span>Total :</span>
                          <span>{calculateTotal(selectedPVData.data.candidateVotes)} voix</span>
                        </div>
                      </div>
                    </div>

                    {/* Vérifications */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-3">Vérifications Automatiques</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Total candidats :</span>
                          <span className="font-medium">
                            {calculateTotal(selectedPVData.data.candidateVotes)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Suffrages exprimés :</span>
                          <span className="font-medium">
                            {selectedPVData.data.votants - selectedPVData.data.bulletinsNuls}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 pt-2 border-t">
                          {isDataConsistent(selectedPVData) ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-medium">Cohérence validée</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-red-700 font-medium">Incohérence détectée</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire de validation
                </label>
                <Textarea
                  placeholder="Ajouter un commentaire sur cette validation..."
                  value={validationComment}
                  onChange={(e) => setValidationComment(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleValidation('approve')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ✅ Valider et Confirmer
                </Button>
                
                <Button
                  onClick={() => handleValidation('correct')}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  ✏️ Corriger et Valider
                </Button>
                
                <Button
                  onClick={() => handleValidation('reject')}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  ❌ Rejeter ce PV
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidationSection;
