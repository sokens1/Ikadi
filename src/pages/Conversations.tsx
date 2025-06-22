
import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Hash, 
  Search,
  Plus,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  type: 'text' | 'system';
}

interface Conversation {
  id: string;
  name: string;
  type: 'public' | 'private';
  participants: Array<{
    id: string;
    name: string;
    role: string;
    isOnline: boolean;
  }>;
  lastMessage?: Message;
  unreadCount: number;
}

const Conversations = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string>('public-general');
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Données mock des conversations
  const [conversations] = useState<Conversation[]>([
    {
      id: 'public-general',
      name: 'Canal Général',
      type: 'public',
      participants: [
        { id: '1', name: 'Directeur de Campagne', role: 'super-admin', isOnline: true },
        { id: '2', name: 'Marie Dubois', role: 'agent-saisie', isOnline: true },
        { id: '3', name: 'Jean Martin', role: 'validateur', isOnline: false },
        { id: '4', name: 'Sophie Laurent', role: 'observateur', isOnline: true },
      ],
      unreadCount: 0,
    },
    {
      id: 'public-updates',
      name: 'Annonces & Mises à jour',
      type: 'public',
      participants: [
        { id: '1', name: 'Directeur de Campagne', role: 'super-admin', isOnline: true },
        { id: '2', name: 'Marie Dubois', role: 'agent-saisie', isOnline: true },
      ],
      unreadCount: 2,
    },
    {
      id: 'private-marie',
      name: 'Marie Dubois',
      type: 'private',
      participants: [
        { id: '1', name: 'Directeur de Campagne', role: 'super-admin', isOnline: true },
        { id: '2', name: 'Marie Dubois', role: 'agent-saisie', isOnline: true },
      ],
      unreadCount: 1,
    },
    {
      id: 'private-jean',
      name: 'Jean Martin',
      type: 'private',
      participants: [
        { id: '1', name: 'Directeur de Campagne', role: 'super-admin', isOnline: true },
        { id: '3', name: 'Jean Martin', role: 'validateur', isOnline: false },
      ],
      unreadCount: 0,
    },
  ]);

  // Messages mock pour la conversation sélectionnée
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bienvenue dans le canal général ! Ici nous pouvons discuter de tous les sujets liés à notre campagne.',
      sender: { id: '1', name: 'Directeur de Campagne', role: 'super-admin' },
      timestamp: '2024-06-22T08:00:00',
      type: 'text'
    },
    {
      id: '2',
      content: 'Merci ! Prêt à commencer la saisie des PV pour les premiers bureaux.',
      sender: { id: '2', name: 'Marie Dubois', role: 'agent-saisie' },
      timestamp: '2024-06-22T08:05:00',
      type: 'text'
    },
    {
      id: '3',
      content: 'Marie Dubois a rejoint la conversation',
      sender: { id: 'system', name: 'Système', role: 'system' },
      timestamp: '2024-06-22T08:06:00',
      type: 'system'
    },
    {
      id: '4',
      content: 'Parfait ! N\'hésitez pas si vous avez des questions sur la procédure.',
      sender: { id: '1', name: 'Directeur de Campagne', role: 'super-admin' },
      timestamp: '2024-06-22T08:10:00',
      type: 'text'
    },
  ]);

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const roleColors = {
    'super-admin': 'bg-red-500',
    'agent-saisie': 'bg-blue-500',
    'validateur': 'bg-green-500',
    'observateur': 'bg-gray-500',
    'system': 'bg-purple-500'
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!messageText.trim() || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-4 animate-fade-in">
        {/* Sidebar des conversations - Mobile: collapsible, Desktop: fixed */}
        <div className="w-full lg:w-80 flex flex-col">
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversations
                </CardTitle>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Nouveau</span>
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-2">
                  {/* Canaux publics */}
                  <div className="mb-4">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Canaux publics
                    </div>
                    {filteredConversations
                      .filter(conv => conv.type === 'public')
                      .map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`w-full p-2 rounded-lg text-left transition-colors mb-1 ${
                            selectedConversation === conversation.id
                              ? 'bg-gov-blue text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium truncate">
                                  {conversation.name}
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs px-1 py-0 h-5 min-w-[20px]">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {conversation.participants.length} membres
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>

                  <Separator className="my-2" />

                  {/* Messages privés */}
                  <div>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Messages privés
                    </div>
                    {filteredConversations
                      .filter(conv => conv.type === 'private')
                      .map((conversation) => {
                        const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
                        
                        return (
                          <button
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation.id)}
                            className={`w-full p-2 rounded-lg text-left transition-colors mb-1 ${
                              selectedConversation === conversation.id
                                ? 'bg-gov-blue text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs">
                                    {otherParticipant?.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                {otherParticipant?.isOnline && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium truncate">
                                    {otherParticipant?.name}
                                  </span>
                                  {conversation.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs px-1 py-0 h-5 min-w-[20px]">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">
                                  {otherParticipant?.role.replace('-', ' ')}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Zone de chat principale */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col h-full">
            {/* En-tête du chat */}
            <CardHeader className="p-3 sm:p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentConversation?.type === 'public' ? (
                    <div className="w-10 h-10 bg-gov-blue rounded-lg flex items-center justify-center">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {currentConversation?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">{currentConversation?.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {currentConversation?.type === 'public' 
                        ? `${currentConversation.participants.length} membres`
                        : 'En ligne'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  {currentConversation?.type === 'private' && (
                    <>
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                        <Video className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.type === 'system' ? (
                        <div className="text-center text-xs text-gray-500 py-2">
                          {message.content}
                        </div>
                      ) : (
                        <div className={`flex gap-2 sm:gap-3 ${
                          message.sender.id === user?.id ? 'flex-row-reverse' : ''
                        }`}>
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {message.sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 min-w-0 ${
                            message.sender.id === user?.id ? 'text-right' : ''
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{message.sender.name}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                roleColors[message.sender.role as keyof typeof roleColors]
                              }`} />
                              <span className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <div className={`text-sm p-3 rounded-lg max-w-xs sm:max-w-md lg:max-w-lg break-words ${
                              message.sender.id === user?.id
                                ? 'bg-gov-blue text-white ml-auto'
                                : 'bg-gray-100'
                            }`}>
                              {message.content}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Zone de saisie */}
            <div className="border-t p-3 sm:p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Conversations;
