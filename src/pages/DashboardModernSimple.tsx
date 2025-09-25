import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Building,
  Vote,
  TrendingUp,
  Target,
  Activity,
  Zap,
  Star,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import MetricCard from '@/components/dashboard/MetricCard';
import PerformanceWidget from '@/components/dashboard/PerformanceWidget';

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

const DashboardModernSimple = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    elections: { total: 0, byStatus: {}, upcoming: 0, completed: 0 },
    voters: { total: 0, registered: 0, trend: 0 },
    infrastructure: { centers: 0, bureaux: 0, provinces: 0, communes: 0 },
    performance: { participation: 0, efficiency: 0, satisfaction: 0 }
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

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        addNotification('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addNotification]);

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

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="election-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1e40af]" />
                Élections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">À venir</span>
                <span className="font-semibold text-gray-900">{stats.elections.upcoming}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Terminées</span>
                <span className="font-semibold text-green-600">{stats.elections.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">En cours</span>
                <span className="font-semibold text-orange-600">{stats.elections.byStatus['En cours'] || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="election-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#1e40af]" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Provinces</span>
                <span className="font-semibold text-gray-900">{stats.infrastructure.provinces}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Communes</span>
                <span className="font-semibold text-gray-900">{stats.infrastructure.communes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bureaux</span>
                <span className="font-semibold text-purple-600">{stats.infrastructure.bureaux}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="election-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#1e40af]" />
                Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Système opérationnel</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600">Performance optimale</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-600">Satisfaction élevée</span>
              </div>
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
      </div>
    </Layout>
  );
};

export default DashboardModernSimple;
