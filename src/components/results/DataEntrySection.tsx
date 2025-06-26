
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  MapPin,
  TrendingUp,
  Users,
  Flag
} from 'lucide-react';

interface DataEntrySectionProps {
  stats: {
    tauxSaisie: number;
    bureauxSaisis: number;
    totalBureaux: number;
    voixNotreCanidat: number;
    ecartDeuxieme: number;
    anomaliesDetectees: number;
  };
}

const DataEntrySection: React.FC<DataEntrySectionProps> = ({ stats }) => {
  const [expandedCenters, setExpandedCenters] = useState<string[]>([]);
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  // Mock data pour les centres de vote
  const votingCenters = [
    {
      id: 'C001',
      name: 'EPP de l\'Alliance',
      totalBureaux: 8,
      bureauxSaisis: 8,
      status: 'completed',
      bureaux: [
        { id: 'B001', name: 'Bureau 01', status: 'validated', agent: 'A. Nguema', time: '18h05' },
        { id: 'B002', name: 'Bureau 02', status: 'validated', agent: 'B. Kassa', time: '18h12' },
        { id: 'B003', name: 'Bureau 03', status: 'validated', agent: 'C. Mboumba', time: '18h20' },
        { id: 'B004', name: 'Bureau 04', status: 'validated', agent: 'D. Ndong', time: '18h25' },
        { id: 'B005', name: 'Bureau 05', status: 'validated', agent: 'E. Obiang', time: '18h30' },
        { id: 'B006', name: 'Bureau 06', status: 'validated', agent: 'F. Ella', time: '18h35' },
        { id: 'B007', name: 'Bureau 07', status: 'validated', agent: 'G. Mengue', time: '18h40' },
        { id: 'B008', name: 'Bureau 08', status: 'validated', agent: 'H. Nze', time: '18h45' }
      ]
    },
    {
      id: 'C002',
      name: 'Lycée d\'État',
      totalBureaux: 6,
      bureauxSaisis: 5,
      status: 'in-progress',
      bureaux: [
        { id: 'B001', name: 'Bureau 01', status: 'entered', agent: 'C. Mboumba', time: '18h20' },
        { id: 'B002', name: 'Bureau 02', status: 'anomaly', agent: 'I. Koumba', time: '18h15', anomaly: 'Les votes exprimés > nombre de votants' },
        { id: 'B003', name: 'Bureau 03', status: 'entered', agent: 'J. Okouya', time: '18h30' },
        { id: 'B004', name: 'Bureau 04', status: 'entered', agent: 'K. Ngoua', time: '18h25' },
        { id: 'B005', name: 'Bureau 05', status: 'entered', agent: 'L. Bouanga', time: '18h35' },
        { id: 'B006', name: 'Bureau 06', status: 'pending', agent: '', time: '' }
      ]
    },
    {
      id: 'C003',
      name: 'Centre Municipal',
      totalBureaux: 4,
      bureauxSaisis: 3,
      status: 'in-progress',
      bureaux: [
        { id: 'B001', name: 'Bureau 01', status: 'anomaly', agent: 'M. Assele', time: '18h10', anomaly: 'Photo du PV illisible' },
        { id: 'B002', name: 'Bureau 02', status: 'entered', agent: 'N. Mouandza', time: '18h22' },
        { id: 'B003', name: 'Bureau 03', status: 'anomaly', agent: 'O. Bivigou', time: '18h18', anomaly: 'Signature manquante' },
        { id: 'B004', name: 'Bureau 04', status: 'pending', agent: '', time: '' }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'entered':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Validé</Badge>;
      case 'entered':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Saisi</Badge>;
      case 'anomaly':
        return <Badge className="bg-red-100 text-red-800 border-red-200">🚩 Anomalie</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">En attente de saisie</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">En attente</Badge>;
    }
  };

  const getCenterStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const toggleCenter = (centerId: string) => {
    setExpandedCenters(prev =>
      prev.includes(centerId)
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  const filteredCenters = showAnomaliesOnly 
    ? votingCenters.filter(center => 
        center.bureaux.some(bureau => bureau.status === 'anomaly')
      )
    : votingCenters;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gov-card border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Taux de Saisie</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.tauxSaisie}%</span>
            </div>
            <Progress value={stats.tauxSaisie} className="mb-2" />
            <p className="text-xs text-gray-500">
              {stats.bureauxSaisis} bureaux saisis sur {stats.totalBureaux}
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Voix Notre Candidat</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.voixNotreCanidat.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">
              Basé sur les PV déjà saisis
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Flag className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Écart avec le 2ème</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">+{stats.ecartDeuxieme}</span>
            </div>
            <p className="text-xs text-gray-500">
              voix d'avance
            </p>
          </CardContent>
        </Card>

        <Card className="gov-card border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-gray-600">Anomalies Détectées</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats.anomaliesDetectees}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
            >
              {showAnomaliesOnly ? 'Voir tous' : 'Filtrer anomalies'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Vue hiérarchique */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gov-gray">
            <MapPin className="w-5 h-5" />
            <span>Avancement par Centre de Vote</span>
            {showAnomaliesOnly && (
              <Badge className="bg-red-100 text-red-800">Anomalies uniquement</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCenters.map((center) => (
              <div key={center.id} className="border border-gray-200 rounded-lg">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCenter(center.id)}
                >
                  <div className="flex items-center space-x-3">
                    {getCenterStatusIcon(center.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {center.name} ({center.bureauxSaisis} / {center.totalBureaux} saisis)
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {center.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">✔️ Terminé</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">⏳ En cours</Badge>
                        )}
                        <Progress 
                          value={(center.bureauxSaisis / center.totalBureaux) * 100} 
                          className="w-32 h-2"
                        />
                      </div>
                    </div>
                  </div>
                  {expandedCenters.includes(center.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Détails des bureaux */}
                {expandedCenters.includes(center.id) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {center.bureaux
                        .filter(bureau => !showAnomaliesOnly || bureau.status === 'anomaly')
                        .map((bureau) => (
                        <div key={bureau.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(bureau.status)}
                            <div>
                              <span className="font-medium text-sm">{bureau.name}</span>
                              {bureau.agent && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <User className="w-3 h-3" />
                                  <span>{bureau.agent} - {bureau.time}</span>
                                </div>
                              )}
                              {bureau.anomaly && (
                                <div className="text-xs text-red-600 mt-1">
                                  {bureau.anomaly}
                                </div>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(bureau.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEntrySection;
