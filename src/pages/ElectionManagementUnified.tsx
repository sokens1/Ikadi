/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  X,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Copy,
  FileDown
} from 'lucide-react';
import ElectionWizard from '@/components/elections/ElectionWizard';
import ElectionDetailView from '@/components/elections/ElectionDetailView';
import EditElectionModal from '@/components/elections/EditElectionModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fonction utilitaire pour rafraîchir les données des élections
  const refreshElectionsData = useCallback(async () => {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des élections:', error);
        setError(error.message);
        return;
      }

      // Récupérer les compteurs de candidats et centres pour chaque élection
      const electionsWithCounts = await Promise.all(
        (data || []).map(async (election) => {
          // Compter les candidats
          const { data: candidatesData } = await supabase
            .from('election_candidates')
            .select('id')
            .eq('election_id', election.id);

          // Compter les centres
          const { data: centersData } = await supabase
            .from('election_centers')
            .select('id')
            .eq('election_id', election.id);

          return {
            ...election,
            candidates_count: candidatesData?.length || 0,
            centers_count: centersData?.length || 0
          };
        })
      );

      // Transformer les données Supabase en format Election unifié
      const transformedElections: Election[] = electionsWithCounts.map(election => {
        return {
          id: String(election.id),
          title: election.title,
          type: election.election_type || election.type || 'Législatives',
          status: election.status || 'À venir',
          date: new Date(election.election_date || election.created_at),
          description: election.description || '',
          location: {
            province: election.provinces?.name || election.province || '',
            department: election.departments?.name || election.department || '',
            commune: election.communes?.name || election.commune || '',
            arrondissement: election.arrondissements?.name || election.arrondissement || '',
            fullAddress: election.localisation || 
              `${election.communes?.name || election.commune || ''}, ${election.departments?.name || election.department || ''}` ||
              'Localisation non spécifiée',
          },
          configuration: {
            seatsAvailable: election.seats_available || 1,
            budget: election.budget || 0,
            voteGoal: election.vote_goal || 0,
            allowMultipleCandidates: true,
            requirePhotoValidation: false,
          },
          statistics: {
            totalVoters: election.nb_electeurs || election.registered_voters || 0,
            totalCandidates: election.candidates_count || 0,
            totalCenters: election.centers_count || 0,
            totalBureaux: election.voting_bureaux_count || 0,
            completedSteps: 0,
            totalSteps: 5,
            progressPercentage: 0,
          },
          timeline: {
            created: new Date(election.created_at),
            configured: election.status === 'À venir' ? new Date(election.created_at) : null,
            started: election.status === 'En cours' ? new Date(election.election_date || election.created_at) : null,
            ended: election.status === 'Terminée' ? new Date(election.election_date || election.created_at) : null,
            published: null,
          },
          createdAt: new Date(election.created_at),
          updatedAt: new Date(election.updated_at),
          createdBy: election.created_by || 'system',
        };
      });

      setElections(transformedElections);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setElections]);

  // Charger les élections depuis Supabase
  useEffect(() => {
    refreshElectionsData();
  }, [refreshElectionsData]);


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
      case 'à venir':
      case 'programmée':
        return 'gray';
      case 'en cours':
      case 'active':
        return 'orange';
      case 'terminée':
      case 'completed':
        return 'green';
      case 'annulée':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusVariant = (color: string) => {
    switch (color) {
      case 'gray':
        return 'secondary';
      case 'orange':
        return 'outline';
      case 'green':
        return 'default';
      case 'red':
        return 'destructive';
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

  const handleEditElection = (election: Election) => {
    setEditingElection(election);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingElection(null);
  };

  const handleUpdateElection = async (updatedData: Partial<Election>) => {
    if (!editingElection) return;

    try {
      setLoading(true);

      // Préparer les données pour Supabase (champs de base uniquement)
      const supabaseData = {
        title: updatedData.title,
        type: updatedData.type, // Utiliser 'type' au lieu de 'election_type'
        election_date: updatedData.date?.toISOString().split('T')[0],
        status: updatedData.status,
        description: updatedData.description || '',
        nb_electeurs: updatedData.statistics?.totalVoters,
      };

      console.log('Données à envoyer à Supabase:', supabaseData);
      console.log('ID de l\'élection à modifier:', editingElection.id);
      console.log('Type de l\'ID:', typeof editingElection.id);

      // Vérifier que l'ID existe et est valide
      if (!editingElection.id) {
        throw new Error('ID de l\'élection manquant');
      }

      // D'abord vérifier que l'élection existe
      const { data: existingElection, error: fetchError } = await supabase
        .from('elections')
        .select('id, title')
        .eq('id', editingElection.id)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la vérification de l\'élection:', fetchError);
        throw new Error(`Élection non trouvée: ${fetchError.message}`);
      }

      console.log('Élection trouvée:', existingElection);

      const { error } = await supabase
        .from('elections')
        .update(supabaseData)
        .eq('id', editingElection.id);

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'élection:', error);
        console.error('Détails de l\'erreur:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Essayer une approche alternative si l'erreur persiste
        console.log('Tentative d\'approche alternative...');
        
        // Essayer de mettre à jour seulement le titre d'abord
        const { error: simpleError } = await supabase
          .from('elections')
          .update({ title: updatedData.title })
          .eq('id', editingElection.id);
          
        if (simpleError) {
          console.error('Erreur même avec approche simple:', simpleError);
          toast.error(`Erreur lors de la modification: ${error.message}`);
          return;
        } else {
          console.log('Mise à jour simple réussie, tentative de mise à jour complète...');
          // Si la mise à jour simple fonctionne, essayer la mise à jour complète
          const { error: fullError } = await supabase
            .from('elections')
            .update(supabaseData)
            .eq('id', editingElection.id);
            
          if (fullError) {
            console.error('Erreur lors de la mise à jour complète:', fullError);
            toast.error(`Erreur lors de la modification: ${fullError.message}`);
            return;
          }
        }
      }

      // Recharger les données depuis la base de données
      await refreshElectionsData();
      
      setShowEditModal(false);
      setEditingElection(null);
      toast.success('Élection modifiée avec succès');
    } catch (error) {
      console.error('Erreur lors de la modification de l\'élection:', error);
      toast.error('Erreur lors de la modification de l\'élection');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (electionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette élection ?')) {
      try {
        setLoading(true);
        await deleteElection(electionId);
        toast.success('Élection supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de l\'élection');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDuplicateElection = (election: Election) => {
    const duplicatedElection = {
      ...election,
      id: crypto.randomUUID(),
      title: `${election.title} (Copie)`,
      status: 'À venir' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      addElection(duplicatedElection);
      toast.success('Élection dupliquée avec succès');
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      toast.error('Erreur lors de la duplication de l\'élection');
    }
  };

  const handleExportElection = (election: Election) => {
    const data = {
      title: election.title,
      type: election.type,
      date: election.date.toISOString(),
      status: election.status,
      location: election.location,
      statistics: election.statistics,
      configuration: election.configuration
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `election-${election.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Élection exportée avec succès');
  };

  const handleExportAllElections = () => {
    const data = {
      elections: filteredElections.map(election => ({
        title: election.title,
        type: election.type,
        date: election.date.toISOString(),
        status: election.status,
        location: election.location,
        statistics: election.statistics,
        configuration: election.configuration
      })),
      exportDate: new Date().toISOString(),
      totalElections: filteredElections.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elections-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredElections.length} élection(s) exportée(s) avec succès`);
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
        type: electionData.type, // Utiliser 'type' au lieu de 'election_type'
        election_date: electionData.date,
        status: 'À venir',
        description: electionData.description || '',
        seats_available: electionData.configuration.seatsAvailable,
        budget: electionData.configuration.budget ,
        vote_goal: electionData.configuration.voteGoal ,
        nb_electeurs: electionData.statistics?.totalVoters ,
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

      const electionId = String(data.id);

      // Lier les candidats à l'élection
      if (electionData.candidates && electionData.candidates.length > 0) {
        const candidateLinks = electionData.candidates.map(candidate => ({
          election_id: electionId,
          candidate_id: candidate.id,
          is_our_candidate: candidate.isOurCandidate || false
        }));

        console.log('Candidats à lier:', candidateLinks);

        const { error: candidateError } = await supabase
          .from('election_candidates')
          .insert(candidateLinks);

        if (candidateError) {
          console.error('Erreur lors de la liaison des candidats:', candidateError);
          toast.error('Erreur lors de la liaison des candidats');
        } else {
          console.log('Candidats liés avec succès');
        }
      } else {
        console.log('Aucun candidat à lier pour cette élection');
      }

      // Lier les centres à l'élection
      if (electionData.centers && electionData.centers.length > 0) {
        const centerLinks = electionData.centers.map(center => ({
          election_id: electionId,
          center_id: center.id
        }));

        console.log('Centres à lier:', centerLinks);

        const { error: centerError } = await supabase
          .from('election_centers')
          .insert(centerLinks);

        if (centerError) {
          console.error('Erreur lors de la liaison des centres:', centerError);
          toast.error('Erreur lors de la liaison des centres');
        } else {
          console.log('Centres liés avec succès');
        }
      } else {
        console.log('Aucun centre à lier pour cette élection');
      }

      // Créer l'objet Election complet
      const newElection: Election = {
        id: String(data.id),
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

      // Recharger les données depuis la base de données
      await refreshElectionsData();
      
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
    console.log('Élection sélectionnée pour la vue détaillée:', selectedElection);
    console.log('Données de localisation de l\'élection sélectionnée:', selectedElection.location);
    
    // Adapter notre type Election vers le type attendu par ElectionDetailView
    const adaptedElection = {
      id: selectedElection.id, // UUID direct
      title: selectedElection.title,
      date: selectedElection.date.toISOString().split('T')[0],
      status: selectedElection.status,
      description: selectedElection.description || `${selectedElection.location.commune}, ${selectedElection.location.department}, ${selectedElection.location.province}`,
      voters: selectedElection.statistics.totalVoters,
      centers: selectedElection.statistics.totalCenters,
      candidates: selectedElection.statistics.totalCandidates,
      location: selectedElection.location.fullAddress,
      type: selectedElection.type,
      budget: selectedElection.configuration.budget ,
      voteGoal: selectedElection.configuration.voteGoal ,
      seatsAvailable: selectedElection.configuration.seatsAvailable,
      province: selectedElection.location.province,
      department: selectedElection.location.department,
      commune: selectedElection.location.commune,
      arrondissement: selectedElection.location.arrondissement,
    };
    
    console.log('Élection adaptée pour ElectionDetailView:', adaptedElection);

    return (
      <ElectionDetailView 
        election={adaptedElection as any} 
        onBack={handleCloseDetail}
        onDataChange={refreshElectionsData}
      />
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-blue mx-auto mb-4"></div>
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
        <div className="relative overflow-hidden bg-gradient-to-r from-gov-blue/5 to-gov-blue-light/5 rounded-2xl p-8 mb-8">
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
                {/* <Button 
                  variant="outline" 
                  className="btn-secondary shadow-md hover:shadow-lg transition-all duration-300"
                  size="lg"
                  onClick={handleExportAllElections}
                >
                  <Download className="h-5 w-5" />
                  Exporter
                </Button> */}
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
                  <p className="heading-2 text-gov-blue">{statistics.total}</p>
                  <div className="w-12 h-1 bg-gov-blue/20 rounded-full">
                    <div className="w-full h-full bg-gov-blue rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-gov-blue/10 rounded-full">
                  <Calendar className="h-8 w-8 text-gov-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="caption text-gray-600 font-medium">En Cours</p>
                  <p className="heading-2 text-orange-600">{statistics.byStatus['En cours'] || 0}</p>
                  <div className="w-12 h-1 bg-orange-200 rounded-full">
                    <div className="w-full h-full bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="caption text-gray-600 font-medium">À Venir</p>
                  <p className="heading-2 text-gray-600">{statistics.byStatus['À venir'] || 0}</p>
                  <div className="w-12 h-1 bg-gray-200 rounded-full">
                    <div className="w-full h-full bg-gray-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Calendar className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="caption text-gray-600 font-medium">Terminées</p>
                  <p className="heading-2 text-green-600">{statistics.byStatus['Terminée'] || 0}</p>
                  <div className="w-12 h-1 bg-green-200 rounded-full">
                    <div className="w-full h-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Building className="h-8 w-8 text-green-600" />
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors",
                  viewMode === 'grid' && "bg-gov-blue/10 text-gov-blue hover:bg-gov-blue/20"
                )}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors",
                  viewMode === 'list' && "bg-gov-blue/10 text-gov-blue hover:bg-gov-blue/20"
                )}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
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
          viewMode === 'grid' ? (
            <div className="election-grid">
              {filteredElections.map((election) => (
                <Card 
                  key={election.id} 
                  className="election-card group hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="election-card-header">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="heading-4 group-hover:text-primary-blue mb-3 line-clamp-2">
                          {election.title}
                        </CardTitle>
                        <Badge 
                          variant={getStatusVariant(getStatusColor(election.status))}
                          className="status-badge"
                          data-status={getStatusColor(election.status)}
                        >
                          {election.status}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewElection(election); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditElection(election); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateElection(election); }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Dupliquer
                          </DropdownMenuItem> */}
                          {/* <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleExportElection(election); }}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Exporter
                          </DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleDeleteElection(election.id); }} 
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="election-card-content">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="p-2 bg-gov-blue/10 rounded-lg">
                            <Calendar className="h-4 w-4 text-gov-blue" />
                          </div>
                          <span className="font-medium">
                            {election.date ? election.date.toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Date non définie'}
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
                        <div className="text-center p-3 bg-gov-blue/5 rounded-lg">
                          <div className="flex items-center justify-center gap-2 text-gov-blue mb-2">
                            <Users className="h-5 w-5" />
                            <span className="text-sm font-semibold">Électeurs</span>
                          </div>
                          <p className="heading-3 text-gov-blue">
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
                        className="w-full flex items-center justify-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue hover:shadow-md transition-all duration-300 py-3 group-hover:bg-gov-blue group-hover:text-white group-hover:border-gov-blue group-hover:shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewElection(election);
                        }}
                      >
                        Voir les détails
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredElections.map((election) => (
                <Card
                  key={election.id}
                  className="election-card group hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row items-center justify-between p-4 md:p-6"
                >
                  <div className="flex-1 min-w-0 mb-4 md:mb-0 md:mr-6">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="heading-5 group-hover:text-primary-blue line-clamp-1 flex-1">
                        {election.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 ml-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewElection(election); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditElection(election); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateElection(election); }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleExportElection(election); }}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Exporter
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleDeleteElection(election.id); }} 
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge
                      variant={getStatusVariant(getStatusColor(election.status))}
                      className="status-badge"
                      data-status={getStatusColor(election.status)}
                    >
                      {election.status}
                    </Badge>
                    <div className="flex items-center text-gray-600 body-small mt-2">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{election.date ? election.date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date non définie'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 body-small mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{election.location.fullAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-gray-700 body-small mb-4 md:mb-0 md:mr-6">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gov-blue" />
                      <span>{election.statistics.totalVoters.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-green-500" />
                      <span>{election.statistics.totalCenters}</span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue hover:shadow-md transition-all duration-300 py-3 group-hover:bg-gov-blue group-hover:text-white group-hover:border-gov-blue group-hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewElection(election);
                      }}
                    >
                      Voir les détails
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
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

        {/* Edit Election Modal */}
        {showEditModal && editingElection && (
          <EditElectionModal
            election={editingElection}
            onClose={handleCloseEditModal}
            onUpdate={handleUpdateElection}
          />
        )}
      </div>
    </Layout>
  );
};

export default ElectionManagementUnified;
