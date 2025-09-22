
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  ChevronDown,
  FileText,
  CheckCircle,
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
  FileCheck,
  Upload
} from 'lucide-react';
import DataEntrySection from '@/components/results/DataEntrySection';
import ValidationSection from '@/components/results/ValidationSection';
import PublishSection from '@/components/results/PublishSection';

const Results = () => {
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [availableElections, setAvailableElections] = useState<Array<{id: string, name: string}>>([]);
  const [globalStats, setGlobalStats] = useState({
    tauxSaisie: 0,
    bureauxSaisis: 0,
    totalBureaux: 0,
    voixNotreCanidat: 0,
    ecartDeuxieme: 0,
    anomaliesDetectees: 0,
    pvsEnAttente: 0
  });
  const [loading, setLoading] = useState(true);

  // Charger les élections disponibles depuis Supabase
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('elections')
          .select('id, title')
          .order('election_date', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des élections:', error);
          return;
        }

        const elections = data?.map(election => ({
          id: election.id.toString(),
          name: election.title
        })) || [];

        setAvailableElections(elections);
        
        // Sélectionner la première élection par défaut
        if (elections.length > 0) {
          setSelectedElection(elections[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des élections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  // Charger les statistiques globales pour l'élection sélectionnée
  useEffect(() => {
    if (!selectedElection) return;

    const fetchGlobalStats = async () => {
      try {
        // Récupérer les statistiques des PV
        const { data: pvData, error: pvError } = await supabase
          .from('procès_verbaux')
          .select('status, election_id')
          .eq('election_id', selectedElection);

        if (pvError) {
          console.error('Erreur lors du chargement des PV:', pvError);
          return;
        }

        // Récupérer le nombre total de bureaux pour cette élection
        const { data: bureauxData, error: bureauxError } = await supabase
          .from('voting_bureaux')
          .select('id')
          .eq('election_id', selectedElection);

        if (bureauxError) {
          console.error('Erreur lors du chargement des bureaux:', bureauxError);
          return;
        }

        const totalBureaux = bureauxData?.length || 0;
        const pvsSaisis = pvData?.filter(pv => pv.status === 'saisi').length || 0;
        const pvsEnAttente = pvData?.filter(pv => pv.status === 'en_attente').length || 0;
        const tauxSaisie = totalBureaux > 0 ? Math.round((pvsSaisis / totalBureaux) * 100) : 0;

        // Récupérer les résultats des candidats
        // Récupérer les candidats de l'élection d'abord
        const { data: electionCandidates, error: candidatesError } = await supabase
          .from('election_candidates')
          .select('candidate_id')
          .eq('election_id', selectedElection);

        if (candidatesError) {
          console.error('Erreur lors du chargement des candidats:', candidatesError);
          return;
        }

        const candidateIds = electionCandidates?.map(ec => ec.candidate_id) || [];
        
        let resultsData = [];
        if (candidateIds.length > 0) {
          const { data: results, error: resultsError } = await supabase
            .from('candidate_results')
            .select('votes_received, candidate_id, candidates(name)')
            .in('candidate_id', candidateIds)
            .order('votes_received', { ascending: false });
          
          if (resultsError) {
            console.error('Erreur lors du chargement des résultats:', resultsError);
            return;
          }
          
          resultsData = results || [];
        }


        const sortedResults = resultsData || [];
        const voixNotreCanidat = sortedResults[0]?.votes_received || 0;
        const ecartDeuxieme = sortedResults.length > 1 
          ? voixNotreCanidat - (sortedResults[1]?.votes_received || 0) 
          : 0;

        setGlobalStats({
          tauxSaisie,
          bureauxSaisis: pvsSaisis,
          totalBureaux,
          voixNotreCanidat,
          ecartDeuxieme,
          anomaliesDetectees: 0, // À implémenter selon la logique métier
          pvsEnAttente
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    fetchGlobalStats();
  }, [selectedElection]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des résultats...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* En-tête avec sélecteur d'élection */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gov-gray">Résultats</h1>
          
          {/* Sélecteur d'élection */}
          <Card className="gov-card bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Élection active :
                </label>
                <Select value={selectedElection} onValueChange={setSelectedElection}>
                  <SelectTrigger className="w-80 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableElections.map((election) => (
                      <SelectItem key={election.id} value={election.id}>
                        {election.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation par onglets */}
        <Card className="gov-card">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="entry" 
                    className="flex items-center justify-center space-x-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Saisir les résultats</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="validation" 
                    className="flex items-center justify-center space-x-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Valider les résultats</span>
                    {globalStats.pvsEnAttente > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {globalStats.pvsEnAttente}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="publish" 
                    className="flex items-center justify-center space-x-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Publier les résultats</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="entry" className="space-y-6 mt-0">
                  <DataEntrySection stats={globalStats} selectedElection={selectedElection} />
                </TabsContent>

                <TabsContent value="validation" className="space-y-6 mt-0">
                  <ValidationSection pendingCount={globalStats.pvsEnAttente} selectedElection={selectedElection} />
                </TabsContent>

                <TabsContent value="publish" className="space-y-6 mt-0">
                  <PublishSection selectedElection={selectedElection} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Results;
