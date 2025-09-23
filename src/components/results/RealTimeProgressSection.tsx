
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  ChevronRight, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Building2
} from 'lucide-react';

const RealTimeProgressSection = () => {
  const [selectedLevel, setSelectedLevel] = useState('overview');
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

  // Mock data pour la progression hiérarchique
  const progressData = {
    overview: {
      totalCenters: 45,
      completedCenters: 38,
      inProgressCenters: 5,
      pendingCenters: 2,
      totalBureaux: 182,
      completedBureaux: 155,
      progressPercentage: 85.2
    },
    centers: [
      {
        id: 'C001',
        name: 'Centre Libreville Nord',
        location: 'Libreville, Estuaire',
        totalBureaux: 8,
        completedBureaux: 8,
        status: 'completed',
        percentage: 100,
        lastUpdate: '14:30'
      },
      {
        id: 'C002',
        name: 'Centre Owendo',
        location: 'Owendo, Estuaire',
        totalBureaux: 6,
        completedBureaux: 5,
        status: 'in-progress',
        percentage: 83.3,
        lastUpdate: '14:25'
      },
      {
        id: 'C003',
        name: 'Centre Port-Gentil Centre',
        location: 'Port-Gentil, Ogooué-Maritime',
        totalBureaux: 10,
        completedBureaux: 2,
        status: 'delayed',
        percentage: 20,
        lastUpdate: '13:45'
      }
    ]
  };

  const bureauData = {
    'C002': [
      { id: 'BV001', name: 'Bureau 001', status: 'completed', percentage: 100, lastUpdate: '14:20' },
      { id: 'BV002', name: 'Bureau 002', status: 'completed', percentage: 100, lastUpdate: '14:15' },
      { id: 'BV003', name: 'Bureau 003', status: 'completed', percentage: 100, lastUpdate: '14:10' },
      { id: 'BV004', name: 'Bureau 004', status: 'completed', percentage: 100, lastUpdate: '14:05' },
      { id: 'BV005', name: 'Bureau 005', status: 'completed', percentage: 100, lastUpdate: '14:00' },
      { id: 'BV006', name: 'Bureau 006', status: 'in-progress', percentage: 0, lastUpdate: '—' }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Terminé</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">En Cours</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Retard</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">En Attente</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'delayed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gov-gray">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Progression Globale de la Saisie</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {progressData.overview.progressPercentage}% Complété
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {progressData.overview.completedCenters}
              </div>
              <div className="text-sm text-gray-600">Centres Terminés</div>
              <div className="text-xs text-gray-500">
                sur {progressData.overview.totalCenters} centres
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {progressData.overview.inProgressCenters}
              </div>
              <div className="text-sm text-gray-600">Centres En Cours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {progressData.overview.pendingCenters}
              </div>
              <div className="text-sm text-gray-600">Centres En Attente</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression des Bureaux</span>
              <span>{progressData.overview.completedBureaux}/{progressData.overview.totalBureaux}</span>
            </div>
            <Progress value={progressData.overview.progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Liste des centres */}
      <Card className="gov-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gov-gray">
            <Building2 className="w-5 h-5" />
            <span>Progression par Centre de Vote</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.centers.map((center) => (
              <div key={center.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(center.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{center.name}</h3>
                      <p className="text-sm text-gray-600">{center.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(center.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCenter(selectedCenter === center.id ? null : center.id)}
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Détails</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        selectedCenter === center.id ? 'rotate-90' : ''
                      }`} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bureaux complétés</span>
                    <span>{center.completedBureaux}/{center.totalBureaux}</span>
                  </div>
                  <Progress value={center.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{center.percentage}% complété</span>
                    <span>Dernière mise à jour: {center.lastUpdate}</span>
                  </div>
                </div>

                {/* Détails des bureaux */}
                {selectedCenter === center.id && bureauData[center.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Détail des Bureaux de Vote</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {bureauData[center.id].map((bureau) => (
                        <div key={bureau.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(bureau.status)}
                            <span className="font-medium text-sm">{bureau.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(bureau.status)}
                            <span className="text-xs text-gray-500">{bureau.lastUpdate}</span>
                          </div>
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

export default RealTimeProgressSection;
