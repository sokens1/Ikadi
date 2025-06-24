
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { User, UserCheck, UserX } from 'lucide-react';

interface ParticipantsTabProps {
  participants: string[];
  operationStatus: string;
}

const ParticipantsTab = ({ participants, operationStatus }: ParticipantsTabProps) => {
  const [checkInStatus, setCheckInStatus] = useState<Record<string, 'present' | 'absent' | null>>(
    participants.reduce((acc, participant) => ({ ...acc, [participant]: null }), {})
  );

  const handleCheckIn = (participant: string, status: 'present' | 'absent') => {
    setCheckInStatus(prev => ({
      ...prev,
      [participant]: prev[participant] === status ? null : status
    }));
  };

  const getCheckInStats = () => {
    const present = Object.values(checkInStatus).filter(status => status === 'present').length;
    const absent = Object.values(checkInStatus).filter(status => status === 'absent').length;
    const pending = participants.length - present - absent;
    
    return { present, absent, pending };
  };

  const stats = getCheckInStats();
  const canCheckIn = operationStatus === 'En cours' || operationStatus === 'Terminée';

  return (
    <div className="space-y-4">
      {/* Statistiques de check-in */}
      {canCheckIn && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-600">Présents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-600">Absents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User size={20} />
            <span>Équipe Assignée ({participants.length} membres)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participants.map((participant, index) => {
              const status = checkInStatus[participant];
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <span className="font-medium">{participant}</span>
                    {status && (
                      <Badge 
                        variant={status === 'present' ? 'default' : 'destructive'}
                        className={status === 'present' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {status === 'present' ? 'Présent' : 'Absent'}
                      </Badge>
                    )}
                  </div>
                  
                  {canCheckIn && (
                    <div className="flex space-x-2">
                      <Button
                        variant={status === 'present' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCheckIn(participant, 'present')}
                        className={status === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        <UserCheck size={16} />
                        <span className="ml-1">Présent</span>
                      </Button>
                      <Button
                        variant={status === 'absent' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleCheckIn(participant, 'absent')}
                      >
                        <UserX size={16} />
                        <span className="ml-1">Absent</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {!canCheckIn && (
            <div className="text-center py-6 text-gray-500">
              <p>Le check-in sera disponible une fois l'opération démarrée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsTab;
