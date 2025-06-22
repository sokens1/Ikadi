
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Search, Shield, Users, Eye, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types pour RBAC
export type UserRole = 'super-admin' | 'agent-saisie' | 'validateur' | 'observateur';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  assignedCenter?: string;
  createdAt: string;
  lastLogin?: string;
}

// Schéma de validation
const userSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  role: z.enum(['super-admin', 'agent-saisie', 'validateur', 'observateur']),
  assignedCenter: z.string().optional(),
  isActive: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Données mock des utilisateurs
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Directeur de Campagne',
      email: 'directeur@ewana.ga',
      role: 'super-admin',
      isActive: true,
      createdAt: '2024-01-15',
      lastLogin: '2024-06-22'
    },
    {
      id: '2',
      name: 'Marie Dubois',
      email: 'marie.dubois@ewana.ga',
      role: 'agent-saisie',
      isActive: true,
      assignedCenter: 'Centre Nord',
      createdAt: '2024-02-10',
      lastLogin: '2024-06-21'
    },
    {
      id: '3',
      name: 'Jean Martin',
      email: 'jean.martin@ewana.ga',
      role: 'validateur',
      isActive: true,
      assignedCenter: 'Centre Sud',
      createdAt: '2024-02-15',
      lastLogin: '2024-06-20'
    },
    {
      id: '4',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@ewana.ga',
      role: 'observateur',
      isActive: false,
      createdAt: '2024-03-01',
      lastLogin: '2024-06-18'
    }
  ]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'observateur',
      isActive: true,
    },
  });

  // Configuration des rôles avec permissions
  const roleConfig = {
    'super-admin': {
      label: 'Super-Admin',
      icon: Shield,
      color: 'bg-red-500',
      description: 'Accès total à la plateforme',
      permissions: ['all']
    },
    'agent-saisie': {
      label: 'Agent de Saisie',
      icon: UserCheck,
      color: 'bg-blue-500',
      description: 'Accès au flux de saisie des PV',
      permissions: ['pv_entry']
    },
    'validateur': {
      label: 'Validateur',
      icon: Users,
      color: 'bg-green-500',
      description: 'Accès à la validation des PV de son centre',
      permissions: ['pv_validation']
    },
    'observateur': {
      label: 'Observateur',
      icon: Eye,
      color: 'bg-gray-500',
      description: 'Accès en lecture seule aux tableaux de bord',
      permissions: ['read_only']
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSubmit = (data: UserFormData) => {
    if (editingUser) {
      // Modifier utilisateur existant
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...data }
          : user
      ));
      toast({
        title: "Utilisateur modifié",
        description: "Les informations ont été mises à jour avec succès.",
      });
    } else {
      // Créer nouvel utilisateur
      const newUser: User = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers(prev => [...prev, newUser]);
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur a été ajouté avec succès.",
      });
    }
    
    setIsDialogOpen(false);
    setEditingUser(null);
    form.reset();
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.isActive ? "Utilisateur désactivé" : "Utilisateur activé",
      description: `Le compte de ${user?.name} a été ${user?.isActive ? 'désactivé' : 'activé'}.`,
    });
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedCenter: user.assignedCenter || '',
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gov-gray">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Gérez les accès et permissions des utilisateurs de la plateforme
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nouvel Utilisateur</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Jean Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean.dupont@ewana.ga" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(roleConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {(form.watch('role') === 'validateur' || form.watch('role') === 'agent-saisie') && (
                    <FormField
                      control={form.control}
                      name="assignedCenter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Centre assigné</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Centre Nord" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Compte actif</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            L'utilisateur peut se connecter
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Annuler
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">
                      {editingUser ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques des rôles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(roleConfig).map(([key, config]) => {
            const count = users.filter(u => u.role === key).length;
            const Icon = config.icon;
            
            return (
              <Card key={key} className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg sm:text-2xl font-bold">{count}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{config.label}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filtres et recherche */}
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
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
        </Card>

        {/* Table des utilisateurs */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">
              Utilisateurs ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] sm:w-auto">Utilisateur</TableHead>
                    <TableHead className="hidden sm:table-cell">Rôle</TableHead>
                    <TableHead className="hidden lg:table-cell">Centre assigné</TableHead>
                    <TableHead className="hidden md:table-cell">Dernière connexion</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleInfo = roleConfig[user.role];
                    const RoleIcon = roleInfo.icon;
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">{user.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                            <div className="sm:hidden flex items-center gap-1 mt-1">
                              <div className={`w-2 h-2 rounded-full ${roleInfo.color}`} />
                              <span className="text-xs text-gray-600">{roleInfo.label}</span>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${roleInfo.color} flex items-center justify-center`}>
                              <RoleIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{roleInfo.label}</div>
                              <div className="text-xs text-gray-500">{roleInfo.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="hidden lg:table-cell">
                          {user.assignedCenter || '-'}
                        </TableCell>
                        
                        <TableCell className="hidden md:table-cell">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => toggleUserStatus(user.id)}
                              size="sm"
                            />
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="w-8 h-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserManagement;
