import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useElectionState } from '@/hooks/useElectionState';
import { Election, CreateElectionData } from '@/types/elections';
import { validateCreateElection, formatValidationErrors } from '@/lib/validation/electionSchemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Building,
  Eye,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  X
} from 'lucide-react';
import ElectionWizard from '@/components/elections/ElectionWizard';
import ElectionDetailView from '@/components/elections/ElectionDetailView';
import { toast } from 'sonner';

const ElectionManagementUnified = () => {
  const {
    elections,
    selectedElection,
    loading,
    error,
    statistics,
    setLoading,
    setError,
    setElections,
    addElection,
    updateElection,
    deleteElection,
    setSelectedElection,
    setFilters,
    setSearchQuery,
  } = useElectionState();

  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Charger les élections depuis Supabase
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('elections')
          .select(`
            *,
            provinces(name),
            departments(name),
            communes(name),
            arrondissements(name)
          `)
          .order('election_date', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des élections:', error);
          setError('Erreur lors du chargement des élections');
          return;
        }

        // Transformer les données Supabase en format Election unifié
        const transformedElections: Election[] = data?.map(election => ({
          id: election.id.toString(),
          title: election.title,
          type: election.election_type || 'Législatives',
          status: election.status || 'À venir',
          date: new Date(election.election_date),
          description: election.description || '',
          location: {
            province: election.provinces?.name || '',
            department: election.departments?.name || '',
            commune: election.communes?.name || '',
            arrondissement: election.arrondissements?.name || '',
            fullAddress: `${election.communes?.name || ''}, ${election.departments?.name || ''}`,
          },
          configuration: {
            seatsAvailable: election.seats_available || 1,
            budget: election.budget || 0,
            voteGoal: election.vote_goal || 0,
            allowMultipleCandidates: true,
            requirePhotoValidation: false,
          },
          statistics: {
            totalVoters: election.registered_voters || 0,
            totalCandidates: election.candidates_count || 0,
            totalCenters: election.voting_centers_count || 0,
            totalBureaux: election.voting_bureaux_count || 0,
            completedSteps: 0,
            totalSteps: 5,
            progressPercentage: 0,
          },
          timeline: {
            created: new Date(election.created_at),
            configured: election.status === 'À venir' ? new Date(election.created_at) : null,
            started: election.status === 'En cours' ? new Date(election.election_date) : null,
            ended: election.status === 'Terminée' ? new Date(election.election_date) : null,
            published: null,
          },
          createdAt: new Date(election.created_at),
          updatedAt: new Date(election.updated_at),
          createdBy: election.created_by || 'system',
        })) || [];

        setElections(transformedElections);
      } catch (error) {
        console.error('Erreur lors du chargement des élections:', error);
        setError('Erreur lors du chargement des élections');
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [setLoading, setError, setElections]);

  // Mettre à jour les filtres dans le hook
  useEffect(() => {
    setSearchQuery(searchQuery);
    setFilters({
      status: statusFilter === 'all' ? undefined : [statusFilter as 'À venir' | 'En cours' | 'Terminée' | 'Annulée'],
      type: typeFilter === 'all' ? undefined : [typeFilter as 'Législatives' | 'Locales' | 'Présidentielle'],
    });
  }, [searchQuery, statusFilter, typeFilter, setSearchQuery, setFilters]);

  // Utiliser les élections filtrées du hook
  const filteredElections = elections.filter(election => {
    const matchesSearch = searchQuery === '' || 
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.location.commune.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.location.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.location.province.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || election.status === statusFilter;
    const matchesType = typeFilter === 'all' || election.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Fonction pour déterminer la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'en cours':
      case 'active':
        return 'success';
      case 'à venir':
      case 'programmée':
        return 'info';
      case 'préparation':
        return 'warning';
      case 'terminée':
      case 'completed':
        return 'neutral';
      case 'annulée':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusVariant = (color: string) => {
    switch (color) {
      case 'success':
        return 'default';
      case 'info':
        return 'secondary';
      case 'warning':
        return 'outline';
      case 'error':
        return 'destructive';
      case 'neutral':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleViewElection = (election: Election) => {
    setSelectedElection(election);
  };

  const handleCloseDetail = () => {
    setSelectedElection(null);
  };

  const handleCreateElection = async (electionData: CreateElectionData) => {
    try {
      // Validation des données
      const validation = validateCreateElection(electionData);
      if (!validation.success) {
        const errors = formatValidationErrors(validation.error);
        const errorMessages = Object.values(errors).flat();
        toast.error(`Erreurs de validation: ${errorMessages.join(', ')}`);
        return;
      }

      setLoading(true);

      // Préparer les données pour Supabase
      const supabaseData = {
        title: electionData.title,
        election_type: electionData.type,
        election_date: electionData.date,
        status: 'À venir',
        description: electionData.description || '',
        seats_available: electionData.configuration.seatsAvailable,
        budget: electionData.configuration.budget || 0,
        vote_goal: electionData.configuration.voteGoal || 0,
        // Note: Les relations géographiques seraient gérées séparément
      };

      const { data, error } = await supabase
        .from('elections')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'élection:', error);
        toast.error(`Erreur lors de la création: ${error.message}`);
        return;
      }

      // Créer l'objet Election complet
      const newElection: Election = {
        id: data.id.toString(),
        title: electionData.title,
        type: electionData.type,
        status: 'À venir',
        date: new Date(electionData.date),
        description: electionData.description,
        location: {
          ...electionData.location,
          fullAddress: `${electionData.location.commune}, ${electionData.location.department}`,
        },
        configuration: {
          ...electionData.configuration,
          allowMultipleCandidates: true,
          requirePhotoValidation: false,
        },
        statistics: {
          totalVoters: 0,
          totalCandidates: 0,
          totalCenters: 0,
          totalBureaux: 0,
          completedSteps: 1,
          totalSteps: 5,
          progressPercentage: 20,
        },
        timeline: {
          created: new Date(),
          configured: new Date(),
          started: null,
          ended: null,
          published: null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user', // À remplacer par l'ID de l'utilisateur connecté
      };

      addElection(newElection);
      setShowWizard(false);
      toast.success('Élection créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de l\'élection:', error);
      toast.error('Erreur lors de la création de l\'élection');
    } finally {
      setLoading(false);
    }
  };

  if (selectedElection) {
    // Adapter notre type Election vers le type attendu par ElectionDetailView
    const adaptedElection = {
      id: parseInt(selectedElection.id.replace(/\D/g, '')) || 1,
      title: selectedElection.title,
      date: selectedElection.date.toISOString().split('T')[0],
      status: selectedElection.status,
      description: selectedElection.description || '',
      voters: selectedElection.statistics.totalVoters,
      centers: selectedElection.statistics.totalCenters,
      candidates: selectedElection.statistics.totalCandidates,
      location: selectedElection.location.fullAddress,
      budget: selectedElection.configuration.budget || 0,
      voteGoal: selectedElection.configuration.voteGoal || 0,
      seatsAvailable: selectedElection.configuration.seatsAvailable,
      province: selectedElection.location.province,
      department: selectedElection.location.department,
      commune: selectedElection.location.commune,
      arrondissement: selectedElection.location.arrondissement,
    };

    return (
      <ElectionDetailView 
        election={adaptedElection as unknown as any} 
        onBack={handleCloseDetail}
      />
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des élections...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header avec statistiques */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <h1 className="heading-1 text-gray-900">Gestion des Élections</h1>
                <p className="body-large text-gray-600">
                  Gérez et supervisez toutes les élections du système
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setShowWizard(true)}
                  className="btn-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Plus className="h-5 w-5" />
                  Nouvelle Élection
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-secondary shadow-md hover:shadow-lg transition-all duration-300"
                  size="lg"
                  onClick={() => toast.info('Fonctionnalité d\'export en cours de développement')}
                >
                  <Download className="h-5 w-5" />
                  Exporter
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="election-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="caption text-gray-600 font-medium">Total Élections</p>
                  <p className="heading-2 text-blue-600">{statistics.total}</p>
                  <div className="w-12 h-1 bg-blue-200 rounded-full">
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="caption text-gray-600 font-medium">En Cours</p>
                  <p className="heading-2 text-green-600">{statistics.byStatus['En cours'] || 0}</p>
                  <div className="w-12 h-1 bg-green-200 rounded-full">
                    <div className="w-full h-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="caption text-gray-600 font-medium">À Venir</p>
                  <p className="heading-2 text-orange-600">{statistics.byStatus['À venir'] || 0}</p>
                  <div className="w-12 h-1 bg-orange-200 rounded-full">
                    <div className="w-full h-full bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="caption text-gray-600 font-medium">Terminées</p>
                  <p className="heading-2 text-gray-600">{statistics.byStatus['Terminée'] || 0}</p>
                  <div className="w-12 h-1 bg-gray-200 rounded-full">
                    <div className="w-full h-full bg-gray-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Building className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher une élection, une commune, un département..."
                  value={searchQuery}
                  onChange={(e) => setSearchQueryLocal(e.target.value)}
                  className="pl-12 pr-12 py-4 text-base border-0 focus:border-0 focus:ring-0 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQueryLocal('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 py-4 border-0 focus:border-0 focus:ring-0 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Tous les statuts" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="À venir">À venir</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Terminée">Terminée</SelectItem>
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48 py-4 border-0 focus:border-0 focus:ring-0 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Tous les types" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="Législatives">Législatives</SelectItem>
                  <SelectItem value="Locales">Locales</SelectItem>
                  <SelectItem value="Présidentielle">Présidentielle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Liste des élections */}
        {filteredElections.length === 0 ? (
          <Card className="election-card border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-100 rounded-full mb-6">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="heading-3 mb-2 text-gray-700">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Aucune élection trouvée' 
                  : 'Aucune élection trouvée'
                }
              </h3>
              <p className="body-regular text-gray-500 text-center mb-8 max-w-md">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Essayez de modifier vos critères de recherche pour trouver des élections correspondantes.'
                  : 'Commencez par créer votre première élection pour gérer le processus électoral.'
                }
              </p>
              <Button 
                onClick={() => setShowWizard(true)}
                className="btn-primary shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Créer une élection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="election-grid">
            {filteredElections.map((election) => (
              <Card 
                key={election.id} 
                className="election-card cursor-pointer"
                onClick={() => handleViewElection(election)}
              >
                <CardHeader className="election-card-header">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="heading-4 mb-3 line-clamp-2">
                        {election.title}
                      </CardTitle>
                      <Badge 
                        variant={getStatusVariant(getStatusColor(election.status))}
                        className="status-badge"
                      >
                        {election.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewElection(election);
                      }}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="election-card-content">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">
                          {election.date.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium line-clamp-1">{election.location.fullAddress}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                          <Users className="h-5 w-5" />
                          <span className="text-sm font-semibold">Électeurs</span>
                        </div>
                        <p className="heading-3 text-blue-700">
                          {election.statistics.totalVoters.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                          <Building className="h-5 w-5" />
                          <span className="text-sm font-semibold">Centres</span>
                        </div>
                        <p className="heading-3 text-green-700">
                          {election.statistics.totalCenters}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 py-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewElection(election);
                      }}
                    >
                      Voir les détails
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Election Wizard Modal */}
        {showWizard && (
          <ElectionWizard 
            onClose={() => setShowWizard(false)}
            onSubmit={handleCreateElection}
            onSuccess={() => {
              setShowWizard(false);
              toast.success('Élection créée avec succès');
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default ElectionManagementUnified;
