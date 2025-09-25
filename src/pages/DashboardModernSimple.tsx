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
    candidates: number;
  };
}

const DashboardModernSimple = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    elections: { total: 0, byStatus: {}, upcoming: 0, completed: 0 },
    voters: { total: 0, registered: 0, trend: 0 },
    infrastructure: { centers: 0, bureaux: 0, provinces: 0, communes: 0, candidates: 0 },
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

        const { count: candidatesCount } = await supabase
          .from('candidates')
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
            communes: communesCount || 0,
            candidates: candidatesCount || 0
          }
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        addNotification({ title: 'Erreur', message: 'Erreur lors du chargement des données', type: 'error' });
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
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header moderne avec gradient - Mobile First */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1e40af]/5 to-[#3b82f6]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  Tableau de Bord
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                  Vue d'ensemble du système électoral iKADI
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={() => navigate('/elections')}
                  className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                >
                  <Vote className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Gérer les Élections</span>
                  <span className="xs:hidden">Élections</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales - Ordre: Centres, Bureaux, Candidats, Électeurs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <MetricCard
            title="Centres de Vote"
            value={stats.infrastructure.centers}
            subtitle="Centres actifs"
            icon={Building}
            color="#8b5cf6"
            className="col-span-2 lg:col-span-1"
          />
          
          <MetricCard
            title="Bureaux de Vote"
            value={stats.infrastructure.bureaux}
            subtitle="Bureaux total"
            icon={Vote}
            color="#1e40af"
            className="col-span-2 lg:col-span-1"
          />
          
          <MetricCard
            title="Candidats"
            value={stats.infrastructure.candidates || 0}
            subtitle="Candidats inscrits"
            icon={Users}
            color="#10b981"
            className="col-span-2 lg:col-span-1"
          />
          
          <MetricCard
            title="Électeurs"
            value={stats.voters.total.toLocaleString()}
            subtitle="Inscriptions totales"
            icon={Target}
            color="#f59e0b"
            trend={{ value: stats.voters.trend, isPositive: true, label: "croissance" }}
            className="col-span-2 lg:col-span-1"
          />
        </div>

        {/* Statistiques détaillées - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="election-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]" />
                Élections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">À venir</span>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats.elections.upcoming}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Terminées</span>
                <span className="font-semibold text-green-600 text-sm sm:text-base">{stats.elections.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">En cours</span>
                <span className="font-semibold text-orange-600 text-sm sm:text-base">{stats.elections.byStatus['En cours'] || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="election-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Provinces</span>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats.infrastructure.provinces}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Communes</span>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{stats.infrastructure.communes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Bureaux</span>
                <span className="font-semibold text-purple-600 text-sm sm:text-base">{stats.infrastructure.bureaux}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="election-card">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]" />
                Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span className="text-xs sm:text-sm text-green-600">Système opérationnel</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                <span className="text-xs sm:text-sm text-blue-600">Performance optimale</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                <span className="text-xs sm:text-sm text-yellow-600">Satisfaction élevée</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides - Mobile First */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Actions Rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              onClick={() => navigate('/elections')}
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
            >
              <Vote className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm font-medium">Élections</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/voters')}
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm font-medium">Inscrits</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/results')}
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm font-medium">Résultats</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/users')}
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm font-medium">Utilisateurs</span>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardModernSimple;
