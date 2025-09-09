import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Building,
  Eye,
  ArrowRight,
  Plus
} from 'lucide-react';
import ElectionWizard from '@/components/elections/ElectionWizard';
import ElectionDetailView from '@/components/elections/ElectionDetailView';

interface Election {
  id: number;
  title: string;
  date: string;
  status: string;
  statusColor: string;
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

const ElectionManagement = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les élections depuis Supabase
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('elections')
          .select('*')
          .order('election_date', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des élections:', error);
          return;
        }

        // Transformer les données Supabase en format Election
        const transformedElections: Election[] = data?.map(election => {
          // Extraire les informations géographiques de la description
          const description = election.description || "";
          let commune = "";
          let arrondissement = "";
          let department = "";
          let province = "";
          
          if (description.startsWith("Circonscription ")) {
            const locationText = description.replace("Circonscription ", "");
            const parts = locationText.split(", ");
            commune = parts[0] || "";
            arrondissement = parts[1] || "";
            
            // Essayer d'extraire le département et la province si disponibles
            if (parts.length > 2) {
              department = parts[2] || "";
            }
            if (parts.length > 3) {
              province = parts[3] || "";
            }
          }
          
          return {
            id: election.id,
            title: election.title,
            date: election.election_date,
            status: election.status || "À venir",
            statusColor: getStatusColor(election.status),
            description: description,
            voters: 0, // Sera calculé dynamiquement
            candidates: 0, // Sera calculé dynamiquement
            centers: 0, // Sera calculé dynamiquement
            bureaux: 0, // Sera calculé dynamiquement
            location: commune && arrondissement ? `${commune}, ${arrondissement}` : commune || "",
            type: election.type || "Législatives",
            seatsAvailable: election.seats_available || 1,
            budget: election.budget || 0,
            voteGoal: election.vote_goal || 0,
            province: province,
            department: department,
            commune: commune,
            arrondissement: arrondissement
          };
        }) || [];

        setElections(transformedElections);
      } catch (error) {
        console.error('Erreur lors du chargement des élections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  // Fonction pour déterminer la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'en cours':
      case 'active':
        return 'green';
      case 'à venir':
      case 'programmée':
        return 'blue';
      case 'préparation':
        return 'orange';
      case 'terminée':
      case 'completed':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getStatusVariant = (color: string) => {
    switch (color) {
      case 'green':
        return 'default';
      case 'blue':
        return 'secondary';
      case 'orange':
        return 'outline';
      case 'gray':
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

  if (selectedElection) {
    return (
      <ElectionDetailView
        election={selectedElection}
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

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Élections</h1>
            <p className="text-gray-600 mt-1">
              Gérez et supervisez toutes les élections du système
            </p>
          </div>
          <Button 
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Élection
          </Button>
        </div>

        {/* Elections Grid */}
        {elections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune élection trouvée
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Commencez par créer votre première élection
              </p>
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une élection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <Card key={election.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {election.title}
                    </CardTitle>
                      <Badge 
                        variant={getStatusVariant(election.statusColor)}
                        className="mb-2"
                      >
                        {election.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewElection(election)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      Voir
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(election.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{election.location || `${election.commune}, ${election.department}`}</span>
                    </div>
                    {election.description && (
                      <div className="text-sm text-gray-500">
                        {election.description}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Électeurs</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {election.voters.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <Building className="h-4 w-4" />
                        <span className="text-sm font-medium">Centres</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {election.centers}
                      </p>
                    </div>
                  </div>


                    <Button 
                      variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleViewElection(election)}
                  >
                    Voir les détails
                    <ArrowRight className="h-4 w-4" />
                    </Button>
                </CardContent>
              </Card>
            ))}
        </div>
        )}

        {/* Election Wizard Modal */}
        {showWizard && (
          <ElectionWizard
            onClose={() => setShowWizard(false)}
            onSubmit={async (election) => {
              try {
                // Vérifier l'authentification
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                console.log('Utilisateur connecté:', user);
                console.log('Erreur d\'authentification:', authError);

                if (authError || !user) {
                  alert('Erreur d\'authentification. Veuillez vous reconnecter.');
                  return;
                }

                // Enregistrer l'élection en base de données
                // Données à insérer (seulement les colonnes qui existent)
                const electionData = {
                  title: election.name,
                  type: election.type,
                  election_date: election.date,
                  status: 'À venir',
                  seats_available: election.seatsAvailable || 1,
                  budget: election.budget || 0,
                  vote_goal: election.voteGoal || 0,
                  description: `Circonscription ${election.commune}, ${election.arrondissement}, ${election.department}, ${election.province}`
                };

                console.log('Données à insérer:', JSON.stringify(electionData, null, 2));

                const { data, error } = await supabase
                  .from('elections')
                  .insert(electionData)
                  .select();

                if (error) {
                  console.error('Erreur lors de la création de l\'élection:', error);
                  console.error('Détails de l\'erreur:', JSON.stringify({
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                  }, null, 2));
                  
                  // Afficher plus de détails dans l'alerte
                  const errorDetails = `
Erreur: ${error.message}
Code: ${error.code}
Détails: ${error.details || 'Aucun'}
Conseil: ${error.hint || 'Aucun'}
                  `.trim();
                  
                  alert(`Erreur lors de la création de l'élection:\n\n${errorDetails}`);
                  return;
                }

                console.log('Élection créée avec succès:', data);
                
                // Sauvegarder les candidats si ils existent
                if (election.candidates && election.candidates.length > 0) {
                  try {
                    // Créer les candidats en base de données
                    const candidatesData = election.candidates.map(candidate => ({
                      name: candidate.name,
                      party: candidate.party,
                      is_priority: candidate.isOurCandidate,
                      election_id: data.id
                    }));

                    const { error: candidatesError } = await supabase
                      .from('candidates')
                      .insert(candidatesData);

                    if (candidatesError) {
                      console.error('Erreur lors de la sauvegarde des candidats:', candidatesError);
                    } else {
                      console.log('Candidats sauvegardés avec succès');
                    }
                  } catch (error) {
                    console.error('Erreur lors de la sauvegarde des candidats:', error);
                  }
                }
                
                setShowWizard(false);
                
                // Recharger les élections
                window.location.reload();
              } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la création de l\'élection');
              }
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default ElectionManagement;
