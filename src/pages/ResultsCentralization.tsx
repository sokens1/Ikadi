
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Plus, 
  Eye, 
  FileCheck, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Users,
  FileText,
  Download
} from 'lucide-react';
import RealTimeProgressSection from '@/components/results/RealTimeProgressSection';
import PVEntrySection from '@/components/results/PVEntrySection';
import PVValidationSection from '@/components/results/PVValidationSection';
import ConsolidationSection from '@/components/results/ConsolidationSection';

const ResultsCentralization = () => {
  const [activeTab, setActiveTab] = useState('progress');

  // Mock data pour les statistiques générales
  const statsData = {
    totalCenters: 45,
    totalBureaux: 182,
    pvsEntered: 85.2,
    pvsValidated: 78.9,
    participation: 67.8,
    pendingValidation: 12
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* En-tête de page */}
        <div>
          <h1 className="text-3xl font-bold text-gov-gray">Centralisation et Publication des Résultats</h1>
          <p className="text-gray-600 mt-2">
            Flux de travail critique pour la saisie, validation et publication des résultats électoraux
          </p>
        </div>

        {/* Indicateurs rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gov-card border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">PV Saisis</p>
                  <p className="text-2xl font-bold text-blue-600">{statsData.pvsEntered}%</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={statsData.pvsEntered} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">PV Validés</p>
                  <p className="text-2xl font-bold text-green-600">{statsData.pvsValidated}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={statsData.pvsValidated} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Participation</p>
                  <p className="text-2xl font-bold text-purple-600">{statsData.participation}%</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <Progress value={statsData.participation} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-orange-600">{statsData.pendingValidation}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interface à onglets principale */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <BarChart3 className="w-5 h-5" />
              <span>Gestion des Résultats Électoraux</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="progress" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Progression Temps Réel</span>
                </TabsTrigger>
                <TabsTrigger value="entry" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Saisie des PV</span>
                </TabsTrigger>
                <TabsTrigger value="validation" className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4" />
                  <span>Validation des PV</span>
                </TabsTrigger>
                <TabsTrigger value="consolidation" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Consolidation</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4">
                <RealTimeProgressSection />
              </TabsContent>

              <TabsContent value="entry" className="space-y-4">
                <PVEntrySection />
              </TabsContent>

              <TabsContent value="validation" className="space-y-4">
                <PVValidationSection />
              </TabsContent>

              <TabsContent value="consolidation" className="space-y-4">
                <ConsolidationSection />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ResultsCentralization;
