
import React, { useState } from 'react';
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

const Results = () => {
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedElection, setSelectedElection] = useState('legislatives-2023-moanda');

  // Mock data pour les élections disponibles
  const availableElections = [
    { id: 'legislatives-2023-moanda', name: 'Législatives 2023 - Moanda' },
    { id: 'municipales-2023-libreville', name: 'Municipales 2023 - Libreville' },
    { id: 'presidentielles-2023', name: 'Présidentielles 2023' }
  ];

  // Mock data pour les statistiques globales
  const globalStats = {
    tauxSaisie: 85,
    bureauxSaisis: 41,
    totalBureaux: 48,
    voixNotreCanidat: 7230,
    ecartDeuxieme: 1150,
    anomaliesDetectees: 3,
    pvsEnAttente: 12
  };

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
                  <DataEntrySection stats={globalStats} />
                </TabsContent>

                <TabsContent value="validation" className="space-y-6 mt-0">
                  <ValidationSection pendingCount={globalStats.pvsEnAttente} />
                </TabsContent>

                <TabsContent value="publish" className="space-y-6 mt-0">
                  <PublishSection />
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
