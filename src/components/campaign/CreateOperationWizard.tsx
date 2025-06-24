
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import StepOne from './wizard/StepOne';
import StepTwo from './wizard/StepTwo';
import StepThree from './wizard/StepThree';

interface CreateOperationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface OperationFormData {
  title: string;
  type: string;
  customType?: string;
  startDate: Date | undefined;
  startTime: string;
  endDate: Date | undefined;
  endTime: string;
  province: string;
  city: string;
  district: string;
  neighborhood: string;
  exactAddress: string;
  responsible: string;
  assignedTeams: string[];
  objectives: string;
  resources: {
    tracts: number;
    posters: number;
    tshirts: number;
    sound: boolean;
    other: string;
  };
  budget: number;
}

const CreateOperationWizard = ({ open, onOpenChange }: CreateOperationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OperationFormData>({
    title: '',
    type: '',
    customType: '',
    startDate: undefined,
    startTime: '',
    endDate: undefined,
    endTime: '',
    province: '',
    city: '',
    district: '',
    neighborhood: '',
    exactAddress: '',
    responsible: '',
    assignedTeams: [],
    objectives: '',
    resources: {
      tracts: 0,
      posters: 0,
      tshirts: 0,
      sound: false,
      other: '',
    },
    budget: 0,
  });

  const updateFormData = (data: Partial<OperationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlanOperation = () => {
    console.log('Planifier opération:', formData);
    // Ici on ajouterait la logique pour sauvegarder l'opération
    onOpenChange(false);
    setCurrentStep(1);
  };

  const handleSaveDraft = () => {
    console.log('Sauvegarder brouillon:', formData);
    // Ici on ajouterait la logique pour sauvegarder comme brouillon
    onOpenChange(false);
    setCurrentStep(1);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Informations Générales';
      case 2: return 'Détails et Ressources';
      case 3: return 'Récapitulatif';
      default: return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <StepTwo formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StepThree formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gov-blue">
            Planifier une Opération de Campagne
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-gov-blue text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? <Check size={16} /> : step}
              </div>
              {step < 3 && (
                <div className={`h-1 w-16 mx-2 ${
                  step < currentStep ? 'bg-gov-blue' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{getStepTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft size={16} />
            <span>Précédent</span>
          </Button>

          <div className="flex space-x-2">
            {currentStep === 3 ? (
              <>
                <Button variant="outline" onClick={handleSaveDraft}>
                  Enregistrer comme Brouillon
                </Button>
                <Button onClick={handlePlanOperation} className="bg-gov-blue hover:bg-gov-blue-dark">
                  Planifier l'Opération
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gov-blue hover:bg-gov-blue-dark flex items-center space-x-2"
              >
                <span>Suivant</span>
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOperationWizard;
