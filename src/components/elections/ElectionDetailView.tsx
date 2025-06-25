
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  MapPin,
  Users,
  Building,
  Plus,
  Star,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import AddCenterModal from './AddCenterModal';
import AddCandidateModal from './AddCandidateModal';
import CenterDetailModal from './CenterDetailModal';

interface Election {
  id: number;
  title: string;
  date: string;
  status: string;
  description: string;
  voters: number;
  candidates: number;
  centers: number;
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

interface Center {
  id: string;
  name: string;
  address: string;
  responsable: string;
  contact: string;
  bureaux: number;
  voters: number;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  isOurCandidate: boolean;
  photo?: string;
  votes?: number;
  percentage?: number;
}

interface ElectionDetailViewProps {
  election: Election;
  onBack: () => void;
}

const ElectionDetailView: React.FC<ElectionDetailViewProps> = ({ election, onBack }) => {
  const [showAddCenter, setShowAddCenter] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  
  const [centers, setCenters] = useState<Center[]>([
    {
      id: '1',
      name: 'EPP de l\'Alliance',
      address: 'Quartier Alliance, Moanda',
      responsable: 'Jean-Pierre NZENG',
      contact: '+241 07 XX XX XX',
      bureaux: 4,
      voters: 1420
    },
    {
      id: '2',
      name: 'Lycée Technique de Moanda',
      address: 'Centre-ville, Moanda',
      responsable: 'Marie OBIANG',
      contact: '+241 07 XX XX XX',
      bureaux: 6,
      voters: 2180
    },
    {
      id: '3',
      name: 'Centre Culturel Municipal',
      address: 'Place de l\'Indépendance, Moanda',
      responsable: 'Paul EDOU',
      contact: '+241 07 XX XX XX',
      bureaux: 3,
      voters: 1050
    }
  ]);

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Dr. Antoine MBA',
      party: 'Parti Démocratique Gabonais',
      isOurCandidate: true,
      photo: '/placeholder.svg',
      votes: 4567,
      percentage: 35.2
    },
    {
      id: '2',
      name: 'Marie-Claire ONDO',
      party: 'Union Nationale',
      isOurCandidate: false,
      photo: '/placeholder.svg',
      votes: 3890,
      percentage: 30.1
    },
    {
      id: '3',
      name: 'François ENGONGA',
      party: 'Rassemblement pour le Gabon',
      isOurCandidate: false,
      photo: '/placeholder.svg',
      votes: 2845,
      percentage: 22.0
    },
    {
      id: '4',
      name: 'Sylvie BOUANGA',
      party: 'Coalition Nouvelle République',
      isOurCandidate: false,
      photo: '/placeholder.svg',
      votes: 1628,
      percentage: 12.7
    }
  ]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'À venir': return 'default';
      case 'En cours': return 'secondary';
      case 'Terminée': return 'outline';
      default: return 'default';
    }
  };

  const handleAddCenter = (centerData: Omit<Center, 'id'>) => {
    const newCenter: Center = {
      ...centerData,
      id: Date.now().toString()
    };
    setCenters([...centers, newCenter]);
    setShowAddCenter(false);
  };

  const handleAddCandidate = (candidateData: Omit<Candidate, 'id'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString()
    };
    setCandidates([...candidates, newCandidate]);
    setShowAddCandidate(false);
  };

  const handleRemoveCenter = (id: string) => {
    setCenters(centers.filter(c => c.id !== id));
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gov-gray">{election.title}</h1>
              <p className="text-gray-600 mt-1">{election.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={getStatusVariant(election.status)}>{election.status}</Badge>
                <span className="text-sm text-gray-500">
                  {new Date(election.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gov-card border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Électeurs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {election.voters.toLocaleString('fr-FR')}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Candidats</p>
                  <p className="text-2xl font-bold text-green-600">{candidates.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Centres de Vote</p>
                  <p className="text-2xl font-bold text-orange-600">{centers.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bureaux de Vote</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {centers.reduce((sum, center) => sum + center.bureaux, 0)}
                  </p>
                </div>
                <Building className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="centers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="centers" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Centres et Bureaux de Vote</span>
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Candidats Concernés</span>
            </TabsTrigger>
          </TabsList>

          {/* Section A: Centres et Bureaux */}
          <TabsContent value="centers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Centres de Vote</h3>
              <Button onClick={() => setShowAddCenter(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un centre
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {centers.map((center) => (
                <Card 
                  key={center.id} 
                  className="gov-card hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCenter(center)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{center.name}</CardTitle>
                    <p className="text-sm text-gray-600">{center.address}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Responsable:</span>
                        <span className="font-medium">{center.responsable}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{center.bureaux}</div>
                          <div className="text-xs text-gray-500">Bureaux</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{center.voters}</div>
                          <div className="text-xs text-gray-500">Électeurs</div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Détails
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCenter(center.id);
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Section B: Candidats */}
          <TabsContent value="candidates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Candidats Validés</h3>
              <Button onClick={() => setShowAddCandidate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un candidat
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((candidate) => (
                <Card 
                  key={candidate.id} 
                  className={`gov-card ${candidate.isOurCandidate ? 'border-2 border-gov-blue bg-blue-50' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={candidate.photo || '/placeholder.svg'} 
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{candidate.name}</h3>
                          {candidate.isOurCandidate && (
                            <Badge className="bg-gov-blue text-white">
                              <Star className="w-3 h-3 mr-1" />
                              Notre Candidat
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{candidate.party}</p>
                        
                        {candidate.votes && (
                          <div className="text-sm mb-2">
                            <span className="font-medium">{candidate.votes.toLocaleString('fr-FR')} voix</span>
                            <span className="text-gray-500 ml-2">({candidate.percentage}%)</span>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Profil
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveCandidate(candidate.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showAddCenter && (
          <AddCenterModal
            onClose={() => setShowAddCenter(false)}
            onSubmit={handleAddCenter}
          />
        )}

        {showAddCandidate && (
          <AddCandidateModal
            onClose={() => setShowAddCandidate(false)}
            onSubmit={handleAddCandidate}
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
