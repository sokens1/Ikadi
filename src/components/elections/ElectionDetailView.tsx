import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  MapPin, 
  Building,
  Plus,
  Settings,
  Eye,
  CheckCircle
} from 'lucide-react';
import AddCandidateModal from './AddCandidateModal';
import AddCenterModal from './AddCenterModal';
import CenterDetailModal from './CenterDetailModal';

interface ElectionData {
  id: string;
  name: string;
  title: string;
  date: string;
  status: string;
  statusColor: string;
  description: string;
  voters: number;
  candidates: Array<{
    id: string;
    name: string;
    party: string;
    photo?: string;
  }>;
  centers: number;
  totalBureaux: number;
  totalCenters: number;
  bureaux: number;
  location: string;
  type: string;
  seatsAvailable: number;
  budget?: number;
  voteGoal?: number;
  province: string;
  department: string;
  commune: string;
  arrondissement: string;
}

interface ElectionDetailViewProps {
  election: ElectionData;
  onBack: () => void;
}

const ElectionDetailView: React.FC<ElectionDetailViewProps> = ({ election, onBack }) => {
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showAddCenter, setShowAddCenter] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<any>(null);

  const getElectionStatus = (date: string) => {
    const today = new Date();
    const electionDate = new Date(date);
    
    if (today < electionDate) {
      const diffTime = electionDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: 'À venir', color: 'blue', countdown: `J-${diffDays}` };
    } else if (today.toDateString() === electionDate.toDateString()) {
      return { status: 'En cours', color: 'green', countdown: null };
    } else {
      return { status: 'Terminée', color: 'gray', countdown: null };
    }
  };

  const statusInfo = getElectionStatus(election.date);

  // Mock data for voting centers
  const votingCenters = Array.from({ length: election.centers }, (_, i) => ({
    id: i + 1,
    name: `Centre de Vote ${i + 1}`,
    address: `Adresse du centre ${i + 1}`,
    bureaux: Math.floor(Math.random() * 5) + 2,
    voters: Math.floor(Math.random() * 1000) + 200,
    status: Math.random() > 0.7 ? 'En préparation' : 'Prêt'
  }));

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gov-gray">{election.title}</h1>
              <p className="text-gray-600 mt-1">{election.description}</p>
            </div>
          </div>
          <Badge variant={statusInfo.color === 'blue' ? 'default' : statusInfo.color === 'green' ? 'secondary' : 'outline'}>
            {statusInfo.status}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="gov-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Date(election.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-600">Date d'élection</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {election.voters.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-600">Électeurs inscrits</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <MapPin className="w-8 h-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{election.centers}</div>
                  <div className="text-sm text-gray-600">Centres de vote</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Building className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{election.bureaux}</div>
                  <div className="text-sm text-gray-600">Bureaux de vote</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="gov-card">
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="overview" 
                    className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                  >
                    Vue d'ensemble
                  </TabsTrigger>
                  <TabsTrigger 
                    value="candidates" 
                    className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                  >
                    Candidats ({election.candidates.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="centers" 
                    className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                  >
                    Centres de vote ({election.centers})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                  >
                    Configuration
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="gov-card">
                      <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Type d'élection</label>
                          <p className="text-lg font-semibold">{election.type}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Circonscription</label>
                          <p className="text-lg font-semibold">{election.location}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Sièges disponibles</label>
                          <p className="text-lg font-semibold">{election.seatsAvailable}</p>
                        </div>
                        {election.budget && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Budget alloué</label>
                            <p className="text-lg font-semibold">{election.budget.toLocaleString('fr-FR')} FCFA</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="gov-card">
                      <CardHeader>
                        <CardTitle>Localisation administrative</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Province</label>
                          <p className="text-lg font-semibold">{election.province}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Département</label>
                          <p className="text-lg font-semibold">{election.department}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Commune</label>
                          <p className="text-lg font-semibold">{election.commune}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Arrondissement</label>
                          <p className="text-lg font-semibold">{election.arrondissement}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="candidates" className="space-y-6 mt-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Liste des candidats</h3>
                    <Button onClick={() => setShowAddCandidate(true)} className="gov-bg-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un candidat
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {election.candidates.map((candidate) => (
                      <Card key={candidate.id} className="gov-card">
                        <CardContent className="p-4">
                          <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                              <Users className="w-8 h-8 text-gray-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{candidate.name}</h4>
                              <p className="text-sm text-gray-600">{candidate.party}</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              Voir le profil
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {election.candidates.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        Aucun candidat ajouté pour cette élection
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="centers" className="space-y-6 mt-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Centres de vote</h3>
                    <Button onClick={() => setShowAddCenter(true)} className="gov-bg-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un centre
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {votingCenters.map((center) => (
                      <Card key={center.id} className="gov-card hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{center.name}</h4>
                              <p className="text-sm text-gray-600">{center.address}</p>
                            </div>
                            <Badge variant={center.status === 'Prêt' ? 'secondary' : 'outline'}>
                              {center.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{center.bureaux}</div>
                              <div className="text-xs text-gray-500">Bureaux</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{center.voters}</div>
                              <div className="text-xs text-gray-500">Électeurs</div>
                            </div>
                          </div>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setSelectedCenter(center)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir les détails
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 mt-0">
                  <Card className="gov-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="w-5 h-5" />
                        <span>Configuration de l'élection</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Paramètres généraux</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span>Votes électroniques</span>
                              <Badge variant="outline">Désactivé</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span>Validation automatique</span>
                              <Badge variant="secondary">Activé</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span>Seuil de participation</span>
                              <Badge variant="outline">50%</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-semibold">Sécurité</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                              <span>Chiffrement des données</span>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                              <span>Audit trail</span>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                              <span>Vérification d'identité</span>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Modals */}
        {showAddCandidate && (
          <AddCandidateModal
            onClose={() => setShowAddCandidate(false)}
            onAdd={(candidate) => {
              console.log('Nouveau candidat:', candidate);
              setShowAddCandidate(false);
            }}
          />
        )}

        {showAddCenter && (
          <AddCenterModal
            onClose={() => setShowAddCenter(false)}
            onAdd={(center) => {
              console.log('Nouveau centre:', center);
              setShowAddCenter(false);
            }}
          />
        )}

        {selectedCenter && (
          <CenterDetailModal
            center={selectedCenter}
            onClose={() => setSelectedCenter(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default ElectionDetailView;
