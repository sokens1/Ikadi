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

  // Fonction pour recalculer automatiquement le nombre d'électeurs d'une élection
  const recalculateElectionVoters = useCallback(async (electionId: string) => {
    try {
      // Récupérer les centres liés à cette élection
      const { data: centersData } = await supabase
        .from('election_centers')
        .select(`
          voting_centers (
            id,
            voting_bureaux (
              registered_voters
            )
          )
        `)
        .eq('election_id', electionId);

      let totalElecteurs = 0;
      
      if (centersData) {
        centersData.forEach(center => {
          if (center.voting_centers) {
            const votersCount = center.voting_centers.voting_bureaux?.reduce((sum: number, bureau: any) => 
              sum + (bureau.registered_voters || 0), 0) || 0;
            totalElecteurs += votersCount;
          }
        });
      }

      // Mettre à jour la colonne nb_electeurs
      const { error: updateError } = await supabase
        .from('elections')
        .update({ 
          nb_electeurs: totalElecteurs,
          updated_at: new Date().toISOString()
        })
        .eq('id', electionId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour nb_electeurs:', updateError);
        throw updateError;
      }

      console.log(`Recalcul automatique nb_electeurs pour élection ${electionId}: ${totalElecteurs}`);
      return totalElecteurs;
    } catch (error) {
      console.error('Erreur lors du recalcul des électeurs:', error);
      throw error;
    }
  }, []);

  // Fonction utilitaire pour rafraîchir les données des élections
  const refreshElectionsData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des élections:', error);
        setError(error.message);
        return;
      }

      // Récupérer les compteurs de candidats, centres et bureaux pour chaque élection
      const electionsWithCounts = await Promise.all(
        (data || []).map(async (election) => {
          // Récupérer les candidats liés
          const { data: candidatesData } = await supabase
            .from('election_candidates')
            .select('id')
            .eq('election_id', election.id);

          // Récupérer les centres liés avec leurs bureaux pour calculer les vrais totaux
          const { data: centersData } = await supabase
            .from('election_centers')
            .select(`
              id,
              voting_centers(
                id,
                voting_bureaux!center_id(id, registered_voters)
              )
            `)
            .eq('election_id', election.id);

          // Calculer le total des bureaux et électeurs en temps réel
          let totalBureaux = 0;
          let totalElecteurs = 0;
          
          if (centersData) {
            centersData.forEach(center => {
              if (center.voting_centers) {
                // Compter les bureaux réels
                const bureauxCount = center.voting_centers.voting_bureaux?.length || 0;
                totalBureaux += bureauxCount;
                
                // Calculer les électeurs réels à partir des bureaux
                const votersCount = center.voting_centers.voting_bureaux?.reduce((sum: number, bureau: any) => 
                  sum + (bureau.registered_voters || 0), 0) || 0;
                totalElecteurs += votersCount;
              }
            });
          }

          console.log(`Élection ${election.title}:`, {
            centers_count: centersData?.length || 0,
            totalBureaux,
            totalElecteurs,
            centersData: centersData?.map(c => ({
              id: c.id,
              voting_centers: c.voting_centers
            }))
          });

          // Mettre à jour automatiquement la colonne nb_electeurs dans la table elections
          if (totalElecteurs !== election.nb_electeurs) {
            try {
              await supabase
                .from('elections')
                .update({ 
                  nb_electeurs: totalElecteurs,
                  updated_at: new Date().toISOString()
                })
                .eq('id', election.id);
              
              console.log(`Mise à jour automatique nb_electeurs pour ${election.title}: ${totalElecteurs}`);
            } catch (updateError) {
              console.error(`Erreur lors de la mise à jour nb_electeurs pour ${election.title}:`, updateError);
            }
          }

          return {
            ...election,
            candidates_count: candidatesData?.length || 0,
            centers_count: centersData?.length || 0,
            voting_bureaux_count: totalBureaux,
            nb_electeurs: totalElecteurs
          };
        })
      );

      // Recalculer automatiquement le nombre d'électeurs pour toutes les élections
      // pour s'assurer que la colonne nb_electeurs est synchronisée
      try {
        await Promise.all(
          electionsWithCounts.map(async (election) => {
            try {
              await recalculateElectionVoters(election.id);
            } catch (error) {
              console.warn(`Erreur lors du recalcul pour l'élection ${election.title}:`, error);
            }
          })
        );
        console.log('Recalcul automatique effectué pour toutes les élections');
      } catch (error) {
        console.warn('Erreur lors du recalcul global des électeurs:', error);
      }

      // Transformer les données Supabase en format Election unifié
      const transformedElections: Election[] = electionsWithCounts.map(election => {
        console.log('Données de localisation pour l\'élection:', election.title, {
          province_name: election.province_name,
          commune_name: election.commune_name,
          arrondissement_name: election.arrondissement_name,
          province: election.province,
          commune: election.commune,
          arrondissement: election.arrondissement
        });
        return {
          id: String(election.id),
          title: election.title,
          type: election.election_type || election.type || 'Législatives',
          status: election.status || 'À venir',
          date: new Date(election.election_date || election.created_at),
          description: election.description || '',
          location: {
            province: election.province_name || election.province || 'Haut-Ogooué',
            commune: election.commune_name || election.commune || 'Moanda',
            arrondissement: election.arrondissement_name || election.arrondissement || '1er Arrondissement',
            fullAddress: election.localisation || 
              `${election.commune_name || election.commune || 'Moanda'}, ${election.province_name || election.province || 'Haut-Ogooué'}` ||
              'Moanda, Haut-Ogooué',
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
      type: typeFilter === 'all' ? undefined : [typeFilter as 'Législatives' | 'Locales'],
    });
  }, [searchQuery, statusFilter, typeFilter, setSearchQuery, setFilters]);

  // Utiliser les élections filtrées du hook
  const filteredElections = elections.filter(election => {
    const matchesSearch = searchQuery === '' || 
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.location.commune.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleCloseDetail = async () => {
    setSelectedElection(null);
    // Rafraîchir les données pour s'assurer que les cartes sont à jour
    await refreshElectionsData();
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

      // Recalculer automatiquement le nombre d'électeurs après modification
      try {
        await recalculateElectionVoters(editingElection.id);
        console.log('Recalcul automatique des électeurs effectué');
      } catch (recalcError) {
        console.warn('Erreur lors du recalcul automatique des électeurs:', recalcError);
        // Ne pas bloquer la modification si le recalcul échoue
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
      console.log('Validation des données d\'élection:', electionData);
      console.log('Structure des données reçues:', {
        hasLocation: !!electionData.location,
        hasConfiguration: !!electionData.configuration,
        hasStatistics: !!electionData.statistics,
        directProps: {
          province: (electionData as any).province,
          commune: (electionData as any).commune,
          seatsAvailable: (electionData as any).seatsAvailable,
          totalVoters: (electionData as any).totalVoters
        }
      });
      
      // Validation des données
      const validation = validateCreateElection(electionData);
      console.log('Résultat de la validation:', validation);
      
      if (!validation.success) {
        const errors = formatValidationErrors(validation.error);
        console.log('Erreurs de validation détaillées:', errors);
        const errorMessages = Object.values(errors).flat();
        toast.error(`Erreurs de validation: ${errorMessages.join(', ')}`);
        return;
      }

      setLoading(true);

      // Récupérer les IDs des localisations
      console.log('🔍 Récupération des IDs de localisation...');
      
      const provinceName = (electionData as any).province || electionData.location?.province || '';
      const communeName = (electionData as any).commune || electionData.location?.commune || '';
      const arrondissementName = (electionData as any).arrondissement || electionData.location?.arrondissement || '';

      console.log('📍 Noms de localisation:', { provinceName, communeName, arrondissementName });

      // Récupérer l'ID de la province
      const { data: provinceData } = await supabase
        .from('provinces')
        .select('id')
        .eq('name', provinceName)
        .single();

      // Récupérer l'ID de la commune
      const { data: communeData } = await supabase
        .from('communes')
        .select('id')
        .eq('name', communeName)
        .single();

      // Récupérer l'ID de l'arrondissement
      const { data: arrondissementData } = await supabase
        .from('arrondissements')
        .select('id')
        .eq('name', arrondissementName)
        .single();

      console.log('🆔 IDs récupérés:', {
        provinceId: provinceData?.id,
        communeId: communeData?.id,
        arrondissementId: arrondissementData?.id
      });

      // Récupérer l'utilisateur authentifié pour filled created_by si UUID requis
      let createdBy: string | null = null;
      try {
        const { data: auth } = await supabase.auth.getUser();
        createdBy = auth?.user?.id ?? null;
        console.log('👤 Utilisateur authentifié (created_by):', createdBy);
      } catch (e) {
        console.warn('Impossible de récupérer l\'utilisateur authentifié, created_by sera null');
      }

      // Préparer les données pour Supabase
      const supabaseData = {
        title: (electionData as any).name || electionData.title,
        type: electionData.type,
        election_date: electionData.date,
        status: 'À venir',
        description: electionData.description || '',
        province_id: provinceData?.id || null,
        commune_id: communeData?.id || null,
        arrondissement_id: arrondissementData?.id || null,
        seats_available: (electionData as any).seatsAvailable || electionData.configuration?.seatsAvailable || 1,
        budget: (electionData as any).budget || electionData.configuration?.budget || 0,
        vote_goal: (electionData as any).voteGoal || electionData.configuration?.voteGoal || 0,
        nb_electeurs: (electionData as any).totalVoters || electionData.statistics?.totalVoters || 0,
        ...(createdBy ? { created_by: createdBy } : {}),
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
      const candidates = (electionData as any).candidates || electionData.candidates || [];
      console.log('👥 Candidats reçus:', candidates);
      
      if (candidates && candidates.length > 0) {
        const candidateLinks = candidates.map((candidate: any) => ({
          election_id: electionId,
          candidate_id: candidate.identifiant || candidate.id,
          is_our_candidate: candidate.est_notre_candidat || candidate.isOurCandidate || false
        }));

        console.log('🔗 Liens candidats à créer:', candidateLinks);

        const { error: candidateError } = await supabase
          .from('election_candidates')
          .insert(candidateLinks);

        if (candidateError) {
          console.error('❌ Erreur lors de la liaison des candidats:', candidateError);
          toast.error('Erreur lors de la liaison des candidats');
        } else {
          console.log('✅ Candidats liés avec succès');
        }
      } else {
        console.log('ℹ️ Aucun candidat à lier pour cette élection');
      }

      // Lier les centres à l'élection
      const centers = (electionData as any).centers || electionData.centers || [];
      console.log('🏢 Centres reçus:', centers);
      
      if (centers && centers.length > 0) {
        const centerLinks = centers.map((center: any) => ({
          election_id: electionId,
          center_id: center.identifiant || center.id
        }));

        console.log('🔗 Liens centres à créer:', centerLinks);

        const { error: centerError } = await supabase
          .from('election_centers')
          .insert(centerLinks);

        if (centerError) {
          console.error('❌ Erreur lors de la liaison des centres:', centerError);
          toast.error('Erreur lors de la liaison des centres');
        } else {
          console.log('✅ Centres liés avec succès');
        }
      } else {
        console.log('ℹ️ Aucun centre à lier pour cette élection');
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
          province: (electionData as any).province || electionData.location?.province || '',
          commune: (electionData as any).commune || electionData.location?.commune || '',
          arrondissement: (electionData as any).arrondissement || electionData.location?.arrondissement || '',
          fullAddress: `${(electionData as any).commune || electionData.location?.commune || ''}, ${(electionData as any).province || electionData.location?.province || ''}`,
        },
        configuration: {
          seatsAvailable: (electionData as any).seatsAvailable || electionData.configuration?.seatsAvailable || 1,
          budget: (electionData as any).budget || electionData.configuration?.budget || 0,
          voteGoal: (electionData as any).voteGoal || electionData.configuration?.voteGoal || 0,
          allowMultipleCandidates: true,
          requirePhotoValidation: false,
        },
        statistics: ({
          totalVoters: Number((electionData as any).totalVoters) || electionData.statistics?.totalVoters || 0,
          totalCandidates: Number((electionData as any).totalCandidates) || 0,
          totalCenters: Number((electionData as any).totalCenters) || 0,
          totalBureaux: Number((electionData as any).totalBureaux) || 0,
          completedSteps: 1,
          totalSteps: 5,
          progressPercentage: 20,
        } as any),
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

      // Recalculer automatiquement le nombre d'électeurs après création
      try {
        await recalculateElectionVoters(electionId);
        console.log('Recalcul automatique des électeurs effectué après création');
      } catch (recalcError) {
        console.warn('Erreur lors du recalcul automatique des électeurs après création:', recalcError);
        // Ne pas bloquer la création si le recalcul échoue
      }

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
      description: selectedElection.description || `${selectedElection.location.commune}, ${selectedElection.location.province}`,
      voters: selectedElection.statistics.totalVoters,
      centers: selectedElection.statistics.totalCenters,
      candidates: selectedElection.statistics.totalCandidates,
      location: selectedElection.location.fullAddress,
      type: selectedElection.type,
      budget: selectedElection.configuration.budget ,
      voteGoal: selectedElection.configuration.voteGoal ,
      seatsAvailable: selectedElection.configuration.seatsAvailable,
      province: selectedElection.location.province,
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
        {/* Header avec statistiques - Mobile First */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gov-blue/5 to-gov-blue-light/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">Gestion des Élections</h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                  Gérez et supervisez toutes les élections du système
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full">
                <Button 
                  onClick={() => setShowWizard(true)}
                  className="btn-primary shadow-lg hover:shadow-xl transition-all duration-300 w-full xs:w-auto text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                  size="lg"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden xs:inline">Nouvelle Élection</span>
                  <span className="xs:hidden">Nouvelle</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides - Mobile First */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="election-card">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Total Élections</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gov-blue">{statistics.total}</p>
                  <div className="w-8 sm:w-10 lg:w-12 h-1 bg-gov-blue/20 rounded-full">
                    <div className="w-full h-full bg-gov-blue rounded-full"></div>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-gov-blue/10 rounded-full flex-shrink-0 ml-2">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-gov-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">En Cours</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{statistics.byStatus['En cours'] || 0}</p>
                  <div className="w-8 sm:w-10 lg:w-12 h-1 bg-orange-200 rounded-full">
                    <div className="w-full h-full bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0 ml-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">À Venir</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-600">{statistics.byStatus['À venir'] || 0}</p>
                  <div className="w-8 sm:w-10 lg:w-12 h-1 bg-gray-200 rounded-full">
                    <div className="w-full h-full bg-gray-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-gray-100 rounded-full flex-shrink-0 ml-2">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="election-card">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Terminées</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{statistics.byStatus['Terminée'] || 0}</p>
                  <div className="w-8 sm:w-10 lg:w-12 h-1 bg-green-200 rounded-full">
                    <div className="w-full h-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche - Mobile First */}
        <div className="bg-aqua-50 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                placeholder="Rechercher une élection..."
                value={searchQuery}
                onChange={(e) => setSearchQueryLocal(e.target.value)}
                className="pl-10 pr-10 py-3 sm:py-4 text-sm sm:text-base border-0 focus:border-0 focus:ring-0 rounded-lg sm:rounded-xl bg-gray-50 focus:bg-white transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQueryLocal('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Filtres et contrôles */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full xs:w-auto py-3 sm:py-4 border-0 focus:border-0 focus:ring-0 rounded-lg sm:rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 text-sm sm:text-base">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Statut" />
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
                  <SelectTrigger className="w-full xs:w-auto py-3 sm:py-4 border-0 focus:border-0 focus:ring-0 rounded-lg sm:rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 text-sm sm:text-base">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Législatives">Législatives</SelectItem>
                    <SelectItem value="Locales">Locales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Boutons de vue */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors",
                    viewMode === 'grid' && "bg-gov-blue/10 text-gov-blue hover:bg-gov-blue/20"
                  )}
                >
                  <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors",
                    viewMode === 'list' && "bg-gov-blue/10 text-gov-blue hover:bg-gov-blue/20"
                  )}
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des élections - Mobile First */}
        {filteredElections.length === 0 ? (
          <Card className="election-card border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 px-4">
              <div className="p-3 sm:p-4 bg-gray-100 rounded-full mb-4 sm:mb-6">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 text-gray-700 text-center">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Aucune élection trouvée' 
                  : 'Aucune élection trouvée'
                }
              </h3>
              <p className="text-sm sm:text-base text-gray-500 text-center mb-6 sm:mb-8 max-w-md">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Essayez de modifier vos critères de recherche pour trouver des élections correspondantes.'
                  : 'Commencez par créer votre première élection pour gérer le processus électoral.'
                }
              </p>
              <Button 
                onClick={() => setShowWizard(true)}
                className="btn-primary shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                size="lg"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden xs:inline">Créer une élection</span>
                <span className="xs:hidden">Créer</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredElections.map((election) => (
                <Card 
                  key={election.id} 
                  className="election-card group hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base font-semibold group-hover:text-primary-blue mb-1 sm:mb-2 line-clamp-2 leading-snug">
                          {election.title}
                        </CardTitle>
                        <Badge 
                          variant={getStatusVariant(getStatusColor(election.status))}
                          className="status-badge text-[10px] px-2 py-0.5"
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
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 sm:p-2 flex-shrink-0"
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
                  
                  <CardContent className="p-3 sm:p-3 pt-0">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                          <div className="p-1 bg-[#1e40af]/10 rounded flex-shrink-0">
                            <Calendar className="h-3 w-3 text-[#1e40af]" />
                          </div>
                          <span className="font-medium truncate">
                            {election.date ? election.date.toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'Date non définie'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                          <div className="p-1 bg-green-100 rounded flex-shrink-0">
                            <MapPin className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="font-medium line-clamp-1">{election.location.fullAddress}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-200">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="flex items-center justify-center gap-1 text-green-600 mb-0.5">
                            <Building className="h-3 w-3" />
                            <span className="text-[11px] font-semibold">Centres</span>
                          </div>
                          <p className="text-xs font-bold text-green-700">
                            {election.statistics.totalCenters}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-[#1e40af]/10 rounded">
                          <div className="flex items-center justify-center gap-1 text-[#1e40af] mb-0.5">
                            <Building className="h-3 w-3" />
                            <span className="text-[11px] font-semibold">Bureaux</span>
                          </div>
                          <p className="text-xs font-bold text-[#1e40af]">
                            {election.statistics.totalBureaux}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded col-span-2">
                          <div className="flex items-center justify-center gap-1 text-purple-600 mb-0.5">
                            <Users className="h-3 w-3" />
                            <span className="text-[11px] font-semibold">Électeurs</span>
                          </div>
                          <p className="text-xs font-bold text-purple-700">
                            {election.statistics.totalVoters.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-[#1e40af] hover:text-white hover:border-[#1e40af] hover:shadow-md transition-all duration-300 py-1.5 text-xs group-hover:bg-[#1e40af] group-hover:text-white group-hover:border-[#1e40af] group-hover:shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewElection(election);
                        }}
                      >
                        <span className="hidden xs:inline">Voir les détails</span>
                        <span className="xs:hidden">Détails</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              {filteredElections.map((election) => (
                <Card
                  key={election.id}
                  className="election-card group hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <CardTitle className="text-base sm:text-lg font-semibold group-hover:text-primary-blue line-clamp-1 flex-1 pr-2">
                            {election.title}
                          </CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 flex-shrink-0"
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
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                          <Badge
                            variant={getStatusVariant(getStatusColor(election.status))}
                            className="status-badge text-xs px-2 py-1 w-fit"
                            data-status={getStatusColor(election.status)}
                          >
                            {election.status}
                          </Badge>
                          
                          <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                            <span className="truncate">
                              {election.date ? election.date.toLocaleDateString('fr-FR', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              }) : 'Date non définie'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-2">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                          <span className="line-clamp-1">{election.location.fullAddress}</span>
                        </div>

                        {/* Statistiques */}
                        <div className="flex items-center gap-3 sm:gap-4 text-gray-700 text-xs sm:text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span className="font-medium">{election.statistics.totalCenters}</span>
                            <span className="text-gray-500 hidden xs:inline">centres</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 text-[#1e40af]" />
                            <span className="font-medium">{election.statistics.totalBureaux}</span>
                            <span className="text-gray-500 hidden xs:inline">bureaux</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                            <span className="font-medium">{election.statistics.totalVoters.toLocaleString()}</span>
                            <span className="text-gray-500 hidden xs:inline">électeurs</span>
                          </div>
                        </div>
                      </div>

                      {/* Bouton d'action */}
                      <div className="w-full sm:w-auto">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-[#1e40af] hover:text-white hover:border-[#1e40af] hover:shadow-md transition-all duration-300 py-2 text-sm group-hover:bg-[#1e40af] group-hover:text-white group-hover:border-[#1e40af] group-hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewElection(election);
                          }}
                        >
                          <span className="hidden xs:inline">Voir les détails</span>
                          <span className="xs:hidden">Détails</span>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
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
