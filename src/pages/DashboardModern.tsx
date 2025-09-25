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
  Building,
  BarChart3,
  Clock,
  Plus,
  FileText,
  UserPlus,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  ArrowRight,
  Target,
  Vote,
  Award,
  Globe,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DonutChart from '@/components/charts/DonutChart';
import ProgressRing from '@/components/charts/ProgressRing';
import MetricCard from '@/components/dashboard/MetricCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PerformanceWidget from '@/components/dashboard/PerformanceWidget';
import AlertWidget from '@/components/dashboard/AlertWidget';

interface DashboardStats {
  elections: {
    total: number;
    byStatus: { [key: string]: number };
    upcoming: number;
    completed: number;
  };
  voters: {
    total: number;
    registered: number;
    trend: number;
  };
  infrastructure: {
    centers: number;
    bureaux: number;
    provinces: number;
    communes: number;
  };
  performance: {
    participation: number;
    efficiency: number;
    satisfaction: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'election' | 'voter' | 'center' | 'candidate';
  action: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const DashboardModern = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    elections: { total: 0, byStatus: {}, upcoming: 0, completed: 0 },
    voters: { total: 0, registered: 0, trend: 0 },
    infrastructure: { centers: 0, bureaux: 0, provinces: 0, communes: 0 },
    performance: { participation: 0, efficiency: 0, satisfaction: 0 }
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    dismissible?: boolean;
  }>>([]);
  const [chartData, setChartData] = useState({
    voterTrend: [] as Array<{ x: string; y: number }>,
    electionStatus: [] as Array<{ label: string; value: number; color?: string }>,
    participationByProvince: [] as Array<{ label: string; value: number }>,
    monthlyElections: [] as Array<{ label: string; value: number }>
  });

  // Charger les données du tableau de bord
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Statistiques des élections
        const { data: electionsData } = await supabase
          .from('elections')
          .select('id, status, election_date, created_at');

        const electionsByStatus = electionsData?.reduce((acc, election) => {
          acc[election.status || 'À venir'] = (acc[election.status || 'À venir'] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }) || {};

        const upcomingElections = electionsData?.filter(e => 
          new Date(e.election_date) > new Date()
        ).length || 0;

        const completedElections = electionsData?.filter(e => 
          e.status === 'Terminée'
        ).length || 0;

        // 2. Statistiques des électeurs
        const { data: votersData } = await supabase
          .from('voters')
          .select('id, created_at');

        const { data: centersData } = await supabase
          .from('voting_centers')
          .select('id, total_voters');

        const totalVoters = centersData?.reduce((sum, center) => 
          sum + (center.total_voters || 0), 0) || 0;

        // 3. Infrastructure
        const { count: centersCount } = await supabase
          .from('voting_centers')
          .select('*', { count: 'exact', head: true });

        const { count: bureauxCount } = await supabase
          .from('voting_bureaux')
          .select('*', { count: 'exact', head: true });

        const { count: provincesCount } = await supabase
          .from('provinces')
          .select('*', { count: 'exact', head: true });

        const { count: communesCount } = await supabase
          .from('communes')
          .select('*', { count: 'exact', head: true });

        // 4. Données pour les graphiques
        const voterTrendData = generateVoterTrendData();
        const electionStatusData = Object.entries(electionsByStatus).map(([status, count]) => ({
          label: status,
          value: count,
          color: getStatusColor(status)
        }));

        const participationData = generateParticipationData();
        const monthlyElectionsData = generateMonthlyElectionsData();

        setStats({
          elections: {
            total: electionsData?.length || 0,
            byStatus: electionsByStatus,
            upcoming: upcomingElections,
            completed: completedElections
          },
          voters: {
            total: totalVoters,
            registered: votersData?.length || 0,
            trend: 12.5 // Simulé
          },
          infrastructure: {
            centers: centersCount || 0,
            bureaux: bureauxCount || 0,
            provinces: provincesCount || 0,
            communes: communesCount || 0
          },
          performance: {
            participation: 78.5,
            efficiency: 92.3,
            satisfaction: 88.7
          }
        });

        setChartData({
          voterTrend: voterTrendData,
          electionStatus: electionStatusData,
          participationByProvince: participationData,
          monthlyElections: monthlyElectionsData
        });

        // 5. Activités récentes
        setRecentActivities(generateRecentActivities());

        // 6. Alertes système
        setSystemAlerts(generateSystemAlerts());

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        addNotification('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addNotification]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'À venir': return '#6b7280';
      case 'En cours': return '#f59e0b';
      case 'Terminée': return '#10b981';
      case 'Annulée': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const generateVoterTrendData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    return months.map(month => ({
      x: month,
      y: Math.floor(Math.random() * 1000) + 500
    }));
  };

  const generateParticipationData = () => {
    return [
      { label: 'Haut-Ogooué', value: 85 },
      { label: 'Ogooué-Maritime', value: 78 },
      { label: 'Estuaire', value: 92 },
      { label: 'Moyen-Ogooué', value: 67 },
      { label: 'Ngounié', value: 74 }
    ];
  };

  const generateMonthlyElectionsData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    return months.map(month => ({
      label: month,
      value: Math.floor(Math.random() * 5) + 1
    }));
  };

  const generateRecentActivities = (): RecentActivity[] => {
    return [
      {
        id: '1',
        type: 'election',
        action: 'Créée',
        description: 'Élection Législatives 2025 - Moanda',
        timestamp: 'Il y a 2 heures',
        icon: Vote,
        color: 'text-blue-600'
      },
      {
        id: '2',
        type: 'voter',
        action: 'Inscrit',
        description: '150 nouveaux électeurs enregistrés',
        timestamp: 'Il y a 4 heures',
        icon: UserPlus,
        color: 'text-green-600'
      },
      {
        id: '3',
        type: 'center',
        action: 'Ajouté',
        description: 'Centre de vote "École Primaire"',
        timestamp: 'Il y a 6 heures',
        icon: Building,
        color: 'text-purple-600'
      },
      {
        id: '4',
        type: 'candidate',
        action: 'Enregistré',
        description: 'Candidat: Jean MABIKA',
        timestamp: 'Il y a 8 heures',
        icon: Award,
        color: 'text-orange-600'
      }
    ];
  };

  const generateSystemAlerts = () => {
    return [
      {
        id: '1',
        type: 'success',
        title: 'Système Opérationnel',
        message: 'Tous les services fonctionnent normalement',
        timestamp: 'Il y a 5 minutes',
        dismissible: true
      },
      {
        id: '2',
        type: 'info',
        title: 'Mise à Jour Disponible',
        message: 'Une nouvelle version du système est disponible',
        timestamp: 'Il y a 1 heure',
        action: {
          label: 'Voir les détails',
          onClick: () => console.log('Voir les détails de la mise à jour')
        },
        dismissible: true
      },
      {
        id: '3',
        type: 'warning',
        title: 'Maintenance Programmée',
        message: 'Maintenance prévue demain de 2h à 4h',
        timestamp: 'Il y a 3 heures',
        dismissible: true
      }
    ];
  };

  const handleDismissAlert = (alertId: string) => {
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e40af] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header moderne avec gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1e40af]/5 to-[#3b82f6]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Tableau de Bord
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                  Vue d'ensemble du système électoral iKADI
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={() => navigate('/elections')}
                  className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Vote className="h-4 w-4 mr-2" />
                  Gérer les Élections
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/voters')}
                  className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af] hover:text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Électeurs
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Élections"
            value={stats.elections.total}
            subtitle="Système actif"
            icon={Vote}
            color="#1e40af"
            trend={{ value: 5.2, isPositive: true, label: "ce mois" }}
          />
          
          <MetricCard
            title="Électeurs Inscrits"
            value={stats.voters.total.toLocaleString()}
            subtitle="Inscriptions totales"
            icon={Users}
            color="#10b981"
            trend={{ value: stats.voters.trend, isPositive: true, label: "croissance" }}
          />
          
          <MetricCard
            title="Centres de Vote"
            value={stats.infrastructure.centers}
            subtitle={`${stats.infrastructure.bureaux} bureaux`}
            icon={Building}
            color="#8b5cf6"
          />
          
          <MetricCard
            title="Taux de Participation"
            value={`${stats.performance.participation}%`}
            subtitle="Moyenne générale"
            icon={Target}
            color="#f59e0b"
            trend={{ value: 2.1, isPositive: true, label: "vs mois dernier" }}
          />
        </div>

        {/* Graphiques et visualisations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des inscriptions */}
          <Card className="election-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#1e40af]" />
                Évolution des Inscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={chartData.voterTrend} 
                color="#1e40af"
                height={250}
                showArea={true}
                showDots={true}
              />
            </CardContent>
          </Card>

          {/* Statut des élections */}
          <Card className="election-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[#1e40af]" />
                Répartition des Élections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <DonutChart 
                  data={chartData.electionStatus} 
                  size={200}
                  showLabels={true}
                  showValues={true}
                  centerContent={
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.elections.total}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Participation par province */}
          <Card className="election-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#1e40af]" />
                Participation par Province
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={chartData.participationByProvince} 
                height={250}
                showValues={true}
                horizontal={true}
              />
            </CardContent>
          </Card>

          {/* Élections mensuelles */}
          <Card className="election-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1e40af]" />
                Élections par Mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={chartData.monthlyElections} 
                height={250}
                showValues={true}
                color="#10b981"
              />
            </CardContent>
          </Card>
        </div>

        {/* Indicateurs de performance */}
        <PerformanceWidget
          metrics={[
            {
              label: "Efficacité",
              value: stats.performance.efficiency,
              target: 90,
              color: "#10b981",
              icon: Zap,
              description: "Système opérationnel"
            },
            {
              label: "Satisfaction",
              value: stats.performance.satisfaction,
              target: 85,
              color: "#f59e0b",
              icon: Star,
              description: "Utilisateurs satisfaits"
            },
            {
              label: "Participation",
              value: stats.performance.participation,
              target: 80,
              color: "#8b5cf6",
              icon: Target,
              description: "Taux moyen"
            }
          ]}
        />

        {/* Alertes et activités */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertWidget
            alerts={systemAlerts}
            onDismiss={handleDismissAlert}
          />
          <ActivityFeed
            activities={recentActivities}
            maxItems={5}
          />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardModern;
