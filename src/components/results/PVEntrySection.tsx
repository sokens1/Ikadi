
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  Upload,
  FileText,
  User,
  Calculator
} from 'lucide-react';

const PVEntrySection = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    province: '',
    ville: '',
    centre: '',
    bureau: '',
    votants: '',
    bulletinsNuls: '',
    suffragesExprimes: '',
    candidateVotes: {} as Record<string, string>,
    uploadedFile: null as File | null
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Mock data
  const hierarchyData = {
    provinces: ['Estuaire', 'Ogooué-Maritime', 'Haut-Ogooué'],
    villes: {
      'Estuaire': ['Libreville', 'Owendo', 'Akanda'],
      'Ogooué-Maritime': ['Port-Gentil', 'Omboué'],
      'Haut-Ogooué': ['Franceville', 'Moanda']
    },
    centres: {
      'Libreville': ['Centre Libreville Nord', 'Centre Libreville Sud'],
      'Owendo': ['Centre Owendo Principal'],
      'Port-Gentil': ['Centre Port-Gentil Centre', 'Centre Port-Gentil Est']
    },
    bureaux: {
      'Centre Libreville Nord': ['Bureau 001', 'Bureau 002', 'Bureau 003'],
      'Centre Owendo Principal': ['Bureau 001', 'Bureau 002', 'Bureau 003', 'Bureau 004']
    }
  };

  const candidatesData = [
    { id: 'C001', name: 'ALLOGHO-OBIANG Marie', party: 'Parti Démocratique Gabonais' },
    { id: 'C002', name: 'NDONG Jean-Baptiste', party: 'Union Nationale' },
    { id: 'C003', name: 'OVONO-EBANG Claire', party: 'Rassemblement pour la Patrie' }
  ];

  const recentEntries = [
    {
      id: 'PV001',
      bureau: 'Centre Libreville Nord - Bureau 001',
      agent: 'MOUNGUENGUI Paul',
      timestamp: '14:30',
      status: 'validated'
    },
    {
      id: 'PV002',
      bureau: 'Centre Owendo - Bureau 002',
      agent: 'NZAME Marie',
      timestamp: '14:25',
      status: 'pending'
    }
  ];

  // Validation en temps réel
  const validateParticipation = () => {
    const errors: Record<string, string> = {};
    const votants = parseInt(formData.votants) || 0;
    const nuls = parseInt(formData.bulletinsNuls) || 0;
    const exprimes = parseInt(formData.suffragesExprimes) || 0;
    const inscrits = 500; // Mock data - should come from bureau info

    if (votants > inscrits) {
      errors.votants = `Le nombre de votants (${votants}) ne peut pas dépasser le nombre d'inscrits (${inscrits})`;
    }

    if ((nuls + exprimes) !== votants && votants > 0) {
      errors.total = `Bulletins nuls (${nuls}) + Suffrages exprimés (${exprimes}) = ${nuls + exprimes} ≠ Votants (${votants})`;
    }

    return errors;
  };

  const validateCandidateVotes = () => {
    const errors: Record<string, string> = {};
    const exprimes = parseInt(formData.suffragesExprimes) || 0;
    const totalVotes = Object.values(formData.candidateVotes).reduce((sum, votes) => sum + (parseInt(votes) || 0), 0);

    if (totalVotes !== exprimes && exprimes > 0) {
      errors.candidateTotal = `Total des voix des candidats (${totalVotes}) ≠ Suffrages exprimés (${exprimes})`;
    }

    return errors;
  };

  const handleStepValidation = (step: number) => {
    let errors: Record<string, string> = {};
    
    if (step === 2) {
      errors = validateParticipation();
    } else if (step === 3) {
      errors = { ...validateParticipation(), ...validateCandidateVotes() };
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (handleStepValidation(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, uploadedFile: file });
    }
  };

  const canSubmit = () => {
    const step2Valid = Object.keys(validateParticipation()).length === 0;
    const step3Valid = Object.keys(validateCandidateVotes()).length === 0;
    return step2Valid && step3Valid && formData.uploadedFile;
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (currentStep === step) return <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{step}</div>;
    return <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">{step}</div>;
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification du Bureau de Vote</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Province</Label>
                <Select value={formData.province} onValueChange={(value) => setFormData({ ...formData, province: value, ville: '', centre: '', bureau: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une province" />
                  </SelectTrigger>
                  <SelectContent>
                    {hierarchyData.provinces.map((province) => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ville">Ville</Label>
                <Select 
                  value={formData.ville} 
                  onValueChange={(value) => setFormData({ ...formData, ville: value, centre: '', bureau: '' })}
                  disabled={!formData.province}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.province && hierarchyData.villes[formData.province as keyof typeof hierarchyData.villes]?.map((ville) => (
                      <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="centre">Centre de Vote</Label>
                <Select 
                  value={formData.centre} 
                  onValueChange={(value) => setFormData({ ...formData, centre: value, bureau: '' })}
                  disabled={!formData.ville}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un centre" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.ville && hierarchyData.centres[formData.ville as keyof typeof hierarchyData.centres]?.map((centre) => (
                      <SelectItem key={centre} value={centre}>{centre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bureau">Bureau de Vote</Label>
                <Select 
                  value={formData.bureau} 
                  onValueChange={(value) => setFormData({ ...formData, bureau: value })}
                  disabled={!formData.centre}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un bureau" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.centre && hierarchyData.bureaux[formData.centre as keyof typeof hierarchyData.bureaux]?.map((bureau) => (
                      <SelectItem key={bureau} value={bureau}>{bureau}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.bureau && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Information du Bureau</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Électeurs inscrits:</span>
                    <span className="font-semibold ml-2">500</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Président:</span>
                    <span className="font-semibold ml-2">ONDONG Michel</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saisie des Chiffres de Participation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="votants">Nombre de Votants</Label>
                <Input
                  id="votants"
                  type="number"
                  value={formData.votants}
                  onChange={(e) => setFormData({ ...formData, votants: e.target.value })}
                  className={validationErrors.votants ? 'border-red-500' : ''}
                />
                {validationErrors.votants && (
                  <div className="flex items-center space-x-1 mt-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">{validationErrors.votants}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="bulletinsNuls">Bulletins Nuls</Label>
                <Input
                  id="bulletinsNuls"
                  type="number"
                  value={formData.bulletinsNuls}
                  onChange={(e) => setFormData({ ...formData, bulletinsNuls: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="suffragesExprimes">Suffrages Exprimés</Label>
                <Input
                  id="suffragesExprimes"
                  type="number"
                  value={formData.suffragesExprimes}
                  onChange={(e) => setFormData({ ...formData, suffragesExprimes: e.target.value })}
                />
              </div>
            </div>

            {validationErrors.total && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{validationErrors.total}</span>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Vérification Automatique</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Bulletins nuls + Suffrages exprimés:</span>
                  <span className="font-semibold">
                    {(parseInt(formData.bulletinsNuls) || 0) + (parseInt(formData.suffragesExprimes) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nombre de votants:</span>
                  <span className="font-semibold">{parseInt(formData.votants) || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saisie des Résultats par Candidat</h3>
            
            <div className="space-y-4">
              {candidatesData.map((candidate) => (
                <div key={candidate.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                      <p className="text-sm text-gray-600">{candidate.party}</p>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Voix"
                        value={formData.candidateVotes[candidate.id] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          candidateVotes: { ...formData.candidateVotes, [candidate.id]: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {validationErrors.candidateTotal && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{validationErrors.candidateTotal}</span>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Vérification des Résultats</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Total voix candidats:</span>
                  <span className="font-semibold">
                    {Object.values(formData.candidateVotes).reduce((sum, votes) => sum + (parseInt(votes) || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Suffrages exprimés:</span>
                  <span className="font-semibold">{parseInt(formData.suffragesExprimes) || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import du PV Scanné</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Téléverser le PV physique</h4>
              <p className="text-sm text-gray-600 mb-4">Formats acceptés: PDF, JPG, PNG (max. 10MB)</p>
              
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choisir un fichier
                </Button>
              </label>
              
              {formData.uploadedFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-green-700">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{formData.uploadedFile.name}</span>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vérification et Soumission</h3>
            
            <div className="space-y-6">
              {/* Résumé des données */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé des Données Saisies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Bureau de Vote</h4>
                    <p className="text-sm text-gray-600">
                      {formData.province} → {formData.ville} → {formData.centre} → {formData.bureau}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Participation</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Votants:</span>
                        <span className="font-semibold ml-2">{formData.votants}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bulletins nuls:</span>
                        <span className="font-semibold ml-2">{formData.bulletinsNuls}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Suffrages exprimés:</span>
                        <span className="font-semibold ml-2">{formData.suffragesExprimes}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Résultats par Candidat</h4>
                    <div className="space-y-2">
                      {candidatesData.map((candidate) => (
                        <div key={candidate.id} className="flex justify-between text-sm">
                          <span>{candidate.name}</span>
                          <span className="font-semibold">{formData.candidateVotes[candidate.id] || 0} voix</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Document Attaché</h4>
                    {formData.uploadedFile ? (
                      <div className="flex items-center space-x-2 text-green-700">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{formData.uploadedFile.name}</span>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">Aucun document attaché</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!showWizard) {
    return (
      <div className="space-y-6">
        {/* Bouton principal d'action */}
        <div className="text-center">
          <Button 
            onClick={() => setShowWizard(true)}
            size="lg"
            className="bg-gov-blue hover:bg-gov-blue-dark text-white px-8 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Saisir un nouveau PV
          </Button>
        </div>

        {/* Liste des saisies récentes */}
        <Card className="gov-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-gray">
              <FileText className="w-5 h-5" />
              <span>Saisies Récentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.bureau}</h3>
                      <p className="text-sm text-gray-600">Par {entry.agent} à {entry.timestamp}</p>
                    </div>
                  </div>
                  <Badge className={entry.status === 'validated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {entry.status === 'validated' ? 'Validé' : 'En attente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <Card className="gov-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Assistant de Saisie PV</h2>
            <Button 
              variant="outline" 
              onClick={() => setShowWizard(false)}
            >
              Annuler
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                {getStepIcon(step)}
                {step < 5 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
              </div>
            ))}
          </div>
          
          <Progress value={(currentStep / 5) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Étape {currentStep} sur 5</span>
            <span>{Math.round((currentStep / 5) * 100)}% complété</span>
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card className="gov-card">
        <CardContent className="p-6">
          {renderWizardStep()}
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            
            {currentStep < 5 ? (
              <Button 
                onClick={nextStep}
                disabled={!formData.bureau && currentStep === 1}
                className="bg-gov-blue hover:bg-gov-blue-dark"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  // Handle form submission
                  setShowWizard(false);
                  setCurrentStep(1);
                  setFormData({
                    province: '',
                    ville: '',
                    centre: '',
                    bureau: '',
                    votants: '',
                    bulletinsNuls: '',
                    suffragesExprimes: '',
                    candidateVotes: {},
                    uploadedFile: null
                  });
                }}
                disabled={!canSubmit()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Soumettre le PV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PVEntrySection;
