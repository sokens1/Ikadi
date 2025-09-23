
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

interface ValidationSectionProps {
  pendingCount: number;
  selectedElection: string;
}

const ValidationSection: React.FC<ValidationSectionProps> = ({ pendingCount, selectedElection }) => {
  const [filter, setFilter] = useState('all');
  const [selectedPV, setSelectedPV] = useState<string | null>(null);
  const [validationComment, setValidationComment] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [pendingPVs, setPendingPVs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les PV en attente pour l'élection sélectionnée
  useEffect(() => {
    const loadPendingPVs = async () => {
      if (!selectedElection) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('procès_verbaux')
          .select(`
            id,
            status,
            anomalies,
            entered_by,
            entered_at,
            voting_bureaux!bureau_id(id, name, voting_centers!center_id(name))
          `)
          .eq('election_id', selectedElection)
          .in('status', ['saisi', 'en_attente', 'anomaly']);

        if (error) {
          console.error('Erreur chargement PVs:', error);
          setPendingPVs([]);
          return;
        }

        const mapped = (data || []).map((pv: any) => ({
          id: pv.id,
          center: pv.voting_bureaux?.voting_centers?.name || 'Centre inconnu',
          bureau: pv.voting_bureaux?.name || 'Bureau',
          agent: pv.entered_by || '',
          submittedAt: pv.entered_at ? new Date(pv.entered_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
          hasAnomaly: !!pv.anomalies,
          anomalyReason: pv.anomalies || undefined,
          data: {
            inscrits: 0,
            votants: 0,
            bulletinsNuls: 0,
            candidateVotes: {}
          }
        }));

        setPendingPVs(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadPendingPVs();
  }, [selectedElection]);

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

  const handleValidation = async (action: 'approve' | 'reject' | 'correct') => {
    if (!selectedPV) return;
    try {
      const newStatus = action === 'approve' ? 'validé' : action === 'reject' ? 'rejeté' : 'corrigé';
      const { error } = await supabase
        .from('procès_verbaux')
        .update({ status: newStatus, validation_comment: validationComment })
        .eq('id', selectedPV)
        .eq('election_id', selectedElection);
      if (error) {
        console.error('Erreur validation PV:', error);
      }
      setShowValidationModal(false);
      setSelectedPV(null);
      setValidationComment('');
      // rafraîchir
      const refreshed = pendingPVs.filter(pv => pv.id !== selectedPV);
      setPendingPVs(refreshed);
    } catch (e) {
      console.error(e);
    }
  };

  const openValidationModal = (pvId: string) => {
    setSelectedPV(pvId);
    setShowValidationModal(true);
  };

  return (
    <div className="space-y-6">
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
        {(loading ? [] : filteredPVs).map((pv) => (
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
                    Notre Candidat : {pv.data.candidateVotes['Notre Candidat']} voix
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
