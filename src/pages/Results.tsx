import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
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
import ConsolidationSection from '@/components/results/ConsolidationSection';

interface Candidate {
  id: string;
  name: string;
  party: string;
  photo?: string;
}

interface Election {
  id: string;
  name: string;
  date: string;
  status: string;
  candidates: Candidate[];
  totalCenters: number;
  totalBureaux: number;
}

const Results = () => {
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedElection, setSelectedElection] = useState('legislatives-2023-moanda');
  const [elections, setElections] = useState<Election[]>([]);
  const [currentElection, setCurrentElection] = useState<Election | null>(null);

  // Charger les élections depuis localStorage
  useEffect(() => {
    const savedElections = localStorage.getItem('elections');
    if (savedElections) {
      const parsedElections = JSON.parse(savedElections);
      setElections(parsedElections);
      
      // Sélectionner la première élection par défaut
      if (parsedElections.length > 0) {
        const firstElection = parsedElections[0];
        setSelectedElection(firstElection.id);
        setCurrentElection(firstElection);
      }
    }
  }, []);

  // Mettre à jour l'élection courante quand la sélection change
  useEffect(() => {
    if (selectedElection && elections.length > 0) {
      const election = elections.find(e => e.id === selectedElection);
      setCurrentElection(election || null);
    }
  }, [selectedElection, elections]);

  // Générer des statistiques dynamiques basées sur l'élection courante
  const generateStats = () => {
    if (!currentElection) {
      return {
        tauxSaisie: 0,
        bureauxSaisis: 0,
        totalBureaux: 0,
        candidateResults: [],
        ecartPremier: 0,
        anomaliesDetectees: 0,
        pvsEnAttente: 0
      };
    }

    // Mock data pour la démonstration - en production, ces données viendraient d'une API
    const bureauxSaisis = Math.floor(currentElection.totalBureaux * 0.85);
    const tauxSaisie = Math.round((bureauxSaisis / currentElection.totalBureaux) * 100);
    
    // Générer des résultats pour chaque candidat
    const candidateResults = (currentElection.candidates || []).map((candidate, index) => {
      const baseVotes = 5000 + (index * 1000);
      const variation = Math.floor(Math.random() * 2000);
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateParty: candidate.party,
        votes: baseVotes + variation
      };
    });

    // Trier par nombre de voix décroissant
    candidateResults.sort((a, b) => b.votes - a.votes);
    
    const ecartPremier = candidateResults.length > 1 ? 
      candidateResults[0].votes - candidateResults[1].votes : 0;

    return {
      tauxSaisie,
      bureauxSaisis,
      totalBureaux: currentElection.totalBureaux,
      candidateResults,
      ecartPremier,
      anomaliesDetectees: 3,
      pvsEnAttente: 12
    };
  };

  const globalStats = generateStats();

  if (!currentElection) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-gov-gray">Résultats</h1>
          <Card className="gov-card">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Aucune élection disponible. Veuillez créer une élection d'abord.</p>
            </CardContent>
          </Card>
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
                    {elections.map((election) => (
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
                <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
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
                    value="consolidation" 
                    className="flex items-center justify-center space-x-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Centralisation</span>
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
                  <DataEntrySection 
                    stats={globalStats} 
                    election={currentElection}
                  />
                </TabsContent>

                <TabsContent value="validation" className="space-y-6 mt-0">
                  <ValidationSection 
                    pendingCount={globalStats.pvsEnAttente} 
                    election={currentElection}
                  />
                </TabsContent>

                <TabsContent value="consolidation" className="space-y-6 mt-0">
                  <ConsolidationSection />
                </TabsContent>

                <TabsContent value="publish" className="space-y-6 mt-0">
                  <PublishSection 
                    election={currentElection}
                    results={globalStats.candidateResults}
                  />
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
