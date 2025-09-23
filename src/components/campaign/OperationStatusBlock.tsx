
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, XCircle } from 'lucide-react';

interface OperationStatusBlockProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
}

const OperationStatusBlock = ({ status, onStatusChange }: OperationStatusBlockProps) => {
  const getStatusConfig = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Planifiée':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          description: 'L\'opération est programmée'
        };
      case 'En cours':
        return {
          color: 'bg-orange-100 text-orange-800 animate-pulse',
          icon: Play,
          description: 'L\'opération est en cours d\'exécution'
        };
      case 'Terminée':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          description: 'L\'opération s\'est terminée avec succès'
        };
      case 'Annulée':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          description: 'L\'opération a été annulée'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          description: 'Statut inconnu'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    
    // Si on passe en "En cours", on pourrait déclencher une notification
    if (newStatus === 'En cours') {
      console.log('Notification envoyée aux participants : Opération démarrée');
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <StatusIcon size={20} />
          <span>Statut de l'Opération</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge className={`text-lg px-4 py-2 ${statusConfig.color}`}>
            {status}
          </Badge>
          <p className="text-sm text-gray-600 mt-2">{statusConfig.description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Changer le statut :</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={status === 'Planifiée' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('Planifiée')}
              disabled={status === 'Planifiée'}
            >
              Planifiée
            </Button>
            <Button
              variant={status === 'En cours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('En cours')}
              disabled={status === 'En cours'}
              className={status === 'En cours' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              En cours
            </Button>
            <Button
              variant={status === 'Terminée' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('Terminée')}
              disabled={status === 'Terminée'}
              className={status === 'Terminée' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              Terminée
            </Button>
            <Button
              variant={status === 'Annulée' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('Annulée')}
              disabled={status === 'Annulée'}
            >
              Annulée
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationStatusBlock;
