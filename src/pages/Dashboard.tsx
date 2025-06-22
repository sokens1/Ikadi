
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  MapPin, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const [timeToElection, setTimeToElection] = useState('');

  // Mock data for dashboard
  const dashboardData = {
    nextElection: {
      title: "Élection Présidentielle 2024",
      date: "2024-12-15T08:00:00Z",
      status: "Phase de préparation",
      schedule: "15 Décembre 2024 • 08h00 - 18h00"
    },
    votersRegistered: {
      total: 6210457,
      trend: "+2.3% sur 30 jours"
    },
    infrastructure: {
      centers: 1847,
      bureaux: 2847,
      provinces: 9,
      avgBureauxPerCenter: "1.5/centre"
    },
    pendingPV: {
      count: 37,
      status: "À valider"
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
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToElection(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeToElection("En cours");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
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
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Page Header with notification */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gov-gray">Tableau de Bord</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-400" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                59
              </span>
            </div>
            <Badge variant="outline" className="text-sm font-medium">
              Super-Administrateur
            </Badge>
          </div>
        </div>

        {/* Main Election Banner */}
        <Card className="gov-gradient text-white border-0 overflow-hidden">
          <CardContent className="responsive-padding">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-blue-100">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Prochaine Élection</span>
                </div>
                
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                    {dashboardData.nextElection.title}
                  </h2>
                  <p className="text-blue-100 text-sm lg:text-base mb-3">
                    {dashboardData.nextElection.schedule}
                  </p>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {dashboardData.nextElection.status}
                  </Badge>
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                <div className="text-3xl lg:text-5xl font-bold mb-1">
                  {timeToElection}
                </div>
                <p className="text-blue-200 text-sm">Temps restant</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Électeurs Inscrits */}
          <Card className="gov-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                <span className="hidden sm:inline">Électeurs Inscrits</span>
                <span className="sm:hidden">Électeurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                {dashboardData.votersRegistered.total.toLocaleString('fr-FR')}
              </div>
              <div className="flex items-center text-xs text-green-600 font-medium">
                <span className="text-green-500 mr-1">↗</span>
                {dashboardData.votersRegistered.trend}
              </div>
            </CardContent>
          </Card>

          {/* Centres de Vote */}
          <Card className="gov-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                <span className="hidden sm:inline">Centres de Vote</span>
                <span className="sm:hidden">Centres</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                {dashboardData.infrastructure.centers.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-gray-500">
                Dans {dashboardData.infrastructure.provinces} provinces
              </p>
            </CardContent>
          </Card>

          {/* Bureaux de Vote */}
          <Card className="gov-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                <span className="hidden sm:inline">Bureaux de Vote</span>
                <span className="sm:hidden">Bureaux</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                {dashboardData.infrastructure.bureaux.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-gray-500">
                Moyenne: {dashboardData.infrastructure.avgBureauxPerCenter}
              </p>
            </CardContent>
          </Card>

          {/* PV en Attente */}
          <Card className="gov-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                <span className="hidden sm:inline">PV en Attente</span>
                <span className="sm:hidden">PV</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold text-orange-500 mb-1">
                {dashboardData.pendingPV.count}
              </div>
              <p className="text-xs text-gray-500">
                {dashboardData.pendingPV.status}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray responsive-text">
              <AlertTriangle className="w-5 h-5" />
              <span>Notifications Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {dashboardData.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg mobile-card"
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 break-words">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
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
