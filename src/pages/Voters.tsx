import React, { useMemo, useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Download, Search, Upload, FileSpreadsheet, Plus, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type Voter = {
  id: string;
  firstName: string;
  lastName: string;
  center: string;
  bureau: string;
  quartier: string;
  phone: string;
};

const mockVoters: Voter[] = [
  { id: '1', firstName: 'Jean', lastName: 'MOUKANI', center: 'Collège Moanda', bureau: 'Bureau 01', quartier: 'Moukoundou', phone: '+241 01 23 45 67' },
  { id: '2', firstName: 'Marie', lastName: 'ONDO', center: 'École Publique 1', bureau: 'Bureau 03', quartier: 'Mboukou', phone: '+241 01 34 56 78' },
  { id: '3', firstName: 'Paul', lastName: 'NGUEMA', center: 'Lycée Technique', bureau: 'Bureau 02', quartier: 'Lekolo', phone: '+241 01 45 67 89' },
  { id: '4', firstName: 'Sophie', lastName: 'BILOGO', center: 'École Publique 2', bureau: 'Bureau 05', quartier: 'Moukaba', phone: '+241 01 56 78 90' },
  { id: '5', firstName: 'Pierre', lastName: 'MOUKOU', center: 'Collège Moanda', bureau: 'Bureau 01', quartier: 'Moukoundou', phone: '+241 01 67 89 01' },
  { id: '6', firstName: 'Fatou', lastName: 'DIABATÉ', center: 'École Publique 1', bureau: 'Bureau 03', quartier: 'Mboukou', phone: '+241 01 78 90 12' },
];

const Voters = () => {
  const [query, setQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [selectedBureau, setSelectedBureau] = useState('all');
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newVoter, setNewVoter] = useState({
    firstName: '',
    lastName: '',
    center: '',
    bureau: '',
    quartier: '',
    phone: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les votants depuis Supabase
  useEffect(() => {
    async function fetchVoters() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('voters')
          .select(`
            *,
            voting_centers(name),
            voting_bureaux(name)
          `)
          .order('last_name', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des votants:', error);
          toast.error('Erreur lors du chargement des votants');
          // Fallback sur les données mock en cas d'erreur
          setVoters(mockVoters);
        } else {
          // Transformer les données Supabase au format attendu
          const transformedVoters = data?.map(voter => ({
            id: voter.id,
            firstName: voter.first_name,
            lastName: voter.last_name,
            center: voter.voting_centers?.name || 'Non assigné',
            bureau: voter.voting_bureaux?.name || 'Non assigné',
            quartier: voter.quartier || '',
            phone: voter.phone || ''
          })) || [];
          
          setVoters(transformedVoters);
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur de connexion à la base de données');
        setVoters(mockVoters);
      } finally {
        setLoading(false);
      }
    }

    fetchVoters();
  }, []);

  // Extraire les centres et bureaux uniques pour les filtres
  const centers = useMemo(() => {
    const uniqueCenters = [...new Set(voters.map(v => v.center))];
    return uniqueCenters.sort();
  }, [voters]);

  const bureaux = useMemo(() => {
    const uniqueBureaux = [...new Set(voters.map(v => v.bureau))];
    return uniqueBureaux.sort();
  }, [voters]);

  const filtered = useMemo(() => {
    let filteredVoters = voters;

    // Filtre par recherche textuelle
    const q = query.trim().toLowerCase();
    if (q) {
      filteredVoters = filteredVoters.filter(v =>
        `${v.lastName} ${v.firstName}`.toLowerCase().includes(q) ||
        v.center.toLowerCase().includes(q) ||
        v.bureau.toLowerCase().includes(q) ||
        v.quartier.toLowerCase().includes(q) ||
        v.phone.toLowerCase().includes(q)
      );
    }

    // Filtre par centre
    if (selectedCenter && selectedCenter !== 'all') {
      filteredVoters = filteredVoters.filter(v => v.center === selectedCenter);
    }

    // Filtre par bureau
    if (selectedBureau && selectedBureau !== 'all') {
      filteredVoters = filteredVoters.filter(v => v.bureau === selectedBureau);
    }

    return filteredVoters;
  }, [voters, query, selectedCenter, selectedBureau]);

  // Calculs de pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVoters = filtered.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCenter, selectedBureau]);

  const exportCsv = () => {
    const header = ['Nom', 'Prénom', 'Centre', 'Bureau de vote', 'Quartier', 'Téléphone'];
    const rows = filtered.map(v => [v.lastName, v.firstName, v.center, v.bureau, v.quartier, v.phone]);
    const csv = [header, ...rows].map(r => r.map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'votants.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error('Le fichier doit contenir au moins un en-tête et une ligne de données');
          return;
        }

        const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const expectedHeaders = ['Nom', 'Prénom', 'Centre', 'Bureau de vote', 'Quartier', 'Téléphone'];
        
        // Vérifier que les en-têtes correspondent
        const hasRequiredHeaders = expectedHeaders.every(expected => 
          header.some(h => h.toLowerCase().includes(expected.toLowerCase()))
        );

        if (!hasRequiredHeaders) {
          toast.error('Format de fichier invalide. Les colonnes attendues sont: Nom, Prénom, Centre, Bureau de vote, Quartier, Téléphone');
          return;
        }

        const newVoters: Voter[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length >= 6 && values[0] && values[1]) {
            newVoters.push({
              id: `imported_${Date.now()}_${i}`,
              lastName: values[0],
              firstName: values[1],
              center: values[2] || '',
              bureau: values[3] || '',
              quartier: values[4] || '',
              phone: values[5] || ''
            });
          }
        }

        if (newVoters.length > 0) {
          setVoters(prev => [...prev, ...newVoters]);
          toast.success(`${newVoters.length} votants importés avec succès`);
        } else {
          toast.error('Aucun votant valide trouvé dans le fichier');
        }
      } catch (error) {
        toast.error('Erreur lors de la lecture du fichier');
        console.error('Import error:', error);
      }
    };

    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedCenter('all');
    setSelectedBureau('all');
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleAddVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newVoter.firstName.trim() || !newVoter.lastName.trim()) {
      toast.error('Le nom et le prénom sont obligatoires');
      return;
    }

    if (!newVoter.center.trim() || !newVoter.bureau.trim()) {
      toast.error('Le centre et le bureau de vote sont obligatoires');
      return;
    }

    try {
      // Enregistrer en base de données
      const { data, error } = await supabase
        .from('voters')
        .insert([
          {
            first_name: newVoter.firstName.trim(),
            last_name: newVoter.lastName.trim(),
            quartier: newVoter.quartier.trim(),
            phone: newVoter.phone.trim()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout du votant:', error);
        toast.error('Erreur lors de l\'ajout du votant');
        return;
      }

      // Créer le nouveau votant pour l'affichage
      const voter: Voter = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        center: newVoter.center.trim(),
        bureau: newVoter.bureau.trim(),
        quartier: data.quartier,
        phone: data.phone
      };

      // Ajouter à la liste
      setVoters(prev => [...prev, voter]);
      
      // Réinitialiser le formulaire
      setNewVoter({
        firstName: '',
        lastName: '',
        center: '',
        bureau: '',
        quartier: '',
        phone: ''
      });
      
      // Fermer le modal
      setIsAddModalOpen(false);
      
      toast.success('Votant ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du votant:', error);
      toast.error('Erreur lors de l\'ajout du votant');
    }
  };

  const resetAddForm = () => {
    setNewVoter({
      firstName: '',
      lastName: '',
      center: '',
      bureau: '',
      quartier: '',
      phone: ''
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Votants — 1er arrondissement, Moanda (Haut-Ogooué)</h1>
          <p className="text-gray-600 mt-2">Liste de référence opérationnelle pour les équipes terrain.</p>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtres et recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Rechercher: Nom, Prénom, Centre, Bureau, Quartier, Téléphone"
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les centres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les centres</SelectItem>
                  {centers.map(center => (
                    <SelectItem key={center} value={center}>{center}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBureau} onValueChange={setSelectedBureau}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les bureaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les bureaux</SelectItem>
                  {bureaux.map(bureau => (
                    <SelectItem key={bureau} value={bureau}>{bureau}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">
              Listing des votants ({filtered.length} résultat{filtered.length > 1 ? 's' : ''})
              {totalPages > 1 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  - Page {currentPage} sur {totalPages}
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileImport}
                className="hidden"
              />
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gov-blue hover:bg-gov-blue/90 text-white whitespace-nowrap">
                    <UserPlus size={16} className="mr-2" /> Ajouter un votant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau votant</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddVoter} className="space-y-6">
                    {/* Informations personnelles */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gov-gray">Informations personnelles</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom *</Label>
                          <Input
                            id="lastName"
                            value={newVoter.lastName}
                            onChange={(e) => setNewVoter(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Ex: MOUKANI"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom *</Label>
                          <Input
                            id="firstName"
                            value={newVoter.firstName}
                            onChange={(e) => setNewVoter(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Ex: Jean"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={newVoter.phone}
                          onChange={(e) => setNewVoter(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Ex: +241 01 23 45 67"
                        />
                      </div>
                    </div>

                    {/* Informations de vote */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gov-gray">Informations de vote</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="center">Centre de vote *</Label>
                        <Input
                          id="center"
                          value={newVoter.center}
                          onChange={(e) => setNewVoter(prev => ({ ...prev, center: e.target.value }))}
                          placeholder="Ex: Collège Moanda"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bureau">Bureau de vote *</Label>
                        <Input
                          id="bureau"
                          value={newVoter.bureau}
                          onChange={(e) => setNewVoter(prev => ({ ...prev, bureau: e.target.value }))}
                          placeholder="Ex: Bureau 01"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quartier">Quartier</Label>
                        <Input
                          id="quartier"
                          value={newVoter.quartier}
                          onChange={(e) => setNewVoter(prev => ({ ...prev, quartier: e.target.value }))}
                          placeholder="Ex: Moukoundou"
                        />
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-4 border-t">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsAddModalOpen(false);
                          resetAddForm();
                        }}
                        className="sm:order-1"
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-gov-blue hover:bg-gov-blue/90 sm:order-2"
                      >
                        Ajouter le votant
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="whitespace-nowrap"
              >
                <Upload size={16} className="mr-2" /> Import CSV/Excel
              </Button>
              <Button variant="outline" onClick={exportCsv} className="whitespace-nowrap">
                <Download size={16} className="mr-2" /> Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Centre</TableHead>
                    <TableHead>Bureau de vote</TableHead>
                    <TableHead>Quartier</TableHead>
                    <TableHead>Téléphone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVoters.map((voter) => (
                    <TableRow key={voter.id}>
                      <TableCell className="font-medium">{voter.lastName}</TableCell>
                      <TableCell>{voter.firstName}</TableCell>
                      <TableCell>{voter.center}</TableCell>
                      <TableCell>{voter.bureau}</TableCell>
                      <TableCell>{voter.quartier}</TableCell>
                      <TableCell className="font-mono text-sm">{voter.phone}</TableCell>
                    </TableRow>
                  ))}
                  {paginatedVoters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">Aucun résultat</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filtered.length)} sur {filtered.length} votants
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Précédent
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Afficher seulement quelques pages autour de la page actuelle
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Suivant
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Voters;


