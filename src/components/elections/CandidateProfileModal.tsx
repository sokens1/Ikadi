import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Building, Users, Phone, Mail, MapPin, Calendar, Award } from 'lucide-react';
import InitialsAvatar from '@/components/ui/initials-avatar';

interface Candidate {
  id: string;
  name: string;
  party: string;
  isOurCandidate: boolean;
  photo?: string;
  // Informations supplémentaires pour le profil
  bio?: string;
  experience?: string;
  education?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  achievements?: string[];
  campaign_promises?: string[];
}

interface CandidateProfileModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
}

const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  candidate,
  isOpen,
  onClose
}) => {
  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4 sm:pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <InitialsAvatar 
                name={candidate.name} 
                size="xl" 
                className="shadow-lg"
              />
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {candidate.name}
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 mt-1">
                  {candidate.party}
                </DialogDescription>
                {candidate.isOurCandidate && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1e40af] text-white mt-2">
                    <Award className="w-3 h-3 mr-1" />
                    Notre Candidat
                  </span>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de contact */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1e40af]" />
              Informations de Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidate.contact?.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-4 h-4 text-[#1e40af]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Téléphone</p>
                    <p className="text-gray-900">{candidate.contact.phone}</p>
                  </div>
                </div>
              )}
              {candidate.contact?.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{candidate.contact.email}</p>
                  </div>
                </div>
              )}
              {candidate.contact?.address && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Adresse</p>
                    <p className="text-gray-900">{candidate.contact.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Biographie */}
          {candidate.bio && (
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1e40af]" />
                Biographie
              </h3>
              <p className="text-gray-700 leading-relaxed">{candidate.bio}</p>
            </div>
          )}

          {/* Expérience */}
          {candidate.experience && (
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#1e40af]" />
                Expérience Professionnelle
              </h3>
              <p className="text-gray-700 leading-relaxed">{candidate.experience}</p>
            </div>
          )}

          {/* Formation */}
          {candidate.education && (
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1e40af]" />
                Formation
              </h3>
              <p className="text-gray-700 leading-relaxed">{candidate.education}</p>
            </div>
          )}

          {/* Réalisations */}
          {candidate.achievements && candidate.achievements.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1e40af]" />
                Réalisations
              </h3>
              <ul className="space-y-2">
                {candidate.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-[#1e40af] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Promesses de campagne */}
          {candidate.campaign_promises && candidate.campaign_promises.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1e40af]" />
                Promesses de Campagne
              </h3>
              <ul className="space-y-3">
                {candidate.campaign_promises.map((promise, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#1e40af] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{promise}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Fermer
            </Button>
            {/* <Button 
              className="w-full sm:w-auto bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
            >
              Contacter le candidat
            </Button> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateProfileModal;
