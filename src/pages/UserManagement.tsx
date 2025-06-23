import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Shield,
  Eye,
  FileText,
  CheckCircle
} from 'lucide-react';

// Type definitions
type UserRole = 'super-admin' | 'agent-saisie' | 'validateur' | 'observateur';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedCenter?: string;
  isActive: boolean;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      role: 'super-admin',
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      role: 'agent-saisie',
      assignedCenter: 'Centre Libreville Nord',
      isActive: true,
      createdAt: '2024-02-10'
    },
    {
      id: '3',
      name: 'Paul Bernard',
      email: 'paul.bernard@email.com',
      role: 'validateur',
      assignedCenter: 'Centre Owendo',
      isActive: false,
      createdAt: '2024-03-05'
    },
    {
      id: '4',
      name: 'Sophie Moreau',
      email: 'sophie.moreau@email.com',
      role: 'observateur',
      isActive: true,
      createdAt: '2024-03-20'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'agent-saisie' as UserRole,
    assignedCenter: '',
    isActive: true
  });

  const roleLabels = {
    'super-admin': 'Super-Admin',
    'agent-saisie': 'Agent de Saisie',
    'validateur': 'Validateur',
    'observateur': 'Observateur'
  };

  const roleDescriptions = {
    'super-admin': 'Accès total à la plateforme',
    'agent-saisie': 'Saisie des PV uniquement',
    'validateur': 'Validation des PV de son centre',
    'observateur': 'Lecture seule des résultats'
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super-admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'agent-saisie':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'validateur':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'observateur':
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      assignedCenter: newUser.assignedCenter || undefined,
      isActive: newUser.isActive,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      role: 'agent-saisie',
      assignedCenter: '',
      isActive: true
    });
    setIsCreateModalOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedCenter: user.assignedCenter || '',
      isActive: user.isActive
    });
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? {
              ...u,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              assignedCenter: newUser.assignedCenter || undefined,
              isActive: newUser.isActive
            }
          : u
      ));
      setEditingUser(null);
      setNewUser({
        name: '',
        email: '',
        role: 'agent-saisie',
        assignedCenter: '',
        isActive: true
      });
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, isActive: !u.isActive }
        : u
    ));
  };

  const getRoleStats = () => {
    const stats = {
      'super-admin': 0,
      'agent-saisie': 0,
      'validateur': 0,
      'observateur': 0,
      active: 0,
      inactive: 0
    };

    users.forEach(user => {
      stats[user.role]++;
      if (user.isActive) {
        stats.active++;
      } else {
        stats.inactive++;
      }
    });

    return stats;
  };

  const stats = getRoleStats();

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gov-gray">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Gérez les accès et les rôles des utilisateurs de la plateforme
            </p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="gov-bg-primary text-white mobile-button">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ajouter un utilisateur</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto mobile-modal">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mobile-form">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super-admin">Super-Admin</SelectItem>
                      <SelectItem value="agent-saisie">Agent de Saisie</SelectItem>
                      <SelectItem value="validateur">Validateur</SelectItem>
                      <SelectItem value="observateur">Observateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {roleDescriptions[newUser.role]}
                  </p>
                </div>
                {(newUser.role === 'validateur' || newUser.role === 'agent-saisie') && (
                  <div>
                    <Label htmlFor="center">Centre assigné</Label>
                    <Input
                      id="center"
                      value={newUser.assignedCenter}
                      onChange={(e) => setNewUser({...newUser, assignedCenter: e.target.value})}
                      placeholder="Centre de vote assigné"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newUser.isActive}
                    onCheckedChange={(checked) => setNewUser({...newUser, isActive: checked})}
                  />
                  <Label>Compte actif</Label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingUser(null);
                    setNewUser({
                      name: '',
                      email: '',
                      role: 'agent-saisie',
                      assignedCenter: '',
                      isActive: true
                    });
                  }}
                  className="w-full sm:w-auto mobile-button"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  disabled={!newUser.name || !newUser.email}
                  className="w-full sm:w-auto mobile-button"
                >
                  {editingUser ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="gov-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gov-gray">
                Super-Admins
              </CardTitle>
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats['super-admin']}
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gov-gray">
                Agents Saisie
              </CardTitle>
              <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats['agent-saisie']}
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gov-gray">
                Validateurs
              </CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats['validateur']}
              </div>
            </CardContent>
          </Card>

          <Card className="gov-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gov-gray">
                Observateurs
              </CardTitle>
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats['observateur']}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="gov-card">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tous les rôles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="super-admin">Super-Admin</SelectItem>
                    <SelectItem value="agent-saisie">Agent de Saisie</SelectItem>
                    <SelectItem value="validateur">Validateur</SelectItem>
                    <SelectItem value="observateur">Observateur</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <Users className="w-5 h-5" />
              <span>Utilisateurs ({filteredUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full mobile-table">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm">Utilisateur</th>
                    <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm hidden sm:table-cell">Rôle</th>
                    <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm hidden lg:table-cell">Centre</th>
                    <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm">Statut</th>
                    <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 sm:p-4">
                        <div>
                          <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                          <div className="sm:hidden mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getRoleIcon(user.role)}
                              <span className="ml-1">{roleLabels[user.role]}</span>
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{roleLabels[user.role]}</span>
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4 hidden lg:table-cell">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {user.assignedCenter || '-'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => toggleUserStatus(user.id)}
                          />
                          <span className="text-xs sm:text-sm">
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="text-xs"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="ml-1 hidden sm:inline">Modifier</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aucun utilisateur trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserManagement;
