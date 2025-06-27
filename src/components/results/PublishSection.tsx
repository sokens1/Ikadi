
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Upload, 
  Download, 
  Users, 
  TrendingUp,
  FileText,
  Eye,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface PublishSectionProps {
  election: Election;
  results: CandidateResult[];
}

const PublishSection: React.FC<PublishSectionProps> = ({ election, results }) => {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Calculate final results based on passed results
  const finalResults = {
    participation: {
      totalInscrits: 12450,
      totalVotants: 8436,
      tauxParticipation: 67.8,
      bulletinsNuls: 156,
      suffragesExprimes: 8280
    },
    candidates: results.map((result, index) => ({
      id: result.candidateId,
      name: result.candidateName,
      party: result.candidateParty,
      votes: result.votes,
      percentage: parseFloat(((result.votes / 8280) * 100).toFixed(1)),
      color: ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'][index] || '#6b7280'
    })),
    validatedBureaux: 44,
    totalBureaux: election.totalBureaux,
    lastUpdate: '19h45'
  };

  // Mock data détaillé par bureau - using real election data
  const detailedResults = [
    {
      center: 'EPP de l\'Alliance',
      bureau: 'Bureau 01',
      inscrits: 350,
      votants: 290,
      ...election.candidates.reduce((acc, candidate, index) => {
        const baseVotes = [135, 95, 60];
        acc[candidate.name] = baseVotes[index] || 0;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      center: 'EPP de l\'Alliance',
      bureau: 'Bureau 02',
      inscrits: 320,
      votants: 275,
      ...election.candidates.reduce((acc, candidate, index) => {
        const baseVotes = [128, 87, 60];
        acc[candidate.name] = baseVotes[index] || 0;
        return acc;
      }, {} as Record<string, number>)
    }
  ];

  const pieChartData = finalResults.candidates.map(candidate => ({
    name: candidate.name,
    value: candidate.votes,
    percentage: candidate.percentage,
    color: candidate.color
  }));

  const barChartData = finalResults.candidates.map(candidate => ({
    name: candidate.name.split(' ').slice(0, 2).join(' '),
    votes: candidate.votes
  }));

  const handlePublish = () => {
    console.log('Publication des résultats...');
    setShowPublishConfirm(false);
    // Logique de publication
  };

  const exportToPDF = () => {
    console.log('Export PDF...');
  };

  const exportToCSV = () => {
    console.log('Export CSV...');
  };

  return (
    <div className="space-y-6">
      {/* Statut de validation */}
      <Card className="gov-card border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Résultats Validés Prêts</h3>
                <p className="text-sm text-gray-600">
                  {finalResults.validatedBureaux} bureaux validés sur {finalResults.totalBureaux} 
                  ({((finalResults.validatedBureaux / finalResults.totalBureaux) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Dernière mise à jour</div>
              <div className="font-medium">{finalResults.lastUpdate}</div>
            </div>
          </div>
          <Progress 
            value={(finalResults.validatedBureaux / finalResults.totalBureaux) * 100} 
            className="mt-3"
          />
        </CardContent>
      </Card>

      {/* Résultats globaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <Users className="w-5 h-5" />
              <span>Participation Électorale</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {finalResults.participation.tauxParticipation}%
                </div>
                <div className="text-sm text-gray-600">Taux de participation</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">
                    {finalResults.participation.totalVotants.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Votants</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {finalResults.participation.totalInscrits.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Inscrits</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {finalResults.participation.suffragesExprimes.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Exprimés</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {finalResults.participation.bulletinsNuls}
                  </div>
                  <div className="text-gray-600">Bulletins nuls</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <BarChart3 className="w-5 h-5" />
              <span>Répartition des Voix</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({percentage}) => `${percentage}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau récapitulatif */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gov-gray">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Résultats Finaux par Candidat</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Données validées uniquement
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {finalResults.candidates.map((candidate, index) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-600">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.party}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: candidate.color }}>
                    {candidate.votes.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {candidate.percentage}% des voix
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Graphique en barres */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="votes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Actions principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="gov-card border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Upload className="w-12 h-12 text-blue-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Publier les Résultats
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Rendre les résultats visibles publiquement sur le tableau de bord
                </p>
                <Button
                  onClick={() => setShowPublishConfirm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  size="lg"
                >
                  🚀 Publier les résultats
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Données Détaillées
                </h3>
              </div>
              
              <Button
                onClick={() => setShowDetailedView(true)}
                variant="outline"
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir le détail par bureau
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={exportToCSV}
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmation de publication */}
      <Dialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Confirmer la Publication</span>
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir publier ces résultats ? Cette action rendra les résultats 
              visibles publiquement sur le tableau de bord et ne pourra pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Résumé de la publication :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {finalResults.validatedBureaux} bureaux validés</li>
                <li>• {finalResults.participation.suffragesExprimes.toLocaleString()} suffrages exprimés</li>
                <li>• Taux de participation : {finalResults.participation.tauxParticipation}%</li>
                <li>• Candidat en tête : {finalResults.candidates[0]?.name} ({finalResults.candidates[0]?.percentage}%)</li>
              </ul>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={handlePublish}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                Confirmer la publication
              </Button>
              <Button
                onClick={() => setShowPublishConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal vue détaillée */}
      <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résultats Détaillés par Bureau de Vote</DialogTitle>
            <DialogDescription>
              Vue complète des résultats validés pour tous les bureaux de vote
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centre de Vote</TableHead>
                  <TableHead>Bureau</TableHead>
                  <TableHead>Inscrits</TableHead>
                  <TableHead>Votants</TableHead>
                  {election.candidates.map((candidate) => (
                    <TableHead key={candidate.id}>{candidate.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.center}</TableCell>
                    <TableCell>{result.bureau}</TableCell>
                    <TableCell>{result.inscrits}</TableCell>
                    <TableCell>{result.votants}</TableCell>
                    {election.candidates.map((candidate) => (
                      <TableCell key={candidate.id} className="font-medium text-green-600">
                        {result[candidate.name] || 0}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublishSection;
