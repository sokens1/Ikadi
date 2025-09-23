
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  phase: 'before' | 'during' | 'after';
}

interface DiscussionTabProps {
  operationId: number;
}

const DiscussionTab = ({ operationId }: DiscussionTabProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Jean Dupont',
      content: 'J\'apporte les bouteilles d\'eau et les chaises pour demain',
      timestamp: '14/01/2025 - 18:30',
      phase: 'before'
    },
    {
      id: 2,
      sender: 'Marie Koffi',
      content: 'Parfait ! J\'ai confirmé avec la sono, ils seront là à 13h30',
      timestamp: '14/01/2025 - 19:15',
      phase: 'before'
    },
    {
      id: 3,
      sender: 'Paul Mensah',
      content: 'Rendez-vous à 9h au point de rassemblement place centrale',
      timestamp: '15/01/2025 - 08:00',
      phase: 'before'
    }
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      sender: 'Vous', // En réalité, ce serait l'utilisateur connecté
      content: newMessage,
      timestamp: new Date().toLocaleString('fr-FR'),
      phase: 'during' // En réalité, cela dépendrait du statut de l'opération
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'before': return 'Avant';
      case 'during': return 'Pendant';
      case 'after': return 'Après';
      default: return '';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'before': return 'bg-blue-100 text-blue-800';
      case 'during': return 'bg-orange-100 text-orange-800';
      case 'after': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    if (!groups[message.phase]) {
      groups[message.phase] = [];
    }
    groups[message.phase].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <span>Discussion de l'équipe</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Chat privé visible uniquement par les participants de cette opération
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Messages groupés par phase */}
          {Object.entries(groupedMessages).map(([phase, phaseMessages]) => (
            <div key={phase}>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(phase)}`}>
                  {getPhaseLabel(phase)}
                </span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div className="space-y-3">
                {phaseMessages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {message.sender.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{message.sender}</span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Zone de saisie */}
          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="bg-gov-blue hover:bg-gov-blue-dark">
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionTab;
