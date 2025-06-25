
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus, Trash2, Star } from 'lucide-react';

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  party: string;
  photo?: string;
  isOurCandidate: boolean;
}

interface ElectionData {
  name: string;
  type: string;
  date: string;
  seatsToFill: number;
  budget?: number;
  voteTarget?: number;
  province: string;
  department: string;
  commune: string;
  district: string;
  totalCenters: number;
  averageBureausPerCenter: number;
  totalVoters: number;
  candidates: Candidate[];
}

interface ElectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onElectionCreated: (election: any) => void;
}

const ElectionWizard = ({ open, onOpenChange, onElectionCreated }: ElectionWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [electionData, setElectionData] = useState<ElectionData>({
    name: '',
    type: '',
    date: '',
    seatsToFill: 1,
    budget: undefined,
    voteTarget: undefined,
    province: '',
    department: '',
    commune: '',
    district: '',
    totalCenters: 0,
    averageBureausPerCenter: 4,
    totalVoters: 0,
    candidates: []
  });

  const [candidateForm, setCandidateForm] = useState({
    firstName: '',
    lastName: '',
    party: '',
    isOurCandidate: false
  });

  const provinces = [
    'Estuaire', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié',
    'Nyanga', 'Ogooué-Ivindo', 'Ogooué-Lolo', 'Ogooué-Maritime', 'Woleu-Ntem'
  ];

  const electionTypes = [
    'Législatives', 'Présidentielle', 'Municipales', 'Départementales', 'Locales'
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddCandidate = () => {
    if (candidateForm.firstName && candidateForm.lastName) {
      const newCandidate: Candidate = {
        id: Date.now(),
        firstName: candidateForm.firstName,
        lastName: candidateForm.lastName,
        party: candidateForm.party,
        isOurCandidate: candidateForm.isOurCandidate
      };

      // If this is marked as our candidate, unmark others
      let updatedCandidates = electionData.candidates;
      if (candidateForm.isOurCandidate) {
        updatedCandidates = updatedCandidates.map(c => ({ ...c, isOurCandidate: false }));
      }

      setElectionData({
        ...electionData,
        candidates: [...updatedCandidates, newCandidate]
      });

      setCandidateForm({
        firstName: '',
        lastName: '',
        party: '',
        isOurCandidate: false
      });
    }
  };

  const handleRemoveCandidate = (id: number) => {
    setElectionData({
      ...electionData,
      candidates: electionData.candidates.filter(c => c.id !== id)
    });
  };

  const handleFinish = () => {
    const newElection = {
      id: Date.now(),
      ...electionData,
      totalBureaus: electionData.totalCenters * electionData.averageBureausPerCenter,
      status: 'À venir' as const
    };
    
    onElectionCreated(newElection);
    
    // Reset form
    setCurrentStep(1);
    setElectionData({
      name: '',
      type: '',
      date: '',
      seatsToFill: 1,
      budget: undefined,
      voteTarget: undefined,
      province: '',
      department: '',
      commune: '',
      district: '',
      totalCenters: 0,
      averageBureausPerCenter: 4,
      totalVoters: 0,
      candidates: []
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations Générales de l'Élection</h3>
            
            <div>
              <Label htmlFor="name">Nom de l'élection</Label>
              <Input
                id="name"
                value={electionData.name}
                onChange={(e) => setElectionData({ ...electionData, name: e.target.value })}
                placeholder="Ex: Législatives 2023 - Siège unique Moanda"
              />
            </div>

            <div>
              <Label htmlFor="type">Type d'élection</Label>
              <Select value={electionData.type} onValueChange={(value) => setElectionData({ ...electionData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {electionTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date du scrutin</Label>
              <Input
                id="date"
                type="date"
                value={electionData.date}
                onChange={(e) => setElectionData({ ...electionData, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seats">Siège(s) à pourvoir</Label>
                <Input
                  id="seats"
                  type="number"
                  value={electionData.seatsToFill}
                  onChange={(e) => setElectionData({ ...electionData, seatsToFill: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget alloué (FCFA)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={electionData.budget || ''}
                  onChange={(e) => setElectionData({ ...electionData, budget: parseInt(e.target.value) || undefined })}
                  placeholder="Optionnel"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target">Objectif de voix</Label>
              <Input
                id="target"
                type="number"
                value={electionData.voteTarget || ''}
                onChange={(e) => setElectionData({ ...electionData, voteTarget: parseInt(e.target.value) || undefined })}
                placeholder="Optionnel"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Définition de la Circonscription Électorale</h3>
            
            <div>
              <Label htmlFor="province">Province</Label>
              <Select value={electionData.province} onValueChange={(value) => setElectionData({ ...electionData, province: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={electionData.department}
                onChange={(e) => setElectionData({ ...electionData, department: e.target.value })}
                placeholder="Ex: Lemboumbi-Leyou"
              />
            </div>

            <div>
              <Label htmlFor="commune">Commune / Canton / District</Label>
              <Input
                id="commune"
                value={electionData.commune}
                onChange={(e) => setElectionData({ ...electionData, commune: e.target.value })}
                placeholder="Ex: Commune de Moanda"
              />
            </div>

            <div>
              <Label htmlFor="district">Arrondissement / Siège</Label>
              <Input
                id="district"
                value={electionData.district}
                onChange={(e) => setElectionData({ ...electionData, district: e.target.value })}
                placeholder="Ex: 1er Arrondissement"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Ajout des Candidats</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ajouter un candidat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom(s)</Label>
                    <Input
                      id="firstName"
                      value={candidateForm.firstName}
                      onChange={(e) => setCandidateForm({ ...candidateForm, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={candidateForm.lastName}
                      onChange={(e) => setCandidateForm({ ...candidateForm, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="party">Parti politique / Appartenance</Label>
                  <Input
                    id="party"
                    value={candidateForm.party}
                    onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ourCandidate"
                    checked={candidateForm.isOurCandidate}
                    onCheckedChange={(checked) => setCandidateForm({ ...candidateForm, isOurCandidate: checked as boolean })}
                  />
                  <Label htmlFor="ourCandidate" className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>C'est notre candidat</span>
                  </Label>
                </div>

                <Button onClick={handleAddCandidate} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter ce candidat
                </Button>
              </CardContent>
            </Card>

            {electionData.candidates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Candidats ajoutés ({electionData.candidates.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {electionData.candidates.map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {candidate.isOurCandidate && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <div>
                            <div className="font-medium">
                              {candidate.firstName} {candidate.lastName}
                            </div>
                            <div className="text-sm text-gray-600">{candidate.party}</div>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveCandidate(candidate.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pré-configuration des Centres et Bureaux</h3>
            
            <div>
              <Label htmlFor="totalCenters">Nombre total de Centres de Vote prévus</Label>
              <Input
                id="totalCenters"
                type="number"
                value={electionData.totalCenters}
                onChange={(e) => setElectionData({ ...electionData, totalCenters: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 12"
              />
            </div>

            <div>
              <Label htmlFor="averageBureaus">Nombre moyen de Bureaux de Vote par Centre</Label>
              <Input
                id="averageBureaus"
                type="number"
                value={electionData.averageBureausPerCenter}
                onChange={(e) => setElectionData({ ...electionData, averageBureausPerCenter: parseInt(e.target.value) || 4 })}
                placeholder="Ex: 4"
              />
              <p className="text-sm text-gray-600 mt-1">
                Total estimé de bureaux: {electionData.totalCenters * electionData.averageBureausPerCenter}
              </p>
            </div>

            <div>
              <Label htmlFor="totalVoters">Nombre total d'Électeurs inscrits (estimation)</Label>
              <Input
                id="totalVoters"
                type="number"
                value={electionData.totalVoters}
                onChange={(e) => setElectionData({ ...electionData, totalVoters: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 15240"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Ces chiffres sont des estimations pour pré-remplir les données. 
                Le détail pourra être ajusté plus tard, centre par centre.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Récapitulatif et Création</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>Résumé de l'élection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Nom:</strong> {electionData.name}
                </div>
                <div>
                  <strong>Type:</strong> {electionData.type}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(electionData.date).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <strong>Circonscription:</strong> {electionData.province} &gt; {electionData.department} &gt; {electionData.commune}, {electionData.district}
                </div>
                <div>
                  <strong>Candidats:</strong> {electionData.candidates.length} 
                  {electionData.candidates.find(c => c.isOurCandidate) && (
                    <span className="ml-2 text-yellow-600">
                      (dont {electionData.candidates.find(c => c.isOurCandidate)?.firstName} {electionData.candidates.find(c => c.isOurCandidate)?.lastName} - Notre candidat)
                    </span>
                  )}
                </div>
                <div>
                  <strong>Structure:</strong> {electionData.totalCenters} centres de vote, 
                  ~{electionData.totalCenters * electionData.averageBureausPerCenter} bureaux de vote, 
                  ~{electionData.totalVoters.toLocaleString('fr-FR')} électeurs
                </div>
                {electionData.budget && (
                  <div>
                    <strong>Budget:</strong> {electionData.budget.toLocaleString('fr-FR')} FCFA
                  </div>
                )}
                {electionData.voteTarget && (
                  <div>
                    <strong>Objectif de voix:</strong> {electionData.voteTarget.toLocaleString('fr-FR')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Configuration d'une nouvelle élection - Étape {currentStep}/5
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
              Créer l'élection
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ElectionWizard;
