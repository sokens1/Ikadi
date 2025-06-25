
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, List, Plus, Filter, Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateOperationWizard from '@/components/campaign/CreateOperationWizard';
import { useNavigate } from 'react-router-dom';

const CampaignManagement = () => {
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'settings'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const navigate = useNavigate();

  // Mock data pour les opérations de campagne
  const operations = [
    {
      id: 1,
      title: "Grande rencontre citoyenne à Akébé-Ville",
      type: "Meeting",
      date: "2025-01-15",
      time: "14:00",
      location: "Akébé-Ville, Lomé",
      responsible: "Jean Dupont",
      status: "Planifiée",
      participants: 25,
      description: "Rencontre avec les citoyens pour présenter le programme électoral"
    },
    {
      id: 2,
      title: "Porte-à-porte Quartier Nyékonakpoé",
      type: "Porte-à-porte",
      date: "2025-01-18",
      time: "09:00",
      location: "Nyékonakpoé, Lomé",
      responsible: "Marie Koffi",
      status: "En cours",
      participants: 12,
      description: "Canvassing dans le quartier résidentiel"
    },
    {
      id: 3,
      title: "Distribution de tracts Marché d'Assigamé",
      type: "Distribution",
      date: "2025-01-20",
      time: "07:00",
      location: "Marché d'Assigamé, Lomé",
      responsible: "Paul Mensah",
      status: "Terminée",
      participants: 8,
      description: "Distribution matinale au marché"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planifiée': return 'bg-gray-100 text-gray-800';
      case 'En cours': return 'bg-orange-100 text-orange-800';
      case 'Terminée': return 'bg-green-100 text-green-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Meeting': return 'bg-blue-100 text-blue-800';
      case 'Porte-à-porte': return 'bg-purple-100 text-purple-800';
      case 'Distribution': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ListView = () => (
    <div className="space-y-4">
      {operations.map(operation => (
        <Card 
          key={operation.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/campaign/operation/${operation.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg text-gray-900">{operation.title}</h3>
              <div className="flex space-x-2">
                <Badge className={getTypeColor(operation.type)}>{operation.type}</Badge>
                <Badge className={getStatusColor(operation.status)}>{operation.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Date:</span> {operation.date}
              </div>
              <div>
                <span className="font-medium">Heure:</span> {operation.time}
              </div>
              <div>
                <span className="font-medium">Lieu:</span> {operation.location}
              </div>
              <div>
                <span className="font-medium">Responsable:</span> {operation.responsible}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">{operation.description}</p>
            <div className="mt-3 text-sm text-gray-500">
              {operation.participants} participants assignés
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const CalendarView = () => (
    <div className="grid grid-cols-7 gap-4">
      <div className="text-center font-medium text-gray-600 py-2">Lun</div>
      <div className="text-center font-medium text-gray-600 py-2">Mar</div>
      <div className="text-center font-medium text-gray-600 py-2">Mer</div>
      <div className="text-center font-medium text-gray-600 py-2">Jeu</div>
      <div className="text-center font-medium text-gray-600 py-2">Ven</div>
      <div className="text-center font-medium text-gray-600 py-2">Sam</div>
      <div className="text-center font-medium text-gray-600 py-2">Dim</div>
      
      {Array.from({ length: 35 }, (_, i) => {
        const day = i - 2;
        const hasOperation = operations.some(op => new Date(op.date).getDate() === day);
        const operation = operations.find(op => new Date(op.date).getDate() === day);
        
        return (
          <div key={i} className="min-h-[100px] border border-gray-200 rounded-lg p-2">
            {day > 0 && day <= 31 && (
              <>
                <div className="text-sm font-medium text-gray-700 mb-1">{day}</div>
                {hasOperation && operation && (
                  <div 
                    className="bg-blue-100 text-blue-800 text-xs p-1 rounded cursor-pointer hover:bg-blue-200"
                    onClick={() => navigate(`/campaign/operation/${operation.id}`)}
                  >
                    {operation.title.substring(0, 20)}...
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications d'opérations</h4>
              <p className="text-sm text-gray-600">Recevoir des alertes pour les nouvelles opérations</p>
            </div>
            <Button variant="outline" size="sm">Activé</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Rappels automatiques</h4>
              <p className="text-sm text-gray-600">Rappels 24h avant chaque opération</p>
            </div>
            <Button variant="outline" size="sm">Activé</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Préférences d'affichage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Vue par défaut</label>
            <Select defaultValue="calendar">
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendar">Calendrier</SelectItem>
                <SelectItem value="list">Liste</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Nombre d'opérations par page</label>
            <Select defaultValue="10">
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des équipes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-assignation</h4>
              <p className="text-sm text-gray-600">Assigner automatiquement les volontaires disponibles</p>
            </div>
            <Button variant="outline" size="sm">Désactivé</Button>
          </div>
          <div>
            <label className="text-sm font-medium">Limite de participants par opération</label>
            <Input type="number" defaultValue="30" className="mt-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ViewToggle = () => (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <Button
        variant={activeView === 'calendar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveView('calendar')}
        className="flex items-center space-x-2"
      >
        <Calendar size={16} />
        <span>Calendrier</span>
      </Button>
      <Button
        variant={activeView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveView('list')}
        className="flex items-center space-x-2"
      >
        <List size={16} />
        <span>Liste</span>
      </Button>
      <Button
        variant={activeView === 'settings' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveView('settings')}
        className="flex items-center space-x-2"
      >
        <Settings size={16} />
        <span>Paramètres</span>
      </Button>
    </div>
  );

  const FilterBar = () => (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Rechercher une opération..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tous">Tous les statuts</SelectItem>
          <SelectItem value="planifiee">Planifiée</SelectItem>
          <SelectItem value="en-cours">En cours</SelectItem>
          <SelectItem value="terminee">Terminée</SelectItem>
          <SelectItem value="annulee">Annulée</SelectItem>
        </SelectContent>
      </Select>
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrer par type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tous">Tous les types</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="porte-a-porte">Porte-à-porte</SelectItem>
          <SelectItem value="distribution">Distribution</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'calendar':
        return <CalendarView />;
      case 'list':
        return <ListView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CalendarView />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Opérations de Campagne</h1>
            <p className="text-gray-600 mt-2">Planifiez, suivez et analysez vos actions de terrain</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setIsWizardOpen(true)}
              className="bg-gov-blue hover:bg-gov-blue-dark text-white flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Planifier une Opération</span>
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Opérations ce mois</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">En cours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Terminées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">156</div>
              <div className="text-sm text-gray-600">Participants mobilisés</div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de contrôles */}
        <div className="flex justify-between items-center">
          <ViewToggle />
          {activeView !== 'settings' && (
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Filtres</span>
            </div>
          )}
        </div>

        {/* Barre de filtres - seulement pour les vues calendrier et liste */}
        {activeView !== 'settings' && <FilterBar />}

        {/* Vue active */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {renderActiveView()}
        </div>

        {/* Wizard Modal */}
        <CreateOperationWizard 
          open={isWizardOpen} 
          onOpenChange={setIsWizardOpen} 
        />
      </div>
    </Layout>
  );
};

export default CampaignManagement;
