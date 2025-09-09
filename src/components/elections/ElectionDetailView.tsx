
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
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
  const [centers, setCenters] = useState<Center[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les centres de vote pour cette élection
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('voting_centers')
          .select(`
            *,
            voting_bureaux(id, registered_voters)
          `)
          .eq('election_id', election.id)
          .order('name', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des centres:', error);
          return;
        }

        // Transformer les données Supabase en format Center
        const transformedCenters: Center[] = data?.map(center => {
          const totalVoters = center.voting_bureaux?.reduce((sum: number, bureau: any) => 
            sum + (bureau.registered_voters || 0), 0) || 0;
          
          return {
            id: center.id.toString(),
            name: center.name,
            address: center.address || '',
            responsable: center.contact_name || '',
            contact: center.contact_phone || '',
            bureaux: center.voting_bureaux?.length || 0,
            voters: totalVoters
          };
        }) || [];

        setCenters(transformedCenters);
      } catch (error) {
        console.error('Erreur lors du chargement des centres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [election.id]);

  // Charger les candidats pour cette élection
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { data, error } = await supabase
          .from('election_candidates')
          .select(`
            *,
            candidates(name, party, photo_url, is_priority),
            candidate_results(votes_received)
          `)
          .eq('election_id', election.id)
          .order('candidates(name)', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des candidats:', error);
          return;
        }

        // Transformer les données Supabase en format Candidate
        const transformedCandidates: Candidate[] = data?.map(electionCandidate => {
          const candidate = electionCandidate.candidates;
          const result = electionCandidate.candidate_results?.[0];
          
          return {
            id: electionCandidate.candidate_id.toString(),
            name: candidate?.name || '',
            party: candidate?.party || '',
            isOurCandidate: candidate?.is_priority || false,
            photo: candidate?.photo_url || '/placeholder.svg',
            votes: result?.votes_received || 0,
            percentage: 0 // Calculé dynamiquement si nécessaire
          };
        }) || [];

        setCandidates(transformedCandidates);
      } catch (error) {
        console.error('Erreur lors du chargement des candidats:', error);
      }
    };

    fetchCandidates();
  }, [election.id]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'À venir': return 'default';
      case 'En cours': return 'secondary';
      case 'Terminée': return 'outline';
      default: return 'default';
    }
  };

  const handleAddCenter = async (centerData: Omit<Center, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('voting_centers')
        .insert([{
          name: centerData.name,
          address: centerData.address,
          contact_name: centerData.responsable,
          contact_phone: centerData.contact,
          election_id: election.id,
          total_voters: centerData.voters,
          total_bureaux: centerData.bureaux
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout du centre:', error);
        return;
      }

      // Ajouter le nouveau centre à la liste locale
      const newCenter: Center = {
        ...centerData,
        id: data.id.toString()
      };
      setCenters([...centers, newCenter]);
      setShowAddCenter(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du centre:', error);
    }
  };

  const handleAddCandidate = async (candidateData: Omit<Candidate, 'id'>) => {
    try {
      // D'abord créer le candidat
      const { data: candidateResult, error: candidateError } = await supabase
        .from('candidates')
        .insert([{
          name: candidateData.name,
          party: candidateData.party,
          photo_url: candidateData.photo,
          is_priority: candidateData.isOurCandidate
        }])
        .select()
        .single();

      if (candidateError) {
        console.error('Erreur lors de l\'ajout du candidat:', candidateError);
        return;
      }

      // Ensuite l'associer à l'élection
      const { error: electionCandidateError } = await supabase
        .from('election_candidates')
        .insert([{
          election_id: election.id,
          candidate_id: candidateResult.id
        }]);

      if (electionCandidateError) {
        console.error('Erreur lors de l\'association candidat-élection:', electionCandidateError);
        return;
      }

      // Ajouter le nouveau candidat à la liste locale
      const newCandidate: Candidate = {
        ...candidateData,
        id: candidateResult.id.toString()
      };
      setCandidates([...candidates, newCandidate]);
      setShowAddCandidate(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du candidat:', error);
    }
  };

  const handleRemoveCenter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('voting_centers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du centre:', error);
        return;
      }

      setCenters(centers.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du centre:', error);
    }
  };

  const handleRemoveCandidate = async (id: string) => {
    try {
      // Supprimer l'association candidat-élection
      const { error: electionCandidateError } = await supabase
        .from('election_candidates')
        .delete()
        .eq('election_id', election.id)
        .eq('candidate_id', id);

      if (electionCandidateError) {
        console.error('Erreur lors de la suppression de l\'association:', electionCandidateError);
        return;
      }

      setCandidates(candidates.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du candidat:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails de l'élection...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
