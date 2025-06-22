
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileCheck, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  User,
  MessageSquare
} from 'lucide-react';

const PVValidationSection = () => {
  const [selectedPV, setSelectedPV] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data pour les PV en attente
  const pendingPVs = [
    {
      id: 'PV001',
      bureau: 'Centre Libreville Nord - Bureau 001',
      agent: 'MOUNGUENGUI Paul',
      timestamp: '14:30',
      status: 'pending',
      priority: 'normal',
      data: {
        votants: 245,
        bulletinsNuls: 12,
        suffragesExprimes: 233,
        candidateVotes: {
          'C001': 98,
          'C002': 87,
          'C003': 48
        }
      },
      document: 'pv_001_scan.pdf'
    },
    {
      id: 'PV002',
      bureau: 'Centre Owendo - Bureau 002',
      agent: 'NZAME Marie',
      timestamp: '14:25',
      status: 'pending',
      priority: 'high',
      data: {
        votants: 189,
        bulletinsNuls: 8,
        suffragesExprimes: 181,
        candidateVotes: {
          'C001': 76,
          'C002': 65,
          'C003': 40
        }
      },
      document: 'pv_002_scan.pdf'
    },
    {
      id: 'PV003',
      bureau: 'Centre Port-Gentil - Bureau 003',
      agent: 'OBAME Pierre',
      timestamp: '13:45',
      status: 'pending',
      priority: 'urgent',
      data: {
        votants: 312,
        bulletinsNuls: 15,
        suffragesExprimes: 297,
        candidateVotes: {
          'C001': 125,
          'C002': 102,
          'C003': 70
        }
      },
      document: 'pv_003_scan.pdf'
    }
  ];

  const candidatesData = [
    { id: 'C001', name: 'ALLOGHO-OBIANG Marie', party: 'Parti Démocratique Gabonais' },
    { id: 'C002', name: 'NDONG Jean-Baptiste', party: 'Union Nationale' },
    { id: 'C003', name: 'OVONO-EBANG Claire', party: 'Rassemblement pour la Patrie' }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Priorité Haute</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Normal</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredPVs = pendingPVs.filter(pv => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return pv.priority === 'urgent';
    if (filter === 'high') return pv.priority === 'high';
    if (filter === 'normal') return pv.priority === 'normal';
    return true;
  });

  const handleValidation = (action: 'approve' | 'reject' | 'correction') => {
    // Handle validation action
    console.log(`Action: ${action}, PV: ${selectedPV}, Comment: ${comment}`);
    setSelectedPV(null);
    setComment('');
  };

  const selectedPVData = pendingPVs.find(pv => pv.id === selectedPV);

  return (
    <div className="space-y-6">
      {/* Filtres et statistiques */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gov-gray">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5" />
              <span>File d'Attente de Validation</span>
            </div>
            <Badge className="bg-orange-100 text-orange-800">
              {pendingPVs.length} PV en attente
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Tous ({pendingPVs.length})
            </Button>
            <Button
              variant={filter === 'urgent' ? 'default' : 'outline'}
              onClick={() => setFilter('urgent')}
              size="sm"
              className="text-red-600 border-red-200"
            >
              Urgent ({pendingPVs.filter(pv => pv.priority === 'urgent').length})
            </Button>
            <Button
              variant={filter === 'high' ? 'default' : 'outline'}
              onClick={() => setFilter('high')}
              size="sm"
              className="text-orange-600 border-orange-200"
            >
              Priorité Haute ({pendingPVs.filter(pv => pv.priority === 'high').length})
            </Button>
            <Button
              variant={filter === 'normal' ? 'default' : 'outline'}
              onClick={() => setFilter('normal')}
              size="sm"
            >
              Normal ({pendingPVs.filter(pv => pv.priority === 'normal').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des PV en attente */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="text-lg text-gov-gray">PV à Valider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPVs.map((pv) => (
                <div 
                  key={pv.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPV === pv.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPV(pv.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(pv.status)}
                      <span className="font-medium text-gray-900">{pv.id}</span>
                    </div>
                    {getPriorityBadge(pv.priority)}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1">{pv.bureau}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{pv.agent}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{pv.timestamp}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Votants: {pv.data.votants}</span>
                    <span>Exprimés: {pv.data.suffragesExprimes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interface de validation */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="text-lg text-gov-gray">
              {selectedPVData ? `Validation du ${selectedPVData.id}` : 'Sélectionner un PV à valider'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPVData ? (
              <div className="space-y-6">
                {/* Vue côte à côte */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Données saisies */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Données Saisies</h4>
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">Participation</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Votants:</span>
                            <span className="font-medium">{selectedPVData.data.votants}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bulletins nuls:</span>
                            <span className="font-medium">{selectedPVData.data.bulletinsNuls}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Suffrages exprimés:</span>
                            <span className="font-medium">{selectedPVData.data.suffragesExprimes}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">Résultats par Candidat</h5>
                        <div className="space-y-2">
                          {candidatesData.map((candidate) => (
                            <div key={candidate.id} className="flex justify-between text-sm">
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-xs text-gray-500">{candidate.party}</div>
                              </div>
                              <span className="font-medium">
                                {selectedPVData.data.candidateVotes[candidate.id]} voix
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vérifications automatiques */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Vérifications</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Total candidats:</span>
                            <span className="font-medium">
                              {Object.values(selectedPVData.data.candidateVotes).reduce((sum, votes) => sum + votes, 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Suffrages exprimés:</span>
                            <span className="font-medium">{selectedPVData.data.suffragesExprimes}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {Object.values(selectedPVData.data.candidateVotes).reduce((sum, votes) => sum + votes, 0) === selectedPVData.data.suffragesExprimes ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-700">Cohérence validée</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-red-700">Incohérence détectée</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document scanné */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Document Scanné</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h5 className="font-medium text-gray-900 mb-2">{selectedPVData.document}</h5>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir le document
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Section commentaires */}
                <div>
                  <Label htmlFor="comment">Commentaire de validation</Label>
                  <Textarea
                    id="comment"
                    placeholder="Ajouter un commentaire sur cette validation..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Boutons d'action */}
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleValidation('approve')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approuver
                  </Button>
                  
                  <Button
                    onClick={() => handleValidation('correction')}
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Demander Correction
                  </Button>
                  
                  <Button
                    onClick={() => handleValidation('reject')}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun PV sélectionné</h3>
                <p className="text-gray-600">
                  Cliquez sur un PV dans la liste de gauche pour commencer la validation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PVValidationSection;
