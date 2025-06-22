import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MapPin, 
  Search, 
  Filter,
  Phone,
  Mail,
  Users,
  Building,
  ArrowLeft,
  Star,
  Eye
} from 'lucide-react';

// Types pour les données
interface VotingCenter {
  id: string;
  name: string;
  address: string;
  province: string;
  city: string;
  district: string;
  coordinates: { lat: number; lng: number };
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  photo: string;
  totalVoters: number;
  totalBureaux: number;
}

interface Bureau {
  id: string;
  name: string;
  registeredVoters: number;
  urns: number;
  president: string;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  photo: string;
  isPriority: boolean; // Candidat du directeur
}

const VotingCenters = () => {
  const [selectedCenter, setSelectedCenter] = useState<VotingCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Données mock pour les centres de vote
  const votingCenters: VotingCenter[] = [
    {
      id: 'CV001',
      name: 'École Primaire de Libreville Centre',
      address: '15 Avenue de la République, Libreville',
      province: 'Estuaire',
      city: 'Libreville',
      district: 'Centre',
      coordinates: { lat: 0.3936, lng: 9.4573 },
      contact: {
        name: 'Marie Ngoua',
        phone: '+241 01 23 45 67',
        email: 'marie.ngoua@education.ga'
      },
      photo: '/placeholder.svg',
      totalVoters: 2450,
      totalBureaux: 8
    },
    {
      id: 'CV002',
      name: 'Lycée National Léon Mba',
      address: '45 Boulevard Triomphal Omar Bongo, Libreville',
      province: 'Estuaire',
      city: 'Libreville',
      district: 'Batterie IV',
      coordinates: { lat: 0.4162, lng: 9.4673 },
      contact: {
        name: 'Paul Obame',
        phone: '+241 01 34 56 78',
        email: 'paul.obame@education.ga'
      },
      photo: '/placeholder.svg',
      totalVoters: 3200,
      totalBureaux: 12
    }
  ];

  // Données mock pour les bureaux
  const bureaux: Bureau[] = [
    { id: 'BV001', name: 'Bureau 1', registeredVoters: 320, urns: 2, president: 'Jean Makaya' },
    { id: 'BV002', name: 'Bureau 2', registeredVoters: 298, urns: 2, president: 'Sophie Ndong' },
    { id: 'BV003', name: 'Bureau 3', registeredVoters: 315, urns: 2, president: 'Pierre Mounanga' },
    { id: 'BV004', name: 'Bureau 4', registeredVoters: 287, urns: 2, president: 'Fatou Diabaté' }
  ];

  // Données mock pour les candidats
  const candidates: Candidate[] = [
    { id: 'C001', name: 'Dr. Antoine Mba', party: 'Parti Démocratique Gabonais', photo: '/placeholder.svg', isPriority: true },
    { id: 'C002', name: 'Marie-Claire Ondo', party: 'Union Nationale', photo: '/placeholder.svg', isPriority: false },
    { id: 'C003', name: 'François Engonga', party: 'Rassemblement pour le Gabon', photo: '/placeholder.svg', isPriority: false },
    { id: 'C004', name: 'Sylvie Bouanga', party: 'Coalition pour la Nouvelle République', photo: '/placeholder.svg', isPriority: false }
  ];

  const provinces = ['Estuaire', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié', 'Nyanga'];
  const cities = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Mouila'];

  const filteredCenters = votingCenters.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = !selectedProvince || center.province === selectedProvince;
    const matchesCity = !selectedCity || center.city === selectedCity;
    return matchesSearch && matchesProvince && matchesCity;
  });

  if (selectedCenter) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          {/* En-tête avec bouton retour */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedCenter(null)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la liste</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gov-gray">{selectedCenter.name}</h1>
              <p className="text-gray-600">{selectedCenter.address}</p>
            </div>
          </div>

          {/* Interface à onglets pour les détails du centre */}
          <Card className="gov-card">
            <CardContent className="p-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="general" className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Infos Générales</span>
                  </TabsTrigger>
                  <TabsTrigger value="bureaux" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Bureaux de Vote</span>
                  </TabsTrigger>
                  <TabsTrigger value="candidats" className="flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Candidats Concernés</span>
                  </TabsTrigger>
                </TabsList>

                {/* Onglet Infos Générales */}
                <TabsContent value="general" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Photo du lieu */}
                    <Card className="gov-card">
                      <CardHeader>
                        <CardTitle className="text-lg">Photo du Centre</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img 
                          src={selectedCenter.photo} 
                          alt={selectedCenter.name}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>

                    {/* Informations du centre */}
                    <div className="space-y-4">
                      <Card className="gov-card">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-gov-blue" />
                            <span>Localisation</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="font-medium">Adresse :</span>
                            <p className="text-gray-600">{selectedCenter.address}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium">Province :</span>
                              <p className="text-gray-600">{selectedCenter.province}</p>
                            </div>
                            <div>
                              <span className="font-medium">Ville :</span>
                              <p className="text-gray-600">{selectedCenter.city}</p>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Coordonnées GPS :</span>
                            <p className="text-gray-600 font-mono">
                              {selectedCenter.coordinates.lat}, {selectedCenter.coordinates.lng}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="gov-card">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Phone className="w-5 h-5 text-gov-blue" />
                            <span>Contact du Responsable</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="font-medium">Nom :</span>
                            <p className="text-gray-600">{selectedCenter.contact.name}</p>
                          </div>
                          <div>
                            <span className="font-medium">Téléphone :</span>
                            <p className="text-gray-600">{selectedCenter.contact.phone}</p>
                          </div>
                          <div>
                            <span className="font-medium">Email :</span>
                            <p className="text-gray-600">{selectedCenter.contact.email}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Statistiques du centre */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="gov-card border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Électeurs</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedCenter.totalVoters.toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <Users className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="gov-card border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Bureaux de Vote</p>
                            <p className="text-2xl font-bold text-green-600">{selectedCenter.totalBureaux}</p>
                          </div>
                          <Building className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Onglet Bureaux de Vote */}
                <TabsContent value="bureaux" className="space-y-4">
                  <Card className="gov-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Liste des Bureaux de Vote</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID du Bureau</TableHead>
                            <TableHead>Électeurs Inscrits</TableHead>
                            <TableHead>Nombre d'Urnes</TableHead>
                            <TableHead>Président du Bureau</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bureaux.map((bureau) => (
                            <TableRow key={bureau.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{bureau.id}</TableCell>
                              <TableCell>{bureau.registeredVoters.toLocaleString('fr-FR')}</TableCell>
                              <TableCell>{bureau.urns}</TableCell>
                              <TableCell>{bureau.president}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Candidats Concernés */}
                <TabsContent value="candidats" className="space-y-4">
                  <Card className="gov-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Candidats pour cette Circonscription</CardTitle>
                      <p className="text-sm text-gray-600">
                        Liste des candidats pour lesquels les électeurs de ce centre peuvent voter
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidates.map((candidate) => (
                          <Card 
                            key={candidate.id} 
                            className={`gov-card ${candidate.isPriority ? 'border-2 border-gov-blue bg-blue-50' : ''}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <img 
                                  src={candidate.photo} 
                                  alt={candidate.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                    {candidate.isPriority && (
                                      <Badge className="bg-gov-blue text-white">
                                        <Star className="w-3 h-3 mr-1" />
                                        Prioritaire
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-sm">{candidate.party}</p>
                                  <Button variant="outline" size="sm" className="mt-2">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Voir Profil
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gov-gray">Centres et Bureaux de Vote</h1>
          <p className="text-gray-600 mt-2">
            Annuaire détaillé de tous les lieux de vote physiques
          </p>
        </div>

        {/* Filtres et recherche */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtres de Recherche</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nom du centre ou adresse..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Province</label>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map(province => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ville</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les villes" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedProvince('');
                    setSelectedCity('');
                  }}
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <Card 
              key={center.id} 
              className="gov-card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCenter(center)}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gov-gray">
                  {center.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{center.address}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Localisation */}
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gov-blue" />
                    <span>{center.province} • {center.city}</span>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {center.totalVoters.toLocaleString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">Électeurs</div>
                    </div>
                    <div className="text-center">
                      <Building className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {center.totalBureaux}
                      </div>
                      <div className="text-xs text-gray-500">Bureaux</div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{center.contact.name}</p>
                    <p>{center.contact.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCenters.length === 0 && (
          <Card className="gov-card">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Aucun centre de vote trouvé avec ces critères de recherche.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default VotingCenters;
