/* eslint-disable @typescript-eslint/no-explicit-any */
// Version améliorée avec table de liaison election_centers
// À utiliser après avoir exécuté le script create-election-centers-relation.sql

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

const ElectionDetailViewImproved: React.FC<ElectionDetailViewProps> = ({ election, onBack }) => {
  const [showAddCenter, setShowAddCenter] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalVoters: 0,
    totalCenters: 0,
    totalBureaux: 0,
    totalCandidates: 0
  });

  // Charger les centres de vote associés à cette élection via la table de liaison
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        
        // Requête avec jointure sur la table de liaison election_centers
        const { data, error } = await supabase
          .from('election_centers')
          .select(`
            voting_centers!center_id (
              *,
              voting_bureaux!center_id(id, name)
            )
          `)
          .eq('election_id', election.id)
          .order('voting_centers(name)', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des centres:', error);
          setCenters([]);
          setLoading(false);
          return;
        }

        // Transformer les données Supabase en format Center
        const transformedCenters: Center[] = data?.map(item => {
          const center = item.voting_centers;
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
            candidates!candidate_id (
              *,
              election_candidates!candidate_id(is_our_candidate)
            )
          `)
          .eq('election_id', election.id)
          .order('candidates(name)', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des candidats:', error);
          setCandidates([]);
          return;
        }

        // Transformer les données Supabase en format Candidate
        const transformedCandidates: Candidate[] = data?.map(item => {
          const candidate = item.candidates;
          return {
            id: candidate.id.toString(),
            name: candidate.name || '',
            party: candidate.party || '',
            isOurCandidate: item.is_our_candidate || false,
            photo: candidate.photo_url || '/placeholder.svg',
            votes: candidate.votes_received || 0,
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

  // Mettre à jour les statistiques quand les données changent
  useEffect(() => {
    const totalVoters = centers.reduce((sum, center) => sum + center.voters, 0);
    const totalBureaux = centers.reduce((sum, center) => sum + center.bureaux, 0);
    
    setStatistics({
      totalVoters: totalVoters || election.voters,
      totalCenters: centers.length || election.centers,
      totalBureaux: totalBureaux || election.bureaux,
      totalCandidates: candidates.length || election.candidates
    });
  }, [centers, candidates, election]);

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
      // Récupérer la localisation de l'élection courante
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('province_id, department_id, commune_id, arrondissement_id')
        .eq('id', election.id)
        .single();

      if (electionError) {
        console.error('Erreur lors de la récupération de l\'élection:', electionError);
        return;
      }

      // Créer le centre avec la même localisation que l'élection
      const { data: centerResult, error: centerError } = await supabase
        .from('voting_centers')
        .insert([{
          name: centerData.name,
          address: centerData.address,
          contact_name: centerData.responsable,
          contact_phone: centerData.contact,
          province_id: electionData.province_id,
          department_id: electionData.department_id,
          commune_id: electionData.commune_id,
          arrondissement_id: electionData.arrondissement_id
        }])
        .select()
        .single();

      if (centerError) {
        console.error('Erreur lors de l\'ajout du centre:', centerError);
        return;
      }

      // Associer le centre à l'élection via la table de liaison
      const { error: linkError } = await supabase
        .from('election_centers')
        .insert([{
          election_id: election.id,
          center_id: centerResult.id
        }]);

      if (linkError) {
        console.error('Erreur lors de l\'association centre-élection:', linkError);
        return;
      }

      // Ajouter le nouveau centre à la liste locale
      const newCenter: Center = {
        id: centerResult.id.toString(),
        name: centerResult.name,
        address: centerResult.address || '',
        responsable: centerResult.contact_name || '',
        contact: centerResult.contact_phone || '',
        bureaux: 0,
        voters: 0
      };

      setCenters(prev => [...prev, newCenter]);
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
          is_our_candidate: candidateData.isOurCandidate
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
          candidate_id: candidateResult.id,
          is_our_candidate: candidateData.isOurCandidate
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
      // Supprimer l'association centre-élection
      const { error: linkError } = await supabase
        .from('election_centers')
        .delete()
        .eq('election_id', election.id)
        .eq('center_id', id);

      if (linkError) {
        console.error('Erreur lors de la suppression de l\'association:', linkError);
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
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Informations</span>
            </TabsTrigger>
            <TabsTrigger value="centers" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Centres et Bureaux</span>
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Candidats</span>
            </TabsTrigger>
          </TabsList>

          {/* Section Informations - identique à la version originale */}
          <TabsContent value="info" className="space-y-6">
            {/* ... contenu identique à la version originale ... */}
          </TabsContent>

          {/* Section Centres et Bureaux */}
          <TabsContent value="centers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Centres de Vote Associés</h3>
              <Button onClick={() => setShowAddCenter(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un centre
              </Button>
            </div>

            {centers.length === 0 ? (
              <Card className="gov-card">
                <CardContent className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">Aucun centre de vote associé à cette élection</p>
                  <Button onClick={() => setShowAddCenter(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter le premier centre
                  </Button>
                </CardContent>
              </Card>
            ) : (
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
            )}
          </TabsContent>

          {/* Section Candidats - identique à la version originale */}
          <TabsContent value="candidates" className="space-y-6">
            {/* ... contenu identique à la version originale ... */}
          </TabsContent>
        </Tabs>

        {/* Modals - identiques à la version originale */}
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

export default ElectionDetailViewImproved;

