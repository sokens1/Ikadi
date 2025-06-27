
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
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  X,
  Download,
  RefreshCw
} from 'lucide-react';

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

interface ValidationSectionProps {
  pendingCount: number;
  election: Election;
}

const ValidationSection: React.FC<ValidationSectionProps> = ({ pendingCount, election }) => {
  const [isValidating, setIsValidating] = useState(false);

  // Calcul sécurisé du total des voix avec vérification
  const totalVotes = election && election.candidates && Array.isArray(election.candidates) 
    ? election.candidates.reduce((sum, candidate) => sum + (Math.floor(Math.random() * 5000) + 1000), 0)
    : 0;

  // Mock data pour les PV en attente de validation
  const pendingPVs = [
    {
      id: 'PV001',
      center: 'EPP de l\'Alliance',
      bureau: 'Bureau 03',
      agent: 'A. Nguema',
      time: '18h45',
      status: 'pending',
      anomalies: ['Signature manquante', 'Total incorrect']
    },
    {
      id: 'PV002',
      center: 'Lycée d\'État',
      bureau: 'Bureau 05',
      agent: 'B. Kassa',
      time: '19h12',
      status: 'pending',
      anomalies: ['Photo floue']
    },
    {
      id: 'PV003',
      center: 'Centre Municipal',
      bureau: 'Bureau 02',
      agent: 'C. Mboumba',
      time: '18h30',
      status: 'pending',
      anomalies: ['Votes exprimés > nombre de votants']
    }
  ];

  const handleValidation = async (pvId: string, action: 'approve' | 'reject') => {
    setIsValidating(true);
    // Simulation du processus de validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`PV ${pvId} ${action === 'approve' ? 'approuvé' : 'rejeté'}`);
    setIsValidating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'validated':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statut de validation */}
      <Card className="gov-card border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileCheck className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Validation des PV</h3>
                <p className="text-sm text-gray-600">Vérification et validation des procès-verbaux</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-orange-100 text-orange-800">
                {pendingCount} PV en attente
              </Badge>
              <Button
                variant="outline"
                size="sm"
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Validation...
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.max(0, 25 - pendingCount)}</div>
              <div className="text-sm text-green-700">PV validés</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
              <div className="text-sm text-orange-700">En attente</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">2</div>
              <div className="text-sm text-red-700">Rejetés</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des PV en attente */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>PV en Attente de Validation</span>
            </div>
            <Button
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter la liste
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PV</TableHead>
                <TableHead>Centre/Bureau</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Anomalies</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPVs.map((pv) => (
                <TableRow key={pv.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(pv.status)}
                      <span>{pv.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pv.center}</div>
                      <div className="text-sm text-gray-500">{pv.bureau}</div>
                    </div>
                  </TableCell>
                  <TableCell>{pv.agent}</TableCell>
                  <TableCell>{pv.time}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {pv.anomalies.map((anomaly, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800 text-xs block w-fit">
                          {anomaly}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log(`Voir PV ${pv.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleValidation(pv.id, 'approve')}
                        disabled={isValidating}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleValidation(pv.id, 'reject')}
                        disabled={isValidating}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistiques de validation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="gov-card">
          <CardHeader>
            <CardTitle>Progression de la Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>PV validés</span>
                  <span>{Math.round(((25 - pendingCount) / 25) * 100)}%</span>
                </div>
                <Progress value={((25 - pendingCount) / 25) * 100} />
              </div>
              <div className="text-sm text-gray-600">
                {25 - pendingCount} sur 25 PV validés
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gov-card">
          <CardHeader>
            <CardTitle>Résumé des Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Signatures manquantes</span>
                <Badge className="bg-red-100 text-red-800">3</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Photos illisibles</span>
                <Badge className="bg-red-100 text-red-800">2</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Erreurs de calcul</span>
                <Badge className="bg-red-100 text-red-800">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValidationSection;
