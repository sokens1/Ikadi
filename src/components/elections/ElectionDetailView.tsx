
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Building2, 
  Users, 
  Star, 
  Edit, 
  Trash2,
  MapPin,
  Calendar
} from 'lucide-react';
import AddCenterModal from './AddCenterModal';
import AddCandidateModal from './AddCandidateModal';
import CenterDetailModal from './CenterDetailModal';

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  party: string;
  photo?: string;
  isOurCandidate: boolean;
}

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

interface Election {
  id: number;
  name: string;
  type: string;
  date: string;
  seatsToFill: number;
  budget?: number;
  voteTarget?: number;
  province: string;
  department: string;
  commune: string;
  district: string;
  totalVoters: number;
  totalCenters: number;
  totalBureaus: number;
  candidates: Candidate[];
  status: 'À venir' | 'En cours' | 'Terminé';
}

interface ElectionDetailViewProps {
  election: Election;
  onBack: () => void;
}

const ElectionDetailView = ({ election, onBack }: ElectionDetailViewProps) => {
  const [isAddCenterModalOpen, setIsAddCenterModalOpen] = useState(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<VotingCenter | null>(null);
  
  // Mock data for voting centers
  const [votingCenters, setVotingCenters] = useState<VotingCenter[]>([
    {
      id: 1,
      name: "EPP de l'Alliance",
      address: "Quartier Alliance, Moanda",
      responsible: "Jean Dupont",
      contact: "+241 07 XX XX XX",
      bureaus: [
        { id: 1, number: "Bureau 01", voterCount: 350, president: "Marie Koffi" },
        { id: 2, number: "Bureau 02", voterCount: 345 },
        { id: 3, number: "Bureau 03", voterCount: 338, president: "Paul Mensah" },
        { id: 4, number: "Bureau 04", voterCount: 342 }
      ]
    },
    {
      id: 2,
      name: "Lycée Technique de Moanda",
      address: "Centre-ville, Moanda",
      responsible: "Alice Johnson",
      contact: "+241 07 YY YY YY",
      bureaus: [
        { id: 5, number: "Bureau 01", voterCount: 380 },
        { id: 6, number: "Bureau 02", voterCount: 375, president: "Bob Wilson" },
        { id: 7, number: "Bureau 03", voterCount: 362 }
      ]
    }
  ]);

  const [candidates, setCandidates] = useState<Candidate[]>(election.candidates);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'À venir': return 'bg-blue-100 text-blue-800';
      case 'En cours': return 'bg-green-100 text-green-800';
      case 'Terminé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddCenter = (centerData: any) => {
    const newCenter: VotingCenter = {
      id: Date.now(),
      ...centerData,
      bureaus: []
    };
    setVotingCenters([...votingCenters, newCenter]);
  };

  const handleAddCandidate = (candidateData: any) => {
    const newCandidate: Candidate = {
      id: Date.now(),
      ...candidateData
    };

    // If this is marked as our candidate, unmark others
    let updatedCandidates = candidates;
    if (candidateData.isOurCandidate) {
      updatedCandidates = updatedCandidates.map(c => ({ ...c, isOurCandidate: false }));
    }

    setCandidates([...updatedCandidates, newCandidate]);
  };

  const handleRemoveCandidate = (id: number) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const totalVotersInCenters = votingCenters.reduce((sum, center) => 
    sum + center.bureaus.reduce((centerSum, bureau) => centerSum + bureau.voterCount, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{election.name}</h1>
            <p className="text-gray-600">
              {election.province} &gt; {election.department} &gt; {election.commune}, {election.district}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(election.status)}>
          {election.status}
        </Badge>
      </div>

      {/* Election Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Date</div>
                <div className="text-sm text-gray-600">
                  {new Date(election.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Électeurs</div>
                <div className="text-sm text-gray-600">
                  {election.totalVoters.toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-medium">Centres</div>
                <div className="text-sm text-gray-600">{votingCenters.length}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium">Bureaux</div>
                <div className="text-sm text-gray-600">
                  {votingCenters.reduce((sum, center) => sum + center.bureaus.length, 0)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section A: Centres et Bureaux de Vote */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Centres et Bureaux de Vote</span>
              </CardTitle>
              <Button onClick={() => setIsAddCenterModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un centre
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {votingCenters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun centre de vote ajouté</p>
                <p className="text-sm">Cliquez sur "Ajouter un centre" pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {votingCenters.map((center) => (
                  <Card 
                    key={center.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCenter(center)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{center.name}</h3>
                        <Badge variant="outline">
                          {center.bureaus.length} bureau{center.bureaus.length > 1 ? 'x' : ''}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{center.address}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Responsable:</span> {center.responsible || 'Non assigné'}
                        </div>
                        <div>
                          <span className="font-medium">Électeurs:</span> {center.bureaus.reduce((sum, b) => sum + b.voterCount, 0)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <div><strong>Total:</strong> {votingCenters.length} centre{votingCenters.length > 1 ? 's' : ''}</div>
                    <div><strong>Bureaux:</strong> {votingCenters.reduce((sum, center) => sum + center.bureaus.length, 0)}</div>
                    <div><strong>Électeurs:</strong> {totalVotersInCenters.toLocaleString('fr-FR')}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section B: Candidats Concernés */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Candidats Concernés</span>
              </CardTitle>
              <Button onClick={() => setIsAddCandidateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un candidat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun candidat ajouté</p>
                <p className="text-sm">Cliquez sur "Ajouter un candidat" pour commencer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {candidate.isOurCandidate && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <Badge className="bg-yellow-100 text-yellow-800">Notre Candidat</Badge>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {candidate.firstName} {candidate.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{candidate.party}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveCandidate(candidate.id)}
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

      {/* Modals */}
      <AddCenterModal 
        open={isAddCenterModalOpen}
        onOpenChange={setIsAddCenterModalOpen}
        onAddCenter={handleAddCenter}
      />

      <AddCandidateModal 
        open={isAddCandidateModalOpen}
        onOpenChange={setIsAddCandidateModalOpen}
        onAddCandidate={handleAddCandidate}
        existingCandidates={candidates}
      />

      {selectedCenter && (
        <CenterDetailModal 
          center={selectedCenter}
          onClose={() => setSelectedCenter(null)}
          onUpdateCenter={(updatedCenter) => {
            setVotingCenters(centers => 
              centers.map(c => c.id === updatedCenter.id ? updatedCenter : c)
            );
            setSelectedCenter(updatedCenter);
          }}
        />
      )}
    </div>
  );
};

export default ElectionDetailView;
