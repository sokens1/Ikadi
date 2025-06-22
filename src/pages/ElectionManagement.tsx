
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  MapPin, 
  BarChart3,
  Eye,
  ArrowRight
} from 'lucide-react';

const ElectionManagement = () => {
  // Mock data for elections
  const elections = [
    {
      id: 1,
      title: "Élections Législatives 2024",
      date: "2024-12-15",
      status: "À venir",
      statusColor: "blue",
      description: "Élection des députés à l'Assemblée Nationale",
      voters: 145780,
      candidates: 12,
      centers: 45
    },
    {
      id: 2,
      title: "Élections Municipales 2024",
      date: "2024-10-20",
      status: "En cours",
      statusColor: "green",
      description: "Élection des conseillers municipaux",
      voters: 89456,
      candidates: 24,
      centers: 28
    },
    {
      id: 3,
      title: "Élections Locales 2023",
      date: "2023-11-15",
      status: "Terminée",
      statusColor: "gray",
      description: "Élection des conseillers locaux",
      voters: 125630,
      candidates: 18,
      centers: 38
    }
  ];

  const getStatusVariant = (color: string) => {
    switch (color) {
      case 'blue': return 'default';
      case 'green': return 'secondary';
      case 'gray': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gov-gray">Gestion des Élections</h1>
            <p className="text-gray-600 mt-2">
              Gérez et supervisez toutes les élections de votre circonscription
            </p>
          </div>
          <Button className="gov-bg-primary hover:bg-gov-blue-dark">
            <Calendar className="w-4 h-4 mr-2" />
            Nouvelle Élection
          </Button>
        </div>

        {/* Elections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {elections.map((election) => (
            <Card key={election.id} className="gov-card hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gov-gray">
                    {election.title}
                  </CardTitle>
                  <Badge variant={getStatusVariant(election.statusColor)}>
                    {election.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{election.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gov-blue" />
                    <span className="font-medium">
                      {new Date(election.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <Users className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {election.voters.toLocaleString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">Électeurs</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {election.candidates}
                      </div>
                      <div className="text-xs text-gray-500">Candidats</div>
                    </div>
                    <div className="text-center">
                      <MapPin className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {election.centers}
                      </div>
                      <div className="text-xs text-gray-500">Centres</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 group"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir Détails
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gov-card border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-600">Élections Totales</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">1</div>
                  <div className="text-sm text-gray-600">En Cours</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">360K+</div>
                  <div className="text-sm text-gray-600">Total Électeurs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">111</div>
                  <div className="text-sm text-gray-600">Total Centres</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ElectionManagement;
