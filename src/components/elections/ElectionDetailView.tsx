/* eslint-disable @typescript-eslint/no-explicit-any */

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
  const [statistics, setStatistics] = useState({
    totalVoters: 0,
    totalCenters: 0,
    totalBureaux: 0,
    totalCandidates: 0
  });

  // Charger les centres de vote pour cette élection (basés sur la localisation)
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        
        // D'abord récupérer les détails de l'élection pour avoir sa localisation
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('province_id, department_id, commune_id, arrondissement_id')
          .eq('id', election.id)
          .single();

        if (electionError) {
          console.error('Erreur lors du chargement de l\'élection:', electionError);
          setCenters([]);
          setLoading(false);
          return;
        }

        // Construire la requête basée sur la localisation de l'élection
        let query = supabase
          .from('voting_centers')
          .select(`
            *,
            voting_bureaux!center_id(id, name)
          `);

        // Filtrer par localisation si disponible
        if (electionData.arrondissement_id) {
          query = query.eq('arrondissement_id', electionData.arrondissement_id);
        } else if (electionData.commune_id) {
          query = query.eq('commune_id', electionData.commune_id);
        } else if (electionData.department_id) {
          query = query.eq('department_id', electionData.department_id);
        } else if (electionData.province_id) {
          query = query.eq('province_id', electionData.province_id);
        }

        const { data, error } = await query.order('name', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des centres:', error);
          setCenters([]);
          setLoading(false);
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
          .from('candidates')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des candidats:', error);
          setCandidates([]);
          return;
        }

        // Transformer les données Supabase en format Candidate
        const transformedCandidates: Candidate[] = data?.map(candidate => ({
          id: candidate.id.toString(),
          name: candidate.name || '',
          party: candidate.party || '',
          isOurCandidate: candidate.is_priority || false,
          photo: candidate.photo_url || '/placeholder.svg',
          votes: candidate.votes_received || 0,
          percentage: 0 // Calculé dynamiquement si nécessaire
        })) || [];

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
      const { data, error } = await supabase
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
        .select(`
          *,
          voting_bureaux!center_id(id, name)
        `)
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout du centre:', error);
        return;
      }

      // Transformer les données pour l'ajouter à la liste locale
      const newCenter: Center = {
        id: data.id.toString(),
        name: data.name,
        address: data.address || '',
        responsable: data.contact_name || '',
        contact: data.contact_phone || '',
        bureaux: 0, // Nouveau centre, pas encore de bureaux
        voters: 0   // Nouveau centre, pas encore d'électeurs
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails de l'élection...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header moderne avec gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gov-blue/5 via-gov-blue-light/5 to-purple-50 rounded-2xl p-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="hover:bg-white/50 transition-all duration-300 rounded-lg px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux élections
              </Button>
              <Badge 
                variant={getStatusVariant(election.status)}
                className="px-3 py-1 text-sm font-medium"
              >
                {election.status}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">{election.title}</h1>
                  <p className="text-sm text-gray-600 max-w-2xl">{election.description}</p>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Date du scrutin:</span> {new Date(election.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              {/* Statistiques compactes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-gov-blue rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gov-blue uppercase tracking-wide">Électeurs</span>
                  </div>
                  <div className="text-xl font-bold text-gov-blue">
                    {statistics.totalVoters.toLocaleString('fr-FR')}
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-green-500 rounded-lg">
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Centres</span>
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {statistics.totalCenters}
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-indigo-500 rounded-lg">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Bureaux</span>
                  </div>
                  <div className="text-xl font-bold text-indigo-900">
                    {statistics.totalBureaux}
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-purple-500 rounded-lg">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Candidats</span>
                  </div>
                  <div className="text-xl font-bold text-purple-900">
                    {statistics.totalCandidates}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content avec onglets modernisés */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-none">
              <TabsTrigger 
                value="info" 
                className="flex items-center space-x-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
              >
                <div className="p-1.5 bg-gov-blue/10 rounded-md data-[state=active]:bg-gov-blue transition-colors duration-300">
                  <Building className="w-4 h-4 text-gov-blue data-[state=active]:text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Informations</div>
                  <div className="text-xs text-gray-500">Détails généraux</div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="centers" 
                className="flex items-center space-x-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
              >
                <div className="p-1.5 bg-green-100 rounded-md data-[state=active]:bg-green-500 transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-green-600 data-[state=active]:text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Centres & Bureaux</div>
                  <div className="text-xs text-gray-500">Organisation territoriale</div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="candidates" 
                className="flex items-center space-x-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300"
              >
                <div className="p-1.5 bg-purple-100 rounded-md data-[state=active]:bg-purple-500 transition-colors duration-300">
                  <Users className="w-4 h-4 text-purple-600 data-[state=active]:text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Candidats</div>
                  <div className="text-xs text-gray-500">Liste des candidats</div>
                </div>
              </TabsTrigger>
            </TabsList>

          {/* Section Informations modernisée */}
          <TabsContent value="info" className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations générales */}
              <Card className="election-card group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-gov-blue/10 rounded-lg">
                      <Building className="w-5 h-5 text-gov-blue" />
                    </div>
                    Informations Générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type d'élection</label>
                      <p className="text-lg font-bold text-gray-900">{election.type}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</label>
                      <div className="mt-1">
                        <Badge 
                          variant={getStatusVariant(election.status)}
                          className="px-2 py-1 text-xs font-medium"
                        >
                          {election.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date du scrutin</label>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(election.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                    <p className="text-sm text-gray-700 leading-relaxed">{election.description || 'Aucune description'}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sièges à pourvoir</label>
                    <p className="text-xl font-bold text-gov-blue">{election.seatsAvailable}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Informations géographiques modernisées */}
              <Card className="election-card group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    Circonscription Électorale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Province</label>
                        <p className="text-sm font-bold text-gray-900 mt-1">{election.province || 'Non spécifiée'}</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Département</label>
                        <p className="text-sm font-bold text-gray-900 mt-1">{election.department || 'Non spécifié'}</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Commune</label>
                        <p className="text-sm font-bold text-gray-900 mt-1">{election.commune || 'Non spécifiée'}</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Arrondissement</label>
                        <p className="text-sm font-bold text-gray-900 mt-1">{election.arrondissement || 'Non spécifié'}</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs et budget modernisés */}
              {(election.budget > 0 || election.voteGoal > 0) && (
                <Card className="lg:col-span-2 election-card group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Star className="w-5 h-5 text-purple-600" />
                      </div>
                      Objectifs et Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {election.budget > 0 && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-200 rounded-full -translate-y-6 translate-x-6"></div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-purple-500 rounded-md">
                                <Star className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Budget alloué</span>
                            </div>
                            <div className="text-xl font-bold text-purple-900">
                              {election.budget.toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {election.voteGoal > 0 && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                          <div className="absolute top-0 right-0 w-12 h-12 bg-orange-200 rounded-full -translate-y-6 translate-x-6"></div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-orange-500 rounded-md">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">Objectif de voix</span>
                            </div>
                            <div className="text-xl font-bold text-orange-900">
                              {election.voteGoal.toLocaleString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              
            </div>
          </TabsContent>

          {/* Section Centres et Bureaux modernisée */}
          <TabsContent value="centers" className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Centres de Vote</h3>
                <p className="text-sm text-gray-600 mt-1">Gérez les centres de vote et leurs bureaux</p>
              </div>
              <Button 
                onClick={() => setShowAddCenter(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un centre
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {centers.map((center) => (
                <Card 
                  key={center.id} 
                  className="election-card group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md"
                  onClick={() => setSelectedCenter(center)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                          {center.name}
                        </CardTitle>
                        <p className="text-xs text-gray-600 line-clamp-2">{center.address}</p>
                      </div>
                      <div className="p-1.5 bg-green-100 rounded-md group-hover:bg-green-500 transition-colors duration-300">
                        <MapPin className="w-4 h-4 text-green-600 group-hover:text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600">Responsable:</span>
                      <span className="text-sm font-semibold text-gray-900">{center.responsable}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-lg font-bold text-orange-600">{center.bureaux}</div>
                        <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">Bureaux</div>
                      </div>
                      <div className="text-center p-3 bg-gov-blue/5 rounded-lg border border-gov-blue/20">
                        <div className="text-lg font-bold text-gov-blue">{center.voters.toLocaleString('fr-FR')}</div>
                        <div className="text-xs text-gov-blue font-medium uppercase tracking-wide">Électeurs</div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-white border-gray-200 text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-300 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Détails
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCenter(center.id);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Section Candidats modernisée */}
          <TabsContent value="candidates" className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Candidats Validés</h3>
                <p className="text-sm text-gray-600 mt-1">Gérez la liste des candidats à l'élection</p>
              </div>
              <Button 
                onClick={() => setShowAddCandidate(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un candidat
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((candidate) => (
                <Card 
                  key={candidate.id} 
                  className={`election-card group hover:shadow-xl transition-all duration-300 ${
                    candidate.isOurCandidate 
                      ? 'border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100' 
                      : 'border-0 shadow-md'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img 
                          src={candidate.photo || '/placeholder.svg'} 
                          alt={candidate.name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
                        />
                        {candidate.isOurCandidate && (
                          <div className="absolute -top-1 -right-1 p-0.5 bg-purple-500 rounded-full">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                              {candidate.name}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">{candidate.party}</p>
                          </div>
                          {candidate.isOurCandidate && (
                            <Badge className="bg-purple-500 text-white px-2 py-1 text-xs font-medium">
                              <Star className="w-3 h-3 mr-1" />
                              Notre Candidat
                            </Badge>
                          )}
                        </div>
                        
                        {candidate.votes && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">Voix obtenues</span>
                              <div className="text-right">
                                <div className="font-bold text-sm text-gray-900">
                                  {candidate.votes.toLocaleString('fr-FR')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ({candidate.percentage}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-1 pt-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 bg-white border-gray-200 text-gray-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Profil
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveCandidate(candidate.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                          >
                            <Trash2 className="w-3 h-3" />
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
        </div>

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
