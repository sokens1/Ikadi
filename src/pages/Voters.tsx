import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Download, Search, Upload, FileSpreadsheet, Plus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
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
  const fetchVotingData = useCallback(async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inscrits')
          .select('*')
          .order('center', { ascending: true })
          .limit(10000);

        if (error) {
          console.error('Erreur chargement inscrits:', error);
          toast.error('Erreur lors du chargement des inscrits');
          setVoters([]);
        } else {
          const transformed: Voter[] = (data || []).map((row: any) => ({
            id: row.id,
            province: row.province || '',
            department: row.departement || '',
            commune: row.commune || '',
            arrondissement: row.arrondissement || '',
            center: row.center || '',
            bureau: row.bureau || '',
            inscrits: row.inscrits || 0,
            responsableCentre: row.responsable_centre || '',
            contactRespoCentre: row.contact_respo_centre || '',
            responsableBureau: row.responsable_bureau || '',
            contactRespoBureau: row.contact_respo_bureau || '',
            representantBureau: row.representant_bureau || '',
            contactReprCentre: row.contact_repr_centre || ''
          }));
          setVoters(transformed);
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur de connexion à la base de données');
        setVoters([]);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchVotingData();
  }, [fetchVotingData]);

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
      setLoading(true);
      
      // Sauvegarder dans Supabase
      const { data, error } = await supabase
        .from('inscrits')
        .insert({
          province: newVoter.province,
          departement: newVoter.department,
          commune: newVoter.commune,
          arrondissement: newVoter.arrondissement,
          center: newVoter.center,
          bureau: newVoter.bureau,
          inscrits: newVoter.inscrits,
          responsable_centre: newVoter.responsableCentre,
          contact_respo_centre: newVoter.contactRespoCentre,
          responsable_bureau: newVoter.responsableBureau,
          contact_respo_bureau: newVoter.contactRespoBureau,
          representant_bureau: newVoter.representantBureau,
          contact_repr_centre: newVoter.contactReprCentre
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast.error('Erreur lors de la sauvegarde en base de données');
        return;
      }

      // Recharger les données depuis Supabase
      await fetchVotingData();
      
      // Recalculer le nombre d'électeurs pour toutes les élections
      await recalculateAllElectionsVoters();
      
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
      
      toast.success('Centre/Bureau ajouté avec succès et élections mises à jour');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour recalculer le nombre d'électeurs pour toutes les élections
  const recalculateAllElectionsVoters = async () => {
    try {
      // Récupérer toutes les élections
      const { data: elections, error: electionsError } = await supabase
        .from('elections')
        .select('id, title');

      if (electionsError) {
        console.error('Erreur lors de la récupération des élections:', electionsError);
        return;
      }

      if (!elections || elections.length === 0) {
        console.log('Aucune élection trouvée');
        return;
      }

      // Pour chaque élection, recalculer le nombre d'électeurs
      for (const election of elections) {
        await recalculateElectionVoters(election.id);
      }

      console.log(`✅ Recalcul effectué pour ${elections.length} élection(s)`);
    } catch (error) {
      console.error('Erreur lors du recalcul des élections:', error);
    }
  };

  // Fonction pour recalculer le nombre d'électeurs d'une élection spécifique
  const recalculateElectionVoters = async (electionId: string) => {
    try {
      // Récupérer le total des inscrits depuis la table inscrits
      const { data: inscritsData, error: inscritsError } = await supabase
        .from('inscrits')
        .select('inscrits');

      if (inscritsError) {
        console.error('Erreur lors de la récupération des inscrits:', inscritsError);
        return;
      }

      // Calculer le total des inscrits
      const totalElecteurs = inscritsData?.reduce((sum, row) => sum + (row.inscrits || 0), 0) || 0;

      // Mettre à jour la colonne nb_electeurs de l'élection
      const { error: updateError } = await supabase
        .from('elections')
        .update({ 
          nb_electeurs: totalElecteurs,
          updated_at: new Date().toISOString()
        })
        .eq('id', electionId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour nb_electeurs:', updateError);
        return;
      }

      console.log(`✅ Élection ${electionId} mise à jour: ${totalElecteurs} électeurs`);
    } catch (error) {
      console.error('Erreur lors du recalcul pour l\'élection', electionId, ':', error);
    }
  };

  // Fonction pour ouvrir le modal d'édition
  const handleEditVoter = (voter: Voter) => {
    setEditingVoter(voter);
    setIsEditModalOpen(true);
  };

  // Fonction pour sauvegarder les modifications
  const handleUpdateVoter = async () => {
    if (!editingVoter) return;

    try {
      setLoading(true);
      
      // Mettre à jour dans Supabase
      const { error } = await supabase
        .from('inscrits')
        .update({
          province: editingVoter.province,
          departement: editingVoter.department,
          commune: editingVoter.commune,
          arrondissement: editingVoter.arrondissement,
          center: editingVoter.center,
          bureau: editingVoter.bureau,
          inscrits: editingVoter.inscrits,
          responsable_centre: editingVoter.responsableCentre,
          contact_respo_centre: editingVoter.contactRespoCentre,
          responsable_bureau: editingVoter.responsableBureau,
          contact_respo_bureau: editingVoter.contactRespoBureau,
          representant_bureau: editingVoter.representantBureau,
          contact_repr_centre: editingVoter.contactReprCentre
        })
        .eq('id', editingVoter.id);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        toast.error('Erreur lors de la mise à jour en base de données');
        return;
      }

      // Recharger les données depuis Supabase
      await fetchVotingData();
      
      // Recalculer le nombre d'électeurs pour toutes les élections
      await recalculateAllElectionsVoters();
      
      // Fermer le modal
      setIsEditModalOpen(false);
      setEditingVoter(null);
      
      toast.success('Centre/Bureau modifié avec succès et élections mises à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
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

  // Parsing CSV simple support des champs entre guillemets
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let current: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        current.push(field);
        field = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (field.length > 0 || current.length > 0) {
          current.push(field);
          rows.push(current);
        }
        current = [];
        field = '';
      } else {
        field += char;
      }
    }
    if (field.length > 0 || current.length > 0) {
      current.push(field);
      rows.push(current);
    }
    return rows.map(r => r.map(cell => cell.replace(/^"|"$/g, '')));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const findOrCreateByName = async (table: string, name: string, extra: any = {}) => {
    if (!name) return null;
    const { data: found, error: findErr } = await supabase.from(table).select('*').eq('name', name).limit(1).maybeSingle();
    if (findErr) throw findErr;
    if (found) return found;
    const { data: created, error: createErr } = await supabase.from(table).insert({ name, ...extra }).select().single();
    if (createErr) throw createErr;
    return created;
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const text = await file.text();
      const rows = parseCSV(text).filter(r => r.length > 0);
      if (rows.length < 2) {
        toast.error('CSV vide ou entêtes manquantes');
        return;
      }
      // En-têtes attendus
      // Province, Département, Commune, Arrondissement, Centre, Bureau, Inscrits, Responsable Centre, Contact Respo Centre, Responsable Bureau, Contact Respo Bureau, Représentant Bureau (Candidat), Contact Repr Centre
      const dataRows = rows.slice(1).filter(r => r.some(c => c && c.trim() !== ''));
      for (const r of dataRows) {
        const [province, department, commune, arrondissement, centerName, bureauName, inscritsStr, responsableCentre, contactRespoCentre, responsableBureau, contactRespoBureau, representantBureau, contactReprCentre] = r;
        // Insérer/mettre à jour directement dans la table inscrits
        const registered_voters = parseInt(inscritsStr || '0', 10) || 0;
        // Rechercher une ligne existante par combinaison center+bureau (si contrainte unique activée, ce sera géré côté DB)
        const { data: existing, error: findErr } = await supabase
          .from('inscrits')
          .select('id')
          .eq('center', centerName)
          .eq('bureau', bureauName)
          .limit(1)
          .maybeSingle();
        if (findErr) throw findErr;
        if (existing) {
          const { error: updateErr } = await supabase
            .from('inscrits')
            .update({
              province,
              departement: department,
              commune,
              arrondissement,
              center: centerName,
              bureau: bureauName,
              inscrits: registered_voters,
              responsable_centre: responsableCentre,
              contact_respo_centre: contactRespoCentre,
              responsable_bureau: responsableBureau,
              contact_respo_bureau: contactRespoBureau,
              representant_bureau: representantBureau,
              contact_repr_centre: contactReprCentre
            })
            .eq('id', existing.id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('inscrits')
            .insert({
              province,
              departement: department,
              commune,
              arrondissement,
              center: centerName,
              bureau: bureauName,
              inscrits: registered_voters,
              responsable_centre: responsableCentre,
              contact_respo_centre: contactRespoCentre,
              responsable_bureau: responsableBureau,
              contact_respo_bureau: contactRespoBureau,
              representant_bureau: representantBureau,
              contact_repr_centre: contactReprCentre
            });
          if (insertErr) throw insertErr;
        }
      }
      toast.success('Import CSV terminé');
      await fetchVotingData();
    } catch (err: any) {
      console.error(err);
      toast.error(`Échec de l'import CSV: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const generateCode = (value: string): string => {
    if (!value) return '';
    const ascii = value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^A-Za-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
    if (/^[0-9]+(ER|E|È|ÈRE)?$/i.test(value)) {
      return value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    }
    return ascii.split(' ').map(w => w.slice(0, 3)).join('').slice(0, 8) || ascii.slice(0, 8);
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
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            <Button onClick={handleImportClick} variant="outline" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Importer CSV</span>
            </Button>
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
                        <TableHead className="w-[200px]">Actions</TableHead>
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
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-1"
                                onClick={() => { setSelectedVoter(voter); setDetailOpen(true); }}
                              >
                                <Eye className="w-4 h-4" />
                                <span>Voir</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-1"
                                onClick={() => handleEditVoter(voter)}
                              >
                                <span>Modifier</span>
                              </Button>
                            </div>
                          </TableCell>
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
        {/* Modale de détail */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du Centre/Bureau</DialogTitle>
              <DialogDescription>
                Informations complémentaires non affichées dans le tableau principal
              </DialogDescription>
            </DialogHeader>
            {selectedVoter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-500">Responsable Centre</h3>
                  <div className="font-medium">{selectedVoter.responsableCentre || '-'}</div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Contact Respo Centre</h3>
                  <div className="font-medium">{selectedVoter.contactRespoCentre || '-'}</div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Responsable Bureau</h3>
                  <div className="font-medium">{selectedVoter.responsableBureau || '-'}</div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Contact Respo Bureau</h3>
                  <div className="font-medium">{selectedVoter.contactRespoBureau || '-'}</div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Représentant Bureau (Candidat)</h3>
                  <div className="font-medium">{selectedVoter.representantBureau || '-'}</div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Contact Repr Centre</h3>
                  <div className="font-medium">{selectedVoter.contactReprCentre || '-'}</div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal d'édition */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier Centre/Bureau</DialogTitle>
              <DialogDescription>
                Modifiez les informations du centre et du bureau de vote
              </DialogDescription>
            </DialogHeader>
            
            {editingVoter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations géographiques */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Localisation</h3>
                  
                  <div>
                    <Label htmlFor="edit-province">Province *</Label>
                    <Input
                      id="edit-province"
                      value={editingVoter.province}
                      onChange={(e) => setEditingVoter({...editingVoter, province: e.target.value})}
                      placeholder="Ex: Haut-Ogooué"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-department">Département *</Label>
                    <Input
                      id="edit-department"
                      value={editingVoter.department}
                      onChange={(e) => setEditingVoter({...editingVoter, department: e.target.value})}
                      placeholder="Ex: Machin"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-commune">Commune *</Label>
                    <Input
                      id="edit-commune"
                      value={editingVoter.commune}
                      onChange={(e) => setEditingVoter({...editingVoter, commune: e.target.value})}
                      placeholder="Ex: Moanda"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-arrondissement">Arrondissement</Label>
                    <Input
                      id="edit-arrondissement"
                      value={editingVoter.arrondissement}
                      onChange={(e) => setEditingVoter({...editingVoter, arrondissement: e.target.value})}
                      placeholder="Ex: 1er"
                    />
                  </div>
                </div>

                {/* Informations du centre */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Centre de Vote</h3>
                  
                  <div>
                    <Label htmlFor="edit-center">Nom du Centre *</Label>
                    <Input
                      id="edit-center"
                      value={editingVoter.center}
                      onChange={(e) => setEditingVoter({...editingVoter, center: e.target.value})}
                      placeholder="Ex: Moanda Plaine"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-bureau">Nom du Bureau *</Label>
                    <Input
                      id="edit-bureau"
                      value={editingVoter.bureau}
                      onChange={(e) => setEditingVoter({...editingVoter, bureau: e.target.value})}
                      placeholder="Ex: Bureau 1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-inscrits">Nombre d'Inscrits *</Label>
                    <Input
                      id="edit-inscrits"
                      type="number"
                      value={editingVoter.inscrits}
                      onChange={(e) => setEditingVoter({...editingVoter, inscrits: parseInt(e.target.value) || 0})}
                      placeholder="Ex: 411"
                    />
                  </div>
                </div>

                {/* Responsables du centre */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Responsable Centre</h3>
                  
                  <div>
                    <Label htmlFor="edit-responsableCentre">Nom du Responsable *</Label>
                    <Input
                      id="edit-responsableCentre"
                      value={editingVoter.responsableCentre}
                      onChange={(e) => setEditingVoter({...editingVoter, responsableCentre: e.target.value})}
                      placeholder="Ex: Jean M."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-contactRespoCentre">Contact Respo Centre</Label>
                    <Input
                      id="edit-contactRespoCentre"
                      value={editingVoter.contactRespoCentre}
                      onChange={(e) => setEditingVoter({...editingVoter, contactRespoCentre: e.target.value})}
                      placeholder="Ex: 076504888"
                    />
                  </div>
                </div>

                {/* Responsables du bureau */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Responsable Bureau</h3>
                  
                  <div>
                    <Label htmlFor="edit-responsableBureau">Nom du Responsable *</Label>
                    <Input
                      id="edit-responsableBureau"
                      value={editingVoter.responsableBureau}
                      onChange={(e) => setEditingVoter({...editingVoter, responsableBureau: e.target.value})}
                      placeholder="Ex: Marie K."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-contactRespoBureau">Contact Respo Bureau</Label>
                    <Input
                      id="edit-contactRespoBureau"
                      value={editingVoter.contactRespoBureau}
                      onChange={(e) => setEditingVoter({...editingVoter, contactRespoBureau: e.target.value})}
                      placeholder="Ex: 076504888"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-representantBureau">Représentant Bureau (Candidat)</Label>
                    <Input
                      id="edit-representantBureau"
                      value={editingVoter.representantBureau}
                      onChange={(e) => setEditingVoter({...editingVoter, representantBureau: e.target.value})}
                      placeholder="Ex: Paul M."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-contactReprCentre">Contact Repr Centre</Label>
                    <Input
                      id="edit-contactReprCentre"
                      value={editingVoter.contactReprCentre}
                      onChange={(e) => setEditingVoter({...editingVoter, contactReprCentre: e.target.value})}
                      placeholder="Ex: 076504888"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleUpdateVoter}
                className="bg-gov-blue hover:bg-gov-blue-dark"
                disabled={!editingVoter?.province || !editingVoter?.department || !editingVoter?.commune || !editingVoter?.center || !editingVoter?.bureau}
              >
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Voters;