
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Target, Package, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { OperationFormData } from '../CreateOperationWizard';

interface StepThreeProps {
  formData: OperationFormData;
}

const StepThree = ({ formData }: StepThreeProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Récapitulatif de l'Opération</h3>
        <p className="text-sm text-gray-600">Vérifiez les informations avant de planifier l'opération</p>
      </div>

      {/* Informations Générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Calendar className="h-4 w-4" />
            <span>Informations Générales</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">Titre:</span>
            <p className="text-gray-700">{formData.title}</p>
          </div>
          <div>
            <span className="font-medium">Type:</span>
            <Badge className="ml-2 bg-blue-100 text-blue-800">
              {formData.type === 'Autre' ? formData.customType : formData.type}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Début:</span>
              <p className="text-gray-700">
                {formData.startDate ? format(formData.startDate, "PPP", { locale: fr }) : 'Non définie'}
                {formData.startTime && ` à ${formData.startTime}`}
              </p>
            </div>
            <div>
              <span className="font-medium">Fin:</span>
              <p className="text-gray-700">
                {formData.endDate ? format(formData.endDate, "PPP", { locale: fr }) : 'Non définie'}
                {formData.endTime && ` à ${formData.endTime}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lieu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <MapPin className="h-4 w-4" />
            <span>Localisation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-gray-700">
              {[formData.neighborhood, formData.district, formData.city, formData.province]
                .filter(Boolean)
                .join(', ')}
            </p>
            {formData.exactAddress && (
              <p className="text-sm text-gray-600">Adresse: {formData.exactAddress}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Équipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Users className="h-4 w-4" />
            <span>Équipe</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">Responsable:</span>
            <p className="text-gray-700">{formData.responsible}</p>
          </div>
          {formData.assignedTeams.length > 0 && (
            <div>
              <span className="font-medium">Équipes assignées:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.assignedTeams.map((team) => (
                  <Badge key={team} variant="outline">{team}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Objectifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Target className="h-4 w-4" />
            <span>Objectifs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{formData.objectives}</p>
        </CardContent>
      </Card>

      {/* Ressources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Package className="h-4 w-4" />
            <span>Ressources Matérielles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {formData.resources.tracts > 0 && (
              <div>Tracts: <span className="font-medium">{formData.resources.tracts}</span></div>
            )}
            {formData.resources.posters > 0 && (
              <div>Affiches: <span className="font-medium">{formData.resources.posters}</span></div>
            )}
            {formData.resources.tshirts > 0 && (
              <div>T-shirts: <span className="font-medium">{formData.resources.tshirts}</span></div>
            )}
            {formData.resources.sound && (
              <div className="text-green-600">✓ Sonorisation</div>
            )}
          </div>
          {formData.resources.other && (
            <p className="text-sm text-gray-600 mt-2">Autre: {formData.resources.other}</p>
          )}
        </CardContent>
      </Card>

      {/* Budget */}
      {formData.budget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <Euro className="h-4 w-4" />
              <span>Budget</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gov-blue">{formData.budget} €/XAF</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StepThree;
