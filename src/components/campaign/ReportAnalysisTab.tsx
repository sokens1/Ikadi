
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BarChart, FileText, Upload, DollarSign, Camera } from 'lucide-react';

interface ReportAnalysisTabProps {
  operationId: number;
}

const ReportAnalysisTab = ({ operationId }: ReportAnalysisTabProps) => {
  const [quantitativeData, setQuantitativeData] = useState({
    participants: '',
    tractsDistributed: '',
    promisesCollected: ''
  });
  
  const [qualitativeData, setQualitativeData] = useState({
    fieldFeedback: '',
    mediaFiles: [] as File[]
  });
  
  const [financialData, setFinancialData] = useState({
    actualCost: '',
    receipts: [] as File[]
  });

  const handleQuantitativeChange = (field: string, value: string) => {
    setQuantitativeData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (type: 'media' | 'receipts', files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    if (type === 'media') {
      setQualitativeData(prev => ({ ...prev, mediaFiles: [...prev.mediaFiles, ...fileArray] }));
    } else {
      setFinancialData(prev => ({ ...prev, receipts: [...prev.receipts, ...fileArray] }));
    }
  };

  const handleSaveReport = () => {
    const reportData = {
      operationId,
      quantitative: quantitativeData,
      qualitative: qualitativeData,
      financial: financialData
    };
    console.log('Sauvegarde du rapport:', reportData);
    // Ici on sauvegarderait les données
  };

  return (
    <div className="space-y-6">
      {/* Rapport Quantitatif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart size={20} />
            <span>Rapport Quantitatif</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="participants">Nombre de participants / foyers visités</Label>
              <Input
                id="participants"
                type="number"
                value={quantitativeData.participants}
                onChange={(e) => handleQuantitativeChange('participants', e.target.value)}
                placeholder="Ex: 150"
              />
            </div>
            <div>
              <Label htmlFor="tracts">Nombre de tracts distribués</Label>
              <Input
                id="tracts"
                type="number"
                value={quantitativeData.tractsDistributed}
                onChange={(e) => handleQuantitativeChange('tractsDistributed', e.target.value)}
                placeholder="Ex: 300"
              />
            </div>
            <div>
              <Label htmlFor="promises">Promesses de vote/soutiens recueillis</Label>
              <Input
                id="promises"
                type="number"
                value={quantitativeData.promisesCollected}
                onChange={(e) => handleQuantitativeChange('promisesCollected', e.target.value)}
                placeholder="Ex: 45"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rapport Qualitatif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText size={20} />
            <span>Rapport Qualitatif</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="feedback">Feedback du Terrain</Label>
            <Textarea
              id="feedback"
              value={qualitativeData.fieldFeedback}
              onChange={(e) => setQualitativeData(prev => ({ ...prev, fieldFeedback: e.target.value }))}
              placeholder="Décrivez l'ambiance, les questions récurrentes des citoyens, les points positifs et les difficultés rencontrées..."
              className="min-h-32"
            />
          </div>
          
          <div>
            <Label className="flex items-center space-x-2">
              <Camera size={16} />
              <span>Galerie Média</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Téléversez des photos et vidéos de l'opération</p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload('media', e.target.files)}
                className="hidden"
                id="media-upload"
              />
              <Button variant="outline" onClick={() => document.getElementById('media-upload')?.click()}>
                Choisir des fichiers
              </Button>
            </div>
            {qualitativeData.mediaFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {qualitativeData.mediaFiles.length} fichier(s) sélectionné(s)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rapport Financier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign size={20} />
            <span>Rapport Financier</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="actualCost">Coût Réel (XAF)</Label>
            <Input
              id="actualCost"
              type="number"
              value={financialData.actualCost}
              onChange={(e) => setFinancialData(prev => ({ ...prev, actualCost: e.target.value }))}
              placeholder="Ex: 45000"
            />
          </div>
          
          <div>
            <Label>Justificatifs (Factures/Reçus)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Téléversez les factures et reçus</p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload('receipts', e.target.files)}
                className="hidden"
                id="receipt-upload"
              />
              <Button variant="outline" onClick={() => document.getElementById('receipt-upload')?.click()}>
                Choisir des fichiers
              </Button>
            </div>
            {financialData.receipts.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {financialData.receipts.length} justificatif(s) téléversé(s)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button onClick={handleSaveReport} className="bg-gov-blue hover:bg-gov-blue-dark">
          Sauvegarder le Rapport
        </Button>
      </div>
    </div>
  );
};

export default ReportAnalysisTab;
