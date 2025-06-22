
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  Download, 
  Eye, 
  TrendingUp,
  MapPin,
  Users,
  PieChart,
  FileSpreadsheet,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

const ConsolidationSection = () => {
  const [selectedLevel, setSelectedLevel] = useState('province');
  const [selectedRegion, setSelectedRegion] = useState('Estuaire');
  const [viewMode, setViewMode] = useState('overview');

  // Mock data pour les résultats consolidés
  const consolidatedResults = {
    global: {
      totalVotants: 125430,
      totalInscrits: 185267,
      tauxParticipation: 67.7,
      bulletinsNuls: 3125,
      suffragesExprimes: 122305,
      centresTermines: 42,
      totalCentres: 45
    },
    candidates: [
      {
        id: 'C001',
        name: 'ALLOGHO-OBIANG Marie',
        party: 'Parti Démocratique Gabonais',
        votes: 52341,
        percentage: 42.8,
        color: '#3B82F6'
      },
      {
        id: 'C002',
        name: 'NDONG Jean-Baptiste',
        party: 'Union Nationale',
        votes: 43692,
        percentage: 35.7,
        color: '#10B981'
      },
      {
        id: 'C003',
        name: 'OVONO-EBANG Claire',
        party: 'Rassemblement pour la Patrie',
        votes: 26272,
        percentage: 21.5,
        color: '#F59E0B'
      }
    ]
  };

  const geographicResults = [
    {
      region: 'Libreville Nord',
      inscrits: 45230,
      votants: 31250,
      participation: 69.1,
      candidateResults: [
        { candidate: 'ALLOGHO-OBIANG', votes: 13540, percentage: 43.3 },
        { candidate: 'NDONG', votes: 10890, percentage: 34.9 },
        { candidate: 'OVONO-EBANG', votes: 6820, percentage: 21.8 }
      ]
    },
    {
      region: 'Libreville Sud',
      inscrits: 38750,
      votants: 25890,
      participation: 66.8,
      candidateResults: [
        { candidate: 'ALLOGHO-OBIANG', votes: 10980, percentage: 42.4 },
        { candidate: 'NDONG', votes: 9340, percentage: 36.1 },
        { candidate: 'OVONO-EBANG', votes: 5570, percentage: 21.5 }
      ]
    },
    {
      region: 'Owendo',
      inscrits: 28450,
      votants: 19230,
      participation: 67.6,
      candidateResults: [
        { candidate: 'ALLOGHO-OBIANG', votes: 8210, percentage: 42.7 },
        { candidate: 'NDONG', votes: 6890, percentage: 35.8 },
        { candidate: 'OVONO-EBANG', votes: 4130, percentage: 21.5 }
      ]
    }
  ];

  const barChartData = consolidatedResults.candidates.map(candidate => ({
    name: candidate.name.split(' ')[0],
    votes: candidate.votes,
    percentage: candidate.percentage
  }));

  const pieChartData = consolidatedResults.candidates.map(candidate => ({
    name: candidate.name.split(' ')[0],
    value: candidate.percentage,
    color: candidate.color
  }));

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exporting results in ${format} format`);
  };

  return (
    <div className="space-y-6">
      {/* Contrôles et filtres */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gov-gray">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Consolidation et Publication des Résultats</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {consolidatedResults.global.centresTermines}/{consolidatedResults.global.totalCentres} centres complétés
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Niveau géographique:</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="province">Province</SelectItem>
                  <SelectItem value="ville">Ville</SelectItem>
                  <SelectItem value="centre">Centre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Région:</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estuaire">Estuaire</SelectItem>
                  <SelectItem value="Ogooué-Maritime">Ogooué-Maritime</SelectItem>
                  <SelectItem value="Haut-Ogooué">Haut-Ogooué</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Vue:</label>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Vue d'ensemble</SelectItem>
                  <SelectItem value="detailed">Détaillée</SelectItem>
                  <SelectItem value="geographic">Géographique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gov-card border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participation</p>
                <p className="text-2xl font-bold text-blue-600">
                  {consolidatedResults.global.tauxParticipation}%
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={consolidatedResults.global.tauxParticipation} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {consolidatedResults.global.totalVotants.toLocaleString()} / {consolidatedResults.global.totalInscrits.toLocaleString()} électeurs
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Tête</p>
                <p className="text-lg font-bold text-green-600">
                  {consolidatedResults.candidates[0].name.split(' ')[0]}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {consolidatedResults.candidates[0].votes.toLocaleString()} voix
            </p>
            <p className="text-xs text-gray-500">
              {consolidatedResults.candidates[0].percentage}% des suffrages
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suffrages Exprimés</p>
                <p className="text-2xl font-bold text-purple-600">
                  {consolidatedResults.global.suffragesExprimes.toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {consolidatedResults.global.bulletinsNuls.toLocaleString()} bulletins nuls
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progression</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round((consolidatedResults.global.centresTermines / consolidatedResults.global.totalCentres) * 100)}%
                </p>
              </div>
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
            <Progress 
              value={(consolidatedResults.global.centresTermines / consolidatedResults.global.totalCentres) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              {consolidatedResults.global.centresTermines}/{consolidatedResults.global.totalCentres} centres
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visualisations des données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <BarChart3 className="w-5 h-5" />
              <span>Résultats par Candidat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value.toLocaleString()} voix`,
                    'Votes'
                  ]}
                />
                <Bar dataKey="votes" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique circulaire */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <PieChart className="w-5 h-5" />
              <span>Répartition des Suffrages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Pourcentage']}
                />
                <RechartsPieChart data={pieChartData}>
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {consolidatedResults.candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: candidate.color }}
                    ></div>
                    <span className="text-sm font-medium">{candidate.name.split(' ')[0]}</span>
                  </div>
                  <span className="text-sm text-gray-600">{candidate.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résultats détaillés par région */}
      {viewMode === 'geographic' && (
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <MapPin className="w-5 h-5" />
              <span>Résultats Géographiques Détaillés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {geographicResults.map((region, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{region.region}</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {region.participation}% participation
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Statistiques</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Électeurs inscrits:</span>
                          <span className="font-medium">{region.inscrits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Votants:</span>
                          <span className="font-medium">{region.votants.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taux de participation:</span>
                          <span className="font-medium">{region.participation}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Résultats par candidat</h4>
                      <div className="space-y-2">
                        {region.candidateResults.map((result, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{result.candidate}</span>
                            <div className="text-right">
                              <div className="font-medium">{result.votes.toLocaleString()} voix</div>
                              <div className="text-gray-500">{result.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section d'export */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gov-gray">
            <Download className="w-5 h-5" />
            <span>Export des Rapports Officiels</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => handleExport('pdf')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exporter en PDF
            </Button>
            
            <Button
              onClick={() => handleExport('excel')}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exporter en Excel
            </Button>
            
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exporter en CSV
            </Button>
            
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Prévisualiser le Rapport
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Export Sécurisé</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Tous les exports de rapports officiels sont tracés et nécessitent une authentification renforcée. 
                  Les documents générés incluent un horodatage et une signature électronique.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsolidationSection;
