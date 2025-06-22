
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'agent-saisie' | 'validateur' | 'observateur';
  assignedCenter?: string;
  isActive: boolean;
  createdAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  role: 'super-admin' | 'agent-saisie' | 'validateur' | 'observateur';
  assignedCenter?: string;
  isActive: boolean;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'observateur',
    assignedCenter: '',
    isActive: true
  });

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      role: 'super-admin',
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      role: 'validateur',
      assignedCenter: 'Centre Libreville Nord',
      isActive: true,
      createdAt: '2024-02-10'
    },
    {
      id: '3',
      name: 'Pierre Moreau',
      email: 'pierre.moreau@example.com',
      role: 'agent-saisie',
      isActive: false,
      createdAt: '2024-03-05'
    },
    {
      id: '4',
      name: 'Sophie Bernard',
      email: 'sophie.bernard@example.com',
      role: 'observateur',
      isActive: true,
      createdAt: '2024-03-20'
    }
  ]);

  const centers = [
    'Centre Libreville Nord',
    'Centre Libreville Sud',
    'Centre Port-Gentil',
    'Centre Franceville',
    'Centre Oyem'
  ];

  const roleLabels = {
    'super-admin': 'Super-Administrateur',
    'agent-saisie': 'Agent de Saisie',
    'validateur': 'Validateur',
    'observateur': 'Observateur'
  };

  const roleColors = {
    'super-admin': 'bg-red-100 text-red-800',
    'agent-saisie': 'bg-blue-100 text-blue-800',
    'validateur': 'bg-green-100 text-green-800',
    'observateur': 'bg-gray-100 text-gray-800'
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    byRole: {
      'super-admin': users.filter(u => u.role === 'super-admin').length,
      'agent-saisie': users.filter(u => u.role === 'agent-saisie').length,
      'validateur': users.filter(u => u.role === 'validateur').length,
      'observateur': users.filter(u => u.role === 'observateur').length
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? user.isActive : !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name || 'Utilisateur',
      email: formData.email || 'email@example.com',
      role: formData.role,
      assignedCenter: formData.assignedCenter,
      isActive: formData.isActive,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, newUser]);
    setIsCreateModalOpen(false);
    resetForm();
    toast({
      title: "Utilisateur créé",
      description: "Le nouvel utilisateur a été créé avec succès.",
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map(user => 
      user.id === selectedUser.id 
        ? {
            ...user,
            name: formData.name || user.name,
            email: formData.email || user.email,
            role: formData.role,
            assignedCenter: formData.assignedCenter,
            isActive: formData.isActive
          }
        : user
    );

    setUsers(updatedUsers);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    resetForm();
    toast({
      title: "Utilisateur modifié",
      description: "Les informations de l'utilisateur ont été mises à jour.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Utilisateur supprimé",
      description: "L'utilisateur a été supprimé avec succès.",
    });
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    );
    setUsers(updatedUsers);
    
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.isActive ? "Utilisateur désactivé" : "Utilisateur activé",
      description: `Le compte a été ${user?.isActive ? 'désactivé' : 'activé'}.`,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'observateur',
      assignedCenter: '',
      isActive: true
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedCenter: user.assignedCenter || '',
      isActive: user.isActive
    });
    setIsEditModalOpen(true);
  };

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
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="mobile-button">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" className="mobile-button">
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="mobile-button">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-md mx-auto mobile-modal">
                <DialogHeader>
                  <DialogTitle>Créer un Utilisateur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mobile-form">
                  <div>
                    <Label htmlFor="create-name">Nom complet</Label>
                    <Input
                      id="create-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jean.dupont@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="create-role">Rôle</Label>
                    <Select value={formData.role} onValueChange={(value: any) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="observateur">Observateur</SelectItem>
                        <SelectItem value="agent-saisie">Agent de Saisie</SelectItem>
                        <SelectItem value="validateur">Validateur</SelectItem>
                        <SelectItem value="super-admin">Super-Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(formData.role === 'validateur' || formData.role === 'agent-saisie') && (
                    <div>
                      <Label htmlFor="create-center">Centre Assigné</Label>
                      <Select value={formData.assignedCenter} onValueChange={(value) => setFormData({...formData, assignedCenter: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un centre" />
                        </SelectTrigger>
                        <SelectContent>
                          {centers.map(center => (
                            <SelectItem key={center} value={center}>{center}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="create-active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="create-active">Compte actif</Label>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button onClick={handleCreateUser} className="flex-1">
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
          <Card className="gov-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gov-blue">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Utilisateurs</p>
            </CardContent>
          </Card>
          
          <Card className="gov-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <Shield className="w-4 h-4 mr-2 text-red-500" />
                Super-Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.byRole['super-admin']}</div>
            </CardContent>
          </Card>
          
          <Card className="gov-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <Edit className="w-4 h-4 mr-2 text-blue-500" />
                Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.byRole['agent-saisie']}</div>
            </CardContent>
          </Card>
          
          <Card className="gov-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                Validateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.byRole['validateur']}</div>
            </CardContent>
          </Card>
          
          <Card className="gov-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gov-gray flex items-center">
                <Eye className="w-4 h-4 mr-2 text-gray-500" />
                Observateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.byRole['observateur']}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="gov-card">
          <CardContent className="responsive-padding">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
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
                  <SelectTrigger className="w-full sm:w-[150px]">
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

        {/* Users Table */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="responsive-text">Liste des Utilisateurs ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="mobile-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Utilisateur</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="hidden lg:table-cell">Centre</TableHead>
                    <TableHead className="w-[100px]">Statut</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500 md:hidden">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${roleColors[user.role]}`}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {user.assignedCenter || '-'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => handleToggleStatus(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="w-full max-w-md mx-auto mobile-modal">
            <DialogHeader>
              <DialogTitle>Modifier l'Utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mobile-form">
              <div>
                <Label htmlFor="edit-name">Nom complet</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-role">Rôle</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observateur">Observateur</SelectItem>
                    <SelectItem value="agent-saisie">Agent de Saisie</SelectItem>
                    <SelectItem value="validateur">Validateur</SelectItem>
                    <SelectItem value="super-admin">Super-Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(formData.role === 'validateur' || formData.role === 'agent-saisie') && (
                <div>
                  <Label htmlFor="edit-center">Centre Assigné</Label>
                  <Select value={formData.assignedCenter} onValueChange={(value) => setFormData({...formData, assignedCenter: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un centre" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map(center => (
                        <SelectItem key={center} value={center}>{center}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="edit-active">Compte actif</Label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleEditUser} className="flex-1">
                  Modifier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default UserManagement;
