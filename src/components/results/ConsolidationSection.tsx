
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart3,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  MapPin,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

interface CandidateResult {
  candidateId: string;
  candidateName: string;
  candidateParty: string;
  votes: number;
}

interface ConsolidationSectionProps {
  election: Election;
  results: CandidateResult[];
}

const ConsolidationSection: React.FC<ConsolidationSectionProps> = ({ election, results }) => {
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [consolidationProgress, setConsolidationProgress] = useState(85);

  // Données consolidées simulées
  const consolidatedData = {
    totalVotes: results.reduce((sum, result) => sum + result.votes, 0),
    totalCenters: election.totalCenters,
    centersConsolidated: Math.floor(election.totalCenters * 0.92),
    totalBureaux: election.totalBureaux,
    bureauxConsolidated: Math.floor(election.totalBureaux * 0.88),
    lastUpdate: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };

  // Données pour les graphiques
  const chartData = results.map((result, index) => ({
    name: result.candidateName.split(' ').slice(0, 2).join(' '),
    votes: result.votes,
    percentage: ((result.votes / consolidatedData.totalVotes) * 100).toFixed(1),
    color: ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'][index] || '#6b7280'
  }));

  const pieData = chartData.map(item => ({
    name: item.name,
    value: item.votes,
    color: item.color
  }));

  const handleConsolidation = async () => {
    setIsConsolidating(true);
    // Simulation du processus de consolidation
    for (let i = consolidationProgress; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setConsolidationProgress(i);
    }
    setIsConsolidating(false);
  };

  const exportConsolidatedResults = () => {
    const csvContent = [
      ['Candidat', 'Parti', 'Voix', 'Pourcentage'],
      ...results.map(result => [
        result.candidateName,
        result.candidateParty,
        result.votes,
        ((result.votes / consolidatedData.totalVotes) * 100).toFixed(2) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats_consolides_${election.name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Statut de consolidation */}
      <Card className="gov-card border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Consolidation des Résultats</h3>
                <p className="text-sm text-gray-600">Agrégation des données de tous les centres de vote</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-100 text-blue-800">
                {consolidationProgress}% consolidé
              </Badge>
              <Button
                onClick={handleConsolidation}
                disabled={isConsolidating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConsolidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Consolidation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Progress value={consolidationProgress} className="mb-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{consolidatedData.centersConsolidated} / {consolidatedData.totalCenters} centres</span>
            <span>Dernière mise à jour: {consolidatedData.lastUpdate}</span>
          </div>
        </CardContent>
      </Card>

      {/* KPIs de consolidation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gov-card border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Centres Consolidés</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {consolidatedData.centersConsolidated}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              sur {consolidatedData.totalCenters} centres
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Bureaux Consolidés</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {consolidatedData.bureauxConsolidated}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              sur {consolidatedData.totalBureaux} bureaux
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Total Voix</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {consolidatedData.totalVotes.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              voix consolidées
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">Dernière MAJ</span>
              </div>
              <span className="text-lg font-bold text-orange-600">
                {consolidatedData.lastUpdate}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              mise à jour automatique
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visualisations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Résultats Consolidés par Candidat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Voix']}
                />
                <Bar dataKey="votes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Répartition des Voix</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${((value / consolidatedData.totalVotes) * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Résultats Détaillés Consolidés</span>
            </div>
            <Button
              onClick={exportConsolidatedResults}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Candidat</TableHead>
                <TableHead>Parti</TableHead>
                <TableHead className="text-right">Voix</TableHead>
                <TableHead className="text-right">Pourcentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartData.map((result, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">#{index + 1}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{result.name}</TableCell>
                  <TableCell>
                    {results.find(r => r.candidateName.includes(result.name.split(' ')[0]))?.candidateParty || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {result.votes.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      className="font-medium"
                      style={{ backgroundColor: result.color + '20', color: result.color }}
                    >
                      {result.percentage}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alertes et anomalies */}
      {consolidationProgress < 100 && (
        <Card className="gov-card border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-900">Consolidation en cours</h3>
                <p className="text-sm text-yellow-700">
                  Certains centres n'ont pas encore transmis leurs résultats. 
                  Les données affichées sont partielles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidationSection;
