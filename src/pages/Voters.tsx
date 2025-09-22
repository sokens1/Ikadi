import React, { useMemo, useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Download, Search, Upload, FileSpreadsheet, Plus, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type Voter = {
  id: string;
  province: string;
  department: string;
  commune: string;
  arrondissement: string;
  center: string;
  bureau: string;
  inscrits: number;
  responsableCentre: string;
  contactRespoCentre: string;
  responsableBureau: string;
  contactRespoBureau: string;
  representantBureau: string;
  contactReprCentre: string;
};

const Voters = () => {
  const [query, setQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newVoter, setNewVoter] = useState({
    province: '',
    department: '',
    commune: '',
    arrondissement: '',
    center: '',
    bureau: '',
    inscrits: 0,
    responsableCentre: '',
    contactRespoCentre: '',
    responsableBureau: '',
    contactRespoBureau: '',
    representantBureau: '',
    contactReprCentre: ''
  });

  // Charger les centres et bureaux depuis Supabase
  useEffect(() => {
    async function fetchVotingData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('voting_centers')
          .select(`
            id,
            name as center,
            contact_name as responsableCentre,
            contact_phone as contactRespoCentre,
            provinces(name),
            departments(name),
            communes(name),
            arrondissements(name),
            voting_bureaux(
              id,
              name as bureau,
              registered_voters,
              president as responsableBureau
            )
          `)
          .order('name', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des centres:', error);
          toast.error('Erreur lors du chargement des centres');
          setVoters([]);
        } else {
          // Transformer les données en format voter
          const transformedVoters: Voter[] = [];
          
          data?.forEach(center => {
            center.voting_bureaux?.forEach((bureau: any) => {
              transformedVoters.push({
                id: `${center.id}-${bureau.id}`,
                province: center.provinces?.name || '',
                department: center.departments?.name || '',
                commune: center.communes?.name || '',
                arrondissement: center.arrondissements?.name || '',
                center: center.center,
                bureau: bureau.bureau,
                inscrits: bureau.registered_voters || 0,
                responsableCentre: center.responsableCentre || '',
                contactRespoCentre: center.contactRespoCentre || '',
                responsableBureau: bureau.responsableBureau || '',
                contactRespoBureau: '', // À ajouter si nécessaire
                representantBureau: '', // À ajouter si nécessaire
                contactReprCentre: '' // À ajouter si nécessaire
              });
            });
          });
          
          setVoters(transformedVoters);
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur de connexion à la base de données');
        setVoters([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVotingData();
  }, []);

  // Filtrage des données
  const filteredVoters = useMemo(() => {
    return voters.filter(voter => {
      const matchesQuery = !query || 
        voter.province.toLowerCase().includes(query.toLowerCase()) ||
        voter.department.toLowerCase().includes(query.toLowerCase()) ||
        voter.commune.toLowerCase().includes(query.toLowerCase()) ||
        voter.center.toLowerCase().includes(query.toLowerCase()) ||
        voter.bureau.toLowerCase().includes(query.toLowerCase());

      const matchesProvince = selectedProvince === 'all' || voter.province === selectedProvince;
      const matchesCenter = selectedCenter === 'all' || voter.center === selectedCenter;

      return matchesQuery && matchesProvince && matchesCenter;
    });
  }, [voters, query, selectedProvince, selectedCenter]);

  // Pagination
  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);
  const paginatedVoters = filteredVoters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Options pour les filtres
  const provinces = Array.from(new Set(voters.map(v => v.province))).filter(Boolean);
  const centers = Array.from(new Set(voters.map(v => v.center))).filter(Boolean);

  const handleAddVoter = async () => {
    try {
      // Créer un nouveau centre et bureau si nécessaire
      const voterData: Voter = {
        id: `temp-${Date.now()}`,
        province: newVoter.province,
        department: newVoter.department,
        commune: newVoter.commune,
        arrondissement: newVoter.arrondissement,
        center: newVoter.center,
        bureau: newVoter.bureau,
        inscrits: newVoter.inscrits,
        responsableCentre: newVoter.responsableCentre,
        contactRespoCentre: newVoter.contactRespoCentre,
        responsableBureau: newVoter.responsableBureau,
        contactRespoBureau: newVoter.contactRespoBureau,
        representantBureau: newVoter.representantBureau,
        contactReprCentre: newVoter.contactReprCentre
      };

      // Ajouter à la liste
      setVoters(prev => [...prev, voterData]);
      
      // Réinitialiser le formulaire
      setNewVoter({
        province: '',
        department: '',
        commune: '',
        arrondissement: '',
        center: '',
        bureau: '',
        inscrits: 0,
        responsableCentre: '',
        contactRespoCentre: '',
        responsableBureau: '',
        contactRespoBureau: '',
        representantBureau: '',
        contactReprCentre: ''
      });
      
      // Fermer le modal
      setIsAddModalOpen(false);
      
      toast.success('Centre/Bureau ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const resetAddForm = () => {
    setNewVoter({
      province: '',
      department: '',
      commune: '',
      arrondissement: '',
      center: '',
      bureau: '',
      inscrits: 0,
      responsableCentre: '',
      contactRespoCentre: '',
      responsableBureau: '',
      contactRespoBureau: '',
      representantBureau: '',
      contactReprCentre: ''
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      // En-tête
      ['Province', 'Département', 'Commune', 'Arrondissement', 'Centre', 'Bureau', 'Inscrits', 'Responsable Centre', 'Contact Respo Centre', 'Responsable Bureau', 'Contact Respo Bureau', 'Représentant Bureau (Candidat)', 'Contact Repr Centre'],
      // Données
      ...filteredVoters.map(voter => [
        voter.province,
        voter.department,
        voter.commune,
        voter.arrondissement,
        voter.center,
        voter.bureau,
        voter.inscrits.toString(),
        voter.responsableCentre,
        voter.contactRespoCentre,
        voter.responsableBureau,
        voter.contactRespoBureau,
        voter.representantBureau,
        voter.contactReprCentre
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'centres_bureaux_vote.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centres et Bureaux de Vote</h1>
            <p className="text-gray-600 mt-2">Gestion des centres de vote et de leurs bureaux</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={exportToCSV} variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exporter CSV</span>
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2 bg-gov-blue hover:bg-gov-blue-dark">
                  <Plus className="w-4 h-4" />
                  <span>Ajouter Centre/Bureau</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un Centre et Bureau de Vote</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du centre et du bureau de vote
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations géographiques */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Localisation</h3>
                    
                    <div>
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        value={newVoter.province}
                        onChange={(e) => setNewVoter({...newVoter, province: e.target.value})}
                        placeholder="Ex: Haut-Ogooué"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="department">Département *</Label>
                      <Input
                        id="department"
                        value={newVoter.department}
                        onChange={(e) => setNewVoter({...newVoter, department: e.target.value})}
                        placeholder="Ex: Machin"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="commune">Commune *</Label>
                      <Input
                        id="commune"
                        value={newVoter.commune}
                        onChange={(e) => setNewVoter({...newVoter, commune: e.target.value})}
                        placeholder="Ex: Moanda"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="arrondissement">Arrondissement</Label>
                      <Input
                        id="arrondissement"
                        value={newVoter.arrondissement}
                        onChange={(e) => setNewVoter({...newVoter, arrondissement: e.target.value})}
                        placeholder="Ex: 1er"
                      />
                    </div>
                  </div>

                  {/* Informations du centre */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Centre de Vote</h3>
                    
                    <div>
                      <Label htmlFor="center">Nom du Centre *</Label>
                      <Input
                        id="center"
                        value={newVoter.center}
                        onChange={(e) => setNewVoter({...newVoter, center: e.target.value})}
                        placeholder="Ex: Moanda Plaine"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bureau">Nom du Bureau *</Label>
                      <Input
                        id="bureau"
                        value={newVoter.bureau}
                        onChange={(e) => setNewVoter({...newVoter, bureau: e.target.value})}
                        placeholder="Ex: Bureau 1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="inscrits">Nombre d'Inscrits *</Label>
                      <Input
                        id="inscrits"
                        type="number"
                        value={newVoter.inscrits}
                        onChange={(e) => setNewVoter({...newVoter, inscrits: parseInt(e.target.value) || 0})}
                        placeholder="Ex: 411"
                      />
                    </div>
                  </div>

                  {/* Responsables du centre */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Responsable Centre</h3>
                    
                    <div>
                      <Label htmlFor="responsableCentre">Nom du Responsable *</Label>
                      <Input
                        id="responsableCentre"
                        value={newVoter.responsableCentre}
                        onChange={(e) => setNewVoter({...newVoter, responsableCentre: e.target.value})}
                        placeholder="Ex: Respo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contactRespoCentre">Contact *</Label>
                      <Input
                        id="contactRespoCentre"
                        value={newVoter.contactRespoCentre}
                        onChange={(e) => setNewVoter({...newVoter, contactRespoCentre: e.target.value})}
                        placeholder="Ex: 076504888"
                      />
                    </div>
                  </div>

                  {/* Responsables du bureau */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Responsable Bureau</h3>
                    
                    <div>
                      <Label htmlFor="responsableBureau">Nom du Responsable *</Label>
                      <Input
                        id="responsableBureau"
                        value={newVoter.responsableBureau}
                        onChange={(e) => setNewVoter({...newVoter, responsableBureau: e.target.value})}
                        placeholder="Ex: Respo Bureau"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contactRespoBureau">Contact *</Label>
                      <Input
                        id="contactRespoBureau"
                        value={newVoter.contactRespoBureau}
                        onChange={(e) => setNewVoter({...newVoter, contactRespoBureau: e.target.value})}
                        placeholder="Ex: 076504888"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="representantBureau">Représentant Bureau (Candidat)</Label>
                      <Input
                        id="representantBureau"
                        value={newVoter.representantBureau}
                        onChange={(e) => setNewVoter({...newVoter, representantBureau: e.target.value})}
                        placeholder="Ex: Représentant"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contactReprCentre">Contact Repr Centre</Label>
                      <Input
                        id="contactReprCentre"
                        value={newVoter.contactReprCentre}
                        onChange={(e) => setNewVoter({...newVoter, contactReprCentre: e.target.value})}
                        placeholder="Ex: 076504888"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleAddVoter}
                    className="bg-gov-blue hover:bg-gov-blue-dark"
                    disabled={!newVoter.province || !newVoter.department || !newVoter.commune || !newVoter.center || !newVoter.bureau}
                  >
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="gov-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les provinces</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les centres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les centres</SelectItem>
                  {centers.map((center) => (
                    <SelectItem key={center} value={center}>{center}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 flex items-center">
                {filteredVoters.length} résultat(s) trouvé(s)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des données */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Liste des Centres et Bureaux</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Province</TableHead>
                        <TableHead>Département</TableHead>
                        <TableHead>Commune</TableHead>
                        <TableHead>Arrondissement</TableHead>
                        <TableHead>Centre</TableHead>
                        <TableHead>Bureau</TableHead>
                        <TableHead>Inscrits</TableHead>
                        <TableHead>Responsable Centre</TableHead>
                        <TableHead>Contact Respo Centre</TableHead>
                        <TableHead>Responsable Bureau</TableHead>
                        <TableHead>Contact Respo Bureau</TableHead>
                        <TableHead>Représentant Bureau</TableHead>
                        <TableHead>Contact Repr Centre</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedVoters.map((voter) => (
                        <TableRow key={voter.id}>
                          <TableCell>{voter.province}</TableCell>
                          <TableCell>{voter.department}</TableCell>
                          <TableCell>{voter.commune}</TableCell>
                          <TableCell>{voter.arrondissement}</TableCell>
                          <TableCell className="font-medium">{voter.center}</TableCell>
                          <TableCell>{voter.bureau}</TableCell>
                          <TableCell>{voter.inscrits}</TableCell>
                          <TableCell>{voter.responsableCentre}</TableCell>
                          <TableCell>{voter.contactRespoCentre}</TableCell>
                          <TableCell>{voter.responsableBureau}</TableCell>
                          <TableCell>{voter.contactRespoBureau}</TableCell>
                          <TableCell>{voter.representantBureau}</TableCell>
                          <TableCell>{voter.contactReprCentre}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages} ({filteredVoters.length} résultat(s))
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Voters;