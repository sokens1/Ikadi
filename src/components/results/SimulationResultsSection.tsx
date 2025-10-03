import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Calculator, BarChart3, TrendingUp, Users, Vote } from 'lucide-react';

interface SimulationResultsSectionProps {
  electionId: string;
}

interface CandidateResult {
  id: string;
  name: string;
  party?: string;
  votes: number;
  percentage: number;
  color: string;
}

interface BureauData {
  id: string;
  name: string;
  center_name: string;
  registered_voters: number;
  total_voters: number;
  is_validated: boolean;
}

interface SimulationParams {
  globalParticipation: number;
  suffrageExprime: number;
  candidateDistribution: Record<string, number>;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const SimulationResultsSection: React.FC<SimulationResultsSectionProps> = ({ electionId }) => {
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [validatedBureaux, setValidatedBureaux] = useState<BureauData[]>([]);
  const [pendingBureaux, setPendingBureaux] = useState<BureauData[]>([]);
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    globalParticipation: 65,
    suffrageExprime: 85,
    candidateDistribution: {}
  });
  const [loading, setLoading] = useState(false);
  const [simulatedResults, setSimulatedResults] = useState<CandidateResult[]>([]);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      if (!electionId) return;
      
      try {
        setLoading(true);
        
        // 1. Charger les candidats de l'élection
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('election_candidates')
          .select('candidate_id, candidates!inner(id, name, party)')
          .eq('election_id', electionId);

        if (candidatesError) throw candidatesError;

        const candidatesList = (candidatesData || []).map((row: any, index: number) => ({
          id: String(row.candidates.id),
          name: row.candidates.name,
          party: row.candidates.party,
          votes: 0,
          percentage: 0,
          color: COLORS[index % COLORS.length]
        }));

        setCandidates(candidatesList);

        // 2. Charger les bureaux validés avec leurs résultats
        const { data: validatedData, error: validatedError } = await supabase
          .from('bureau_candidate_results_summary')
          .select(`
            bureau_id,
            center_id,
            candidate_id,
            candidate_name,
            candidate_votes,
            voting_bureaux!inner(id, name, registered_voters),
            voting_centers!inner(id, name)
          `)
          .eq('election_id', electionId);

        if (validatedError) throw validatedError;

        // Grouper par bureau
        const bureauMap = new Map();
        (validatedData || []).forEach((row: any) => {
          const bureauId = row.bureau_id;
          if (!bureauMap.has(bureauId)) {
            bureauMap.set(bureauId, {
              id: bureauId,
              name: row.voting_bureaux?.name || 'Bureau',
              center_name: row.voting_centers?.name || 'Centre',
              registered_voters: row.voting_bureaux?.registered_voters || 0,
              total_voters: 0,
              is_validated: true,
              candidate_votes: {}
            });
          }
          
          const bureau = bureauMap.get(bureauId);
          bureau.candidate_votes[row.candidate_id] = row.candidate_votes;
          bureau.total_voters += row.candidate_votes;
        });

        setValidatedBureaux(Array.from(bureauMap.values()));

        // 3. Charger les bureaux non validés
        const { data: allBureaux, error: allBureauxError } = await supabase
          .from('voting_bureaux')
          .select(`
            id,
            name,
            registered_voters,
            center_id,
            voting_centers!inner(name)
          `)
          .in('center_id', await getElectionCenters(electionId));

        if (allBureauxError) throw allBureauxError;

        const validatedBureauIds = new Set(validatedBureaux.map(b => b.id));
        const pendingBureauxList = (allBureaux || [])
          .filter((bureau: any) => !validatedBureauIds.has(bureau.id))
          .map((bureau: any) => ({
            id: bureau.id,
            name: bureau.name,
            center_name: bureau.voting_centers?.name || 'Centre',
            registered_voters: bureau.registered_voters || 0,
            total_voters: 0,
            is_validated: false
          }));

        setPendingBureaux(pendingBureauxList);

        // 4. Initialiser la distribution des candidats
        const initialDistribution: Record<string, number> = {};
        candidatesList.forEach(candidate => {
          initialDistribution[candidate.id] = 100 / candidatesList.length;
        });

        setSimulationParams(prev => ({
          ...prev,
          candidateDistribution: initialDistribution
        }));

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [electionId]);

  // Fonction pour récupérer les centres de l'élection
  const getElectionCenters = async (electionId: string) => {
    const { data, error } = await supabase
      .from('election_centers')
      .select('center_id')
      .eq('election_id', electionId);
    
    if (error) throw error;
    return (data || []).map(row => row.center_id);
  };

  // Calculer les résultats simulés
  const calculateSimulatedResults = useMemo(() => {
    if (candidates.length === 0) return [];

    // 1. Calculer les résultats validés
    const validatedVotes: Record<string, number> = {};
    let totalValidatedVoters = 0;

    validatedBureaux.forEach(bureau => {
      totalValidatedVoters += bureau.total_voters;
      candidates.forEach(candidate => {
        const votes = bureau.candidate_votes?.[candidate.id] || 0;
        validatedVotes[candidate.id] = (validatedVotes[candidate.id] || 0) + votes;
      });
    });

    // 2. Calculer les votes simulés pour les bureaux non validés
    const simulatedVotes: Record<string, number> = { ...validatedVotes };
    let totalSimulatedVoters = totalValidatedVoters;

    pendingBureaux.forEach(bureau => {
      const simulatedVoters = Math.round(
        (bureau.registered_voters * simulationParams.globalParticipation / 100) * 
        (simulationParams.suffrageExprime / 100)
      );
      
      totalSimulatedVoters += simulatedVoters;

      candidates.forEach(candidate => {
        const candidatePercentage = simulationParams.candidateDistribution[candidate.id] || 0;
        const votes = Math.round((simulatedVoters * candidatePercentage) / 100);
        simulatedVotes[candidate.id] = (simulatedVotes[candidate.id] || 0) + votes;
      });
    });

    // 3. Calculer les pourcentages finaux
    const totalVotes = Object.values(simulatedVotes).reduce((sum, votes) => sum + votes, 0);
    
    return candidates.map(candidate => ({
      ...candidate,
      votes: simulatedVotes[candidate.id] || 0,
      percentage: totalVotes > 0 ? (simulatedVotes[candidate.id] || 0) / totalVotes * 100 : 0
    })).sort((a, b) => b.votes - a.votes);
  }, [candidates, validatedBureaux, pendingBureaux, simulationParams]);

  // Données pour le graphique en camembert
  const chartData = useMemo(() => {
    return calculateSimulatedResults.map(candidate => ({
      name: candidate.name,
      value: candidate.votes,
      percentage: candidate.percentage,
      color: candidate.color
    }));
  }, [calculateSimulatedResults]);

  // Statistiques de simulation
  const simulationStats = useMemo(() => {
    const totalValidatedVoters = validatedBureaux.reduce((sum, bureau) => sum + bureau.total_voters, 0);
    const totalPendingVoters = pendingBureaux.reduce((sum, bureau) => 
      sum + Math.round((bureau.registered_voters * simulationParams.globalParticipation / 100)), 0);
    
    return {
      totalValidatedBureaux: validatedBureaux.length,
      totalPendingBureaux: pendingBureaux.length,
      totalValidatedVoters,
      totalPendingVoters,
      globalParticipation: simulationParams.globalParticipation,
      suffrageExprime: simulationParams.suffrageExprime
    };
  }, [validatedBureaux, pendingBureaux, simulationParams]);

  const handleParticipationChange = (value: number[]) => {
    setSimulationParams(prev => ({
      ...prev,
      globalParticipation: value[0]
    }));
  };

  const handleSuffrageChange = (value: number[]) => {
    setSimulationParams(prev => ({
      ...prev,
      suffrageExprime: value[0]
    }));
  };

  const handleCandidateDistributionChange = (candidateId: string, percentage: number) => {
    setSimulationParams(prev => ({
      ...prev,
      candidateDistribution: {
        ...prev.candidateDistribution,
        [candidateId]: Math.max(0, Math.min(100, percentage))
      }
    }));
  };

  const resetToDefaults = () => {
    const equalDistribution = 100 / candidates.length;
    const newDistribution: Record<string, number> = {};
    candidates.forEach(candidate => {
      newDistribution[candidate.id] = equalDistribution;
    });

    setSimulationParams({
      globalParticipation: 65,
      suffrageExprime: 85,
      candidateDistribution: newDistribution
    });
  };

  if (loading) {
    return (
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="text-gov-gray">Simulation des résultats globaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Chargement des données...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gov-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gov-gray flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulation des résultats globaux
          </CardTitle>
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            Réinitialiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section gauche - Graphiques et résultats */}
          <div className="space-y-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                 <div className="flex items-center gap-2 mb-2">
                   <BarChart3 className="h-4 w-4 text-blue-600" />
                   <span className="text-sm font-medium text-blue-800">Bureaux déjà dépouillés</span>
                 </div>
                 <div className="text-2xl font-bold text-blue-900">{simulationStats.totalValidatedBureaux}</div>
                 <div className="text-xs text-blue-600">
                   <div>{simulationStats.totalValidatedVoters.toLocaleString()} votants • {validatedBureaux.reduce((sum, bureau) => sum + bureau.registered_voters, 0).toLocaleString()} inscrits</div>
                 </div>
                </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Bureaux restants</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">{simulationStats.totalPendingBureaux}</div>
                <div className="text-xs text-orange-600">
                  {pendingBureaux.reduce((sum, bureau) => sum + bureau.registered_voters, 0).toLocaleString()} inscrits
                </div>
              </div>
            </div>

            {/* Graphique en camembert */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Résultats simulés
              </h3>
               <div className="h-48 flex">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${value.toLocaleString()} voix (${props.payload.percentage.toFixed(1)}%)`, 
                          props.payload.name
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return `${data.name}`;
                          }
                          return '';
                        }}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 flex items-center justify-center">
                  <div className="space-y-2">
                    {chartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-xs text-gray-600 font-medium">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Résultats détaillés */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Classement simulé</h3>
              {calculateSimulatedResults.map((candidate, index) => (
                <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="text-white" style={{ backgroundColor: candidate.color }}>
                      #{index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{candidate.name}</div>
                      {candidate.party && (
                        <div className="text-sm text-gray-600">{candidate.party}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{candidate.votes.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{candidate.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section droite - Contrôles de simulation */}
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Vote className="h-4 w-4" />
                Paramètres de simulation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Ajustez ces paramètres pour simuler différents scénarios sur les bureaux non encore validés.
              </p>

              {/* Taux de participation global */}
              <div className="space-y-3">
                <Label>Taux de participation global</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>0%</span>
                    <span className="font-medium">{simulationParams.globalParticipation}%</span>
                    <span>100%</span>
                  </div>
                  <Slider
                    value={[simulationParams.globalParticipation]}
                    onValueChange={handleParticipationChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Suffrage exprimé */}
              <div className="space-y-3">
                <Label>Suffrage exprimé (des votants)</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>0%</span>
                    <span className="font-medium">{simulationParams.suffrageExprime}%</span>
                    <span>100%</span>
                  </div>
                  <Slider
                    value={[simulationParams.suffrageExprime]}
                    onValueChange={handleSuffrageChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Distribution des candidats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Distribution des voix</h3>
              <p className="text-sm text-gray-600">
                Répartissez les voix entre les candidats (doit totaliser 100%)
              </p>
              
              {candidates.map((candidate) => (
                <div key={candidate.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">{candidate.name}</Label>
                    <span className="text-sm font-bold">
                      {simulationParams.candidateDistribution[candidate.id] || 0}%
                    </span>
                  </div>
                  <Slider
                    value={[simulationParams.candidateDistribution[candidate.id] || 0]}
                    onValueChange={(value) => handleCandidateDistributionChange(candidate.id, value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  Total: {Object.values(simulationParams.candidateDistribution).reduce((sum, val) => sum + val, 0).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Résumé des paramètres */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Résumé de la simulation</h4>
              <div className="space-y-1 text-sm">
                <div>Participation: {simulationParams.globalParticipation}%</div>
                <div>Suffrage exprimé: {simulationParams.suffrageExprime}%</div>
                <div>Bureaux validés: {validatedBureaux.length}</div>
                <div>Bureaux simulés: {pendingBureaux.length}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationResultsSection;
