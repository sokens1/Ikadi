import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  MapPin, 
  BarChart3,
  Clock,
  Plus,
  FileText,
  UserPlus,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
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
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    type: 'voter' | 'election' | 'pv' | 'user';
    action: string;
    description: string;
    timestamp: string;
    icon: React.ReactNode;
  }>>([]);
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

        // 7. Récupérer les activités récentes
        const activities = [];
        
        // Derniers votants ajoutés
        const { data: recentVoters } = await supabase
          .from('voters')
          .select('first_name, last_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (recentVoters) {
          recentVoters.forEach((voter, index) => {
            activities.push({
              id: `voter_${index}`,
              type: 'voter' as const,
              action: 'Nouveau votant',
              description: `${voter.first_name} ${voter.last_name}`,
              timestamp: new Date(voter.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              icon: <UserPlus className="w-4 h-4 text-blue-500" />
            });
          });
        }

        // Dernières élections créées
        const { data: recentElections } = await supabase
          .from('elections')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(2);
        
        if (recentElections) {
          recentElections.forEach((election, index) => {
            activities.push({
              id: `election_${index}`,
              type: 'election' as const,
              action: 'Élection créée',
              description: election.title,
              timestamp: new Date(election.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              icon: <FileText className="w-4 h-4 text-green-500" />
            });
          });
        }

        // PVs récents
        const { data: recentPVs } = await supabase
          .from('procès_verbaux')
          .select('status, created_at')
          .order('created_at', { ascending: false })
          .limit(2);
        
        if (recentPVs) {
          recentPVs.forEach((pv, index) => {
            activities.push({
              id: `pv_${index}`,
              type: 'pv' as const,
              action: 'PV soumis',
              description: `Statut: ${pv.status}`,
              timestamp: new Date(pv.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              icon: <CheckCircle className="w-4 h-4 text-orange-500" />
            });
          });
        }

        // Trier par timestamp et prendre les 5 plus récents
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivities(activities.slice(0, 5));

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
                {dashboardData.nextElection.date ? new Date(dashboardData.nextElection.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                {dashboardData.nextElection.endTime ? ` • ${dashboardData.nextElection.endTime}` : ''}
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

        {/* Actions rapides */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <Activity className="w-5 h-5" />
              <span>Actions Rapides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate('/voters')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                variant="outline"
              >
                <UserPlus className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Ajouter Votant</span>
              </Button>
              
              <Button
                onClick={() => navigate('/elections')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 border-green-200"
                variant="outline"
              >
                <Plus className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-800">Nouvelle Élection</span>
              </Button>
              
              <Button
                onClick={() => navigate('/results')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 border-orange-200"
                variant="outline"
              >
                <FileText className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Saisir PV</span>
              </Button>
              
              <Button
                onClick={() => navigate('/users')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 border-purple-200"
                variant="outline"
              >
                <Settings className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Gestion</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activités récentes et alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gov-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gov-gray">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Activité Récente</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {recentActivities.length} activités
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      </div>
                      <div className="flex-shrink-0 text-xs text-gray-500">
                        {activity.timestamp}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune activité récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gov-gray">
                <AlertTriangle className="w-5 h-5" />
                <span>Alertes & Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.pvsWaiting.count > 0 ? (
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800">
                        {dashboardData.pvsWaiting.count} PV en attente de validation
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Des procès-verbaux nécessitent votre attention
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => navigate('/results')}
                      >
                        Voir les PV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Aucun PV en attente
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Tous les procès-verbaux sont à jour
                      </p>
                    </div>
                  </div>
                )}

                {dashboardData.nextElection.date && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Prochaine élection programmée
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {dashboardData.nextElection.title} - {countdown.days} jours restants
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
