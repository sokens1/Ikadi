
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, MapPin, User, Target } from 'lucide-react';
import OperationStatusBlock from '@/components/campaign/OperationStatusBlock';
import ParticipantsTab from '@/components/campaign/ParticipantsTab';
import ReportAnalysisTab from '@/components/campaign/ReportAnalysisTab';
import DiscussionTab from '@/components/campaign/DiscussionTab';

const OperationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data - en réalité cela viendrait d'une API
  const operation = {
    id: parseInt(id || '1'),
    title: "Grande rencontre citoyenne à Akébé-Ville",
    type: "Meeting",
    date: "2025-01-15",
    time: "14:00",
    endDate: "2025-01-15",
    endTime: "17:00",
    location: "Akébé-Ville, Lomé",
    province: "Maritime",
    city: "Lomé",
    district: "Golfe",
    neighborhood: "Akébé-Ville",
    exactAddress: "Place centrale d'Akébé-Ville",
    responsible: "Jean Dupont",
    status: "Planifiée",
    participants: ["Jean Dupont", "Marie Koffi", "Paul Mensah", "Koffi Adjei"],
    assignedTeams: ["Équipe Jeunes", "Équipe Communication"],
    objectives: "Présenter le programme électoral aux citoyens d'Akébé-Ville et recueillir leurs préoccupations",
    resources: {
      tracts: 500,
      posters: 20,
      tshirts: 15,
      sound: true,
      other: "Bouteilles d'eau, chaises"
    },
    budget: 50000,
    description: "Rencontre avec les citoyens pour présenter le programme électoral"
  };

  const [operationStatus, setOperationStatus] = useState(operation.status);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Meeting': return 'bg-blue-100 text-blue-800';
      case 'Porte-à-porte': return 'bg-purple-100 text-purple-800';
      case 'Distribution': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/campaign')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Retour aux Opérations</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{operation.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <Badge className={getTypeColor(operation.type)}>{operation.type}</Badge>
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>{operation.date} à {operation.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={16} />
                  <span>{operation.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations générales et bloc de statut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Responsable</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User size={16} className="text-gray-500" />
                      <span>{operation.responsible}</span>
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Lieu complet</label>
                    <p className="text-gray-600 mt-1">{operation.exactAddress}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Horaires</label>
                    <p className="text-gray-600 mt-1">
                      De {operation.time} à {operation.endTime}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Équipes assignées</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {operation.assignedTeams.map((team, index) => (
                        <Badge key={index} variant="outline">{team}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-700 flex items-center space-x-2">
                    <Target size={16} />
                    <span>Objectifs</span>
                  </label>
                  <p className="text-gray-600 mt-1">{operation.objectives}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <OperationStatusBlock 
              status={operationStatus} 
              onStatusChange={setOperationStatus}
            />
          </div>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="participants">Participants & Check-in</TabsTrigger>
            <TabsTrigger 
              value="reports"
              disabled={operationStatus !== 'Terminée'}
              className={operationStatus !== 'Terminée' ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Rapport & Analyse
            </TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="mt-4">
            <ParticipantsTab 
              participants={operation.participants}
              operationStatus={operationStatus}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            {operationStatus === 'Terminée' ? (
              <ReportAnalysisTab operationId={operation.id} />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">
                    Cet onglet sera déverrouillé une fois l'opération marquée comme "Terminée"
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discussion" className="mt-4">
            <DiscussionTab operationId={operation.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OperationDetail;
