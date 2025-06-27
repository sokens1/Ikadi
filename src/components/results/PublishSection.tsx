
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

interface Election {
  id: string;
  name: string;
  date: string;
  status: string;
  candidates: Array<{
    id: string;
    name: string;
    party: string;
    photo?: string;
  }>;
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
  election?: Election;
  results?: CandidateResult[];
}

const PublishSection: React.FC<PublishSectionProps> = ({ election, results = [] }) => {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Générer des données finales basées sur l'élection courante
  const generateFinalResults = () => {
    if (!election) {
      return {
        participation: {
          totalInscrits: 0,
          totalVotants: 0,
          tauxParticipation: 0,
          bulletinsNuls: 0,
          suffragesExprimes: 0
        },
        candidates: [],
        validatedBureaux: 0,
        totalBureaux: 0,
        lastUpdate: '00h00'
      };
    }

    const totalInscrits = 12450;
    const totalVotants = 8436;
    const bulletinsNuls = 156;
    const suffragesExprimes = totalVotants - bulletinsNuls;

    // Utiliser les candidats de l'élection avec les résultats fournis
    const candidates = election.candidates.map((candidate, index) => {
      const result = results.find(r => r.candidateId === candidate.id);
      const votes = result?.votes || (3000 + (index * 500) + Math.floor(Math.random() * 1000));
      const percentage = ((votes / suffragesExprimes) * 100);
      
      return {
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        votes: votes,
        percentage: parseFloat(percentage.toFixed(1)),
        color: index === 0 ? '#22c55e' : index === 1 ? '#ef4444' : '#3b82f6'
      };
    });

    // Trier par nombre de voix
    candidates.sort((a, b) => b.votes - a.votes);

    return {
      participation: {
        totalInscrits,
        totalVotants,
        tauxParticipation: parseFloat(((totalVotants / totalInscrits) * 100).toFixed(1)),
        bulletinsNuls,
        suffragesExprimes
      },
      candidates,
      validatedBureaux: Math.floor(election.totalBureaux * 0.9),
      totalBureaux: election.totalBureaux,
      lastUpdate: '19h45'
    };
  };

  const finalResults = generateFinalResults();

  // Mock data détaillé par bureau
  const detailedResults = [
    {
      center: 'EPP de l\'Alliance',
      bureau: 'Bureau 01',
      inscrits: 350,
      votants: 290,
      notreCandidat: 135,
      adversaire1: 95,
      adversaire2: 60
    },
    {
      center: 'EPP de l\'Alliance',
      bureau: 'Bureau 02',
      inscrits: 320,
      votants: 275,
      notreCandidat: 128,
      adversaire1: 87,
      adversaire2: 60
    },
    // ... autres bureaux
  ];

  const pieChartData = finalResults.candidates.map(candidate => ({
    name: candidate.name,
    value: candidate.votes,
    percentage: candidate.percentage,
    color: candidate.color
  }));

  const barChartData = finalResults.candidates.map(candidate => ({
    name: candidate.name.split(' ')[0] + ' ' + candidate.name.split(' ')[1],
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

  if (!election) {
    return (
      <Card className="gov-card">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Veuillez sélectionner une élection pour voir les résultats.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Affichage de l'élection courante */}
      <Card className="gov-card bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">{election.name}</h3>
              <p className="text-sm text-blue-700">{election.candidates.length} candidats • {election.totalBureaux} bureaux</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {election.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

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
        {/* KPIs de participation */}
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

        {/* Graphique camembert */}
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
        {/* Publication */}
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

        {/* Vue détaillée et export */}
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
                  <TableHead>Notre Candidat</TableHead>
                  <TableHead>Adversaire 1</TableHead>
                  <TableHead>Adversaire 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.center}</TableCell>
                    <TableCell>{result.bureau}</TableCell>
                    <TableCell>{result.inscrits}</TableCell>
                    <TableCell>{result.votants}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {result.notreCandidat}
                    </TableCell>
                    <TableCell>{result.adversaire1}</TableCell>
                    <TableCell>{result.adversaire2}</TableCell>
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
