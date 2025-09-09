import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  MapPin, 
  BarChart3,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [dashboardData, setDashboardData] = useState({
    nextElection: {
      title: "Aucune élection programmée",
      date: null,
      endTime: "",
      status: "Aucune"
    },
    votersRegistered: {
      total: 0,
      trend: "0%"
    },
    infrastructure: {
      centers: 0,
      provinces: 0,
      bureaux: 0,
      average: 0
    },
    pvsWaiting: {
      count: 0,
      status: "Aucun"
    }
  });
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Récupérer la prochaine élection
        const { data: nextElection } = await supabase
          .from('elections')
          .select('*')
          .gte('election_date', new Date().toISOString())
          .order('election_date', { ascending: true })
          .limit(1)
          .single();

        // 2. Compter les votants
        const { count: votersCount } = await supabase
          .from('voters')
          .select('*', { count: 'exact', head: true });

        // 3. Compter les centres de vote
        const { count: centersCount } = await supabase
          .from('voting_centers')
          .select('*', { count: 'exact', head: true });

        // 4. Compter les bureaux de vote
        const { count: bureauxCount } = await supabase
          .from('voting_bureaux')
          .select('*', { count: 'exact', head: true });

        // 5. Compter les provinces
        const { count: provincesCount } = await supabase
          .from('provinces')
          .select('*', { count: 'exact', head: true });

        // 6. Compter les PVs en attente
        const { count: pvsCount } = await supabase
          .from('procès_verbaux')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Mettre à jour les données
        setDashboardData({
          nextElection: nextElection ? {
            title: nextElection.title,
            date: nextElection.election_date,
            endTime: nextElection.end_time || "18h00",
            status: nextElection.status || "Programmée"
          } : {
            title: "Aucune élection programmée",
            date: null,
            endTime: "",
            status: "Aucune"
          },
          votersRegistered: {
            total: votersCount || 0,
            trend: "+0%"
          },
          infrastructure: {
            centers: centersCount || 0,
            provinces: provincesCount || 0,
            bureaux: bureauxCount || 0,
            average: centersCount && bureauxCount ? (bureauxCount / centersCount).toFixed(1) : 0
          },
          pvsWaiting: {
            count: pvsCount || 0,
            status: pvsCount > 0 ? "À valider" : "Aucun"
          }
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!dashboardData.nextElection.date) return;

    const updateCountdown = () => {
      const now = new Date();
      const electionDate = new Date(dashboardData.nextElection.date);
      const diff = electionDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [dashboardData.nextElection.date]);

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Main Election Banner */}
        <div className="gov-gradient rounded-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-blue-100">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Prochaine Élection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {dashboardData.nextElection.title}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                16 Septembre 2025 • 08h00 - {dashboardData.nextElection.endTime}
              </p>
              <Badge variant="secondary" className="bg-white text-gov-blue font-medium">
                {dashboardData.nextElection.status}
              </Badge>
            </div>
            
            {/* Countdown Display */}
            <div className="flex items-center space-x-2 text-white">
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-2 min-w-[60px]">
                  <div className="text-2xl font-bold">{countdown.days.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-blue-100">Jours</div>
                </div>
              </div>
              <div className="text-2xl font-bold">:</div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-2 min-w-[60px]">
                  <div className="text-2xl font-bold">{countdown.hours.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-blue-100">Heures</div>
                </div>
              </div>
              <div className="text-2xl font-bold">:</div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-2 min-w-[60px]">
                  <div className="text-2xl font-bold">{countdown.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-blue-100">Min</div>
                </div>
              </div>
              <div className="text-2xl font-bold">:</div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-2 min-w-[60px]">
                  <div className="text-2xl font-bold">{countdown.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-blue-100">Sec</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Électeurs Inscrits */}
          <Card className="gov-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Électeurs Inscrits
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                {dashboardData.votersRegistered.total.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-green-600 font-medium flex items-center">
                <span className="mr-1">📈</span>
                {dashboardData.votersRegistered.trend}
              </p>
            </CardContent>
          </Card>

          {/* Centres de Vote */}
          <Card className="gov-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Centres de Vote
              </CardTitle>
              <MapPin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                {dashboardData.infrastructure.centers.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-gray-500">
                Dans {dashboardData.infrastructure.provinces} provinces
              </p>
            </CardContent>
          </Card>

          {/* Bureaux de Vote */}
          <Card className="gov-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Bureaux de Vote
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                {dashboardData.infrastructure.bureaux.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-gray-500">
                Moyenne: {dashboardData.infrastructure.average}/centre
              </p>
            </CardContent>
          </Card>

          {/* PV en Attente */}
          <Card className="gov-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                PV en Attente
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">
                {dashboardData.pvsWaiting.count}
              </div>
              <p className="text-xs text-gray-500">
                {dashboardData.pvsWaiting.status}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Content Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="gov-card">
            <CardHeader>
              <CardTitle className="text-gov-gray">Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Nouveau centre ajouté</span>
                  <span className="text-xs text-gray-500">Il y a 2h</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">PV validé - Centre Nord</span>
                  <span className="text-xs text-gray-500">Il y a 4h</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Utilisateur créé</span>
                  <span className="text-xs text-gray-500">Il y a 6h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card">
            <CardHeader>
              <CardTitle className="text-gov-gray">Alertes Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Maintenance programmée</p>
                    <p className="text-xs text-gray-600 mt-1">Le système sera indisponible ce soir de 22h à 23h</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mise à jour réussie</p>
                    <p className="text-xs text-gray-600 mt-1">Toutes les fonctionnalités sont opérationnelles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
