
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Building2,
  Vote,
  Eye,
  ArrowRight,
  Plus,
  Star
} from 'lucide-react';
import ElectionWizard from '@/components/elections/ElectionWizard';
import ElectionDetailView from '@/components/elections/ElectionDetailView';

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  party: string;
  photo?: string;
  isOurCandidate: boolean;
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

const ElectionManagement = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  // Mock data for elections with the new structure
  const elections: Election[] = [
    {
      id: 1,
      name: "Législatives 2023 - Moanda",
      type: "Législatives",
      date: "2024-08-26",
      seatsToFill: 1,
      budget: 50000000,
      voteTarget: 8000,
      province: "Haut-Ogooué",
      department: "Lemboumbi-Leyou",
      commune: "Commune de Moanda",
      district: "1er Arrondissement",
      totalVoters: 15240,
      totalCenters: 12,
      totalBureaus: 48,
      candidates: [
        {
          id: 1,
          firstName: "Jean",
          lastName: "Doe",
          party: "Parti A",
          isOurCandidate: true
        },
        {
          id: 2,
          firstName: "Marie",
          lastName: "Dupont",
          party: "Parti B",
          isOurCandidate: false
        },
        {
          id: 3,
          firstName: "Paul",
          lastName: "Martin",
          party: "Parti C",
          isOurCandidate: false
        }
      ],
      status: "À venir"
    },
    {
      id: 2,
      name: "Municipales 2024 - Libreville",
      type: "Municipales",
      date: "2024-12-15",
      seatsToFill: 15,
      budget: 75000000,
      voteTarget: 25000,
      province: "Estuaire",
      department: "Komo-Mondah",
      commune: "Commune de Libreville",
      district: "Tous arrondissements",
      totalVoters: 89456,
      totalCenters: 28,
      totalBureaus: 112,
      candidates: [
        {
          id: 4,
          firstName: "Alice",
          lastName: "Johnson",
          party: "Liste A",
          isOurCandidate: true
        },
        {
          id: 5,
          firstName: "Bob",
          lastName: "Wilson",
          party: "Liste B",
          isOurCandidate: false
        }
      ],
      status: "En cours"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'À venir': return 'bg-blue-100 text-blue-800';
      case 'En cours': return 'bg-green-100 text-green-800';
      case 'Terminé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilElection = (date: string) => {
    const today = new Date();
    const electionDate = new Date(date);
    const diffTime = electionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `J-${diffDays}`;
    } else if (diffDays === 0) {
      return "Aujourd'hui";
    } else {
      return `J+${Math.abs(diffDays)}`;
    }
  };

  const handleElectionClick = (election: Election) => {
    setSelectedElection(election);
  };

  const handleElectionCreated = (newElection: Election) => {
    // In a real app, this would update the state or refetch data
    console.log('New election created:', newElection);
    setIsWizardOpen(false);
  };

  if (selectedElection) {
    return (
      <Layout>
        <ElectionDetailView 
          election={selectedElection} 
          onBack={() => setSelectedElection(null)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gov-gray">ÉLECTIONS</h1>
            <p className="text-gray-600 mt-2">
              Centre de gestion de toute la logistique électorale
            </p>
          </div>
          <Button 
            onClick={() => setIsWizardOpen(true)}
            className="gov-bg-primary hover:bg-gov-blue-dark text-white flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Configurer une nouvelle élection</span>
          </Button>
        </div>

        {/* Elections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {elections.map((election) => (
            <Card 
              key={election.id} 
              className="gov-card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-gov-blue"
              onClick={() => handleElectionClick(election)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gov-gray">
                    {election.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(election.status)}>
                      {election.status}
                    </Badge>
                    {election.status === 'À venir' && (
                      <Badge variant="outline" className="text-blue-600">
                        {getDaysUntilElection(election.date)}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {election.province} &gt; {election.department} &gt; {election.commune}, {election.district}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gov-blue" />
                    <span className="font-medium">
                      {new Date(election.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {election.totalVoters.toLocaleString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-500">Électeurs</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Vote className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {election.candidates.length}
                        </div>
                        <div className="text-xs text-gray-500">Candidats</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {election.totalCenters}
                        </div>
                        <div className="text-xs text-gray-500">Centres</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {election.totalBureaus}
                        </div>
                        <div className="text-xs text-gray-500">Bureaux</div>
                      </div>
                    </div>
                  </div>

                  {/* Our Candidate */}
                  {election.candidates.find(c => c.isOurCandidate) && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        Notre candidat: {election.candidates.find(c => c.isOurCandidate)?.firstName} {election.candidates.find(c => c.isOurCandidate)?.lastName}
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleElectionClick(election);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir les détails
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gov-card border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">{elections.length}</div>
                  <div className="text-sm text-gray-600">Élections Totales</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Vote className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {elections.filter(e => e.status === 'En cours').length}
                  </div>
                  <div className="text-sm text-gray-600">En Cours</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {elections.reduce((sum, e) => sum + e.totalVoters, 0).toLocaleString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-600">Total Électeurs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {elections.reduce((sum, e) => sum + e.totalCenters, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Centres</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Election Configuration Wizard */}
        <ElectionWizard 
          open={isWizardOpen} 
          onOpenChange={setIsWizardOpen}
          onElectionCreated={handleElectionCreated}
        />
      </div>
    </Layout>
  );
};

export default ElectionManagement;
