
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  MapPin, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const [timeToElection, setTimeToElection] = useState('');

  // Mock data for dashboard
  const dashboardData = {
    nextElection: {
      title: "Élections Législatives 2024",
      date: "2024-12-15T08:00:00Z",
      status: "À venir"
    },
    votersRegistered: {
      total: 145780,
      trend: "+2.3% vs dernière élection"
    },
    infrastructure: {
      centers: 45,
      bureaux: 182
    },
    liveProgress: {
      participation: 67.8,
      pvsEntered: 85.2,
      pvsValidated: 78.9
    },
    notifications: [
      {
        id: 1,
        type: "info",
        title: "Mise à jour système",
        message: "Le système sera mis à jour ce soir à 22h00",
        time: "Il y a 2h"
      },
      {
        id: 2,
        type: "warning",
        title: "Centre de vote Libreville Nord",
        message: "Retard dans la transmission des résultats",
        time: "Il y a 1h"
      },
      {
        id: 3,
        type: "success",
        title: "Validation complète",
        message: "Tous les PV du centre Owendo ont été validés",
        time: "Il y a 30min"
      }
    ]
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const electionDate = new Date(dashboardData.nextElection.date);
      const diff = electionDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeToElection(`${days}j ${hours}h ${minutes}m`);
      } else {
        setTimeToElection("En cours");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Calendar className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gov-gray">Tableau de Bord</h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de la situation électorale en temps réel
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Next Election Card */}
          <Card className="gov-card border-l-4 border-l-gov-blue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray">
                Prochaine Élection
              </CardTitle>
              <Calendar className="h-4 w-4 text-gov-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gov-blue mb-1">
                {timeToElection}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {dashboardData.nextElection.title}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(dashboardData.nextElection.date).toLocaleDateString('fr-FR')}
              </p>
              <Badge variant="secondary" className="mt-2">
                {dashboardData.nextElection.status}
              </Badge>
            </CardContent>
          </Card>

          {/* Registered Voters Card */}
          <Card className="gov-card border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray">
                Électeurs Inscrits
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardData.votersRegistered.total.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-green-600 font-medium">
                {dashboardData.votersRegistered.trend}
              </p>
              <div className="mt-2 h-1 bg-gray-200 rounded">
                <div className="h-1 bg-green-500 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Card */}
          <Card className="gov-card border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray">
                Infrastructure
              </CardTitle>
              <MapPin className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Centres</span>
                  <span className="text-lg font-bold text-gray-900">
                    {dashboardData.infrastructure.centers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bureaux</span>
                  <span className="text-lg font-bold text-gray-900">
                    {dashboardData.infrastructure.bureaux}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Progress Card */}
          <Card className="gov-card border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray">
                Progression Live
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Participation</span>
                  <span className="text-sm font-bold text-green-600">
                    {dashboardData.liveProgress.participation}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">PV Saisis</span>
                  <span className="text-sm font-bold text-blue-600">
                    {dashboardData.liveProgress.pvsEntered}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">PV Validés</span>
                  <span className="text-sm font-bold text-purple-600">
                    {dashboardData.liveProgress.pvsValidated}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <AlertTriangle className="w-5 h-5" />
              <span>Notifications Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
