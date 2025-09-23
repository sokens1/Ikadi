import { z } from 'zod';

// Schémas de validation pour les élections

// Schéma pour la localisation géographique
export const GeographicLocationSchema = z.object({
  province: z.string().min(1, 'La province est requise'),
  department: z.string().min(1, 'Le département est requis'),
  commune: z.string().min(1, 'La commune est requise'),
  arrondissement: z.string().min(1, 'L\'arrondissement est requis'),
  fullAddress: z.string().optional(),
});

// Schéma pour la configuration d'élection
export const ElectionConfigSchema = z.object({
  seatsAvailable: z.number().int().min(1, 'Le nombre de sièges doit être au moins 1'),
  budget: z.number().min(0, 'Le budget ne peut pas être négatif').optional(),
  voteGoal: z.number().int().min(0, 'L\'objectif de voix ne peut pas être négatif').optional(),
  allowMultipleCandidates: z.boolean().default(true),
  requirePhotoValidation: z.boolean().default(false),
  autoCloseTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)').optional(),
});

// Schéma pour les statistiques d'élection
export const ElectionStatsSchema = z.object({
  totalVoters: z.number().int().min(0),
  totalCandidates: z.number().int().min(0),
  totalCenters: z.number().int().min(0),
  totalBureaux: z.number().int().min(0),
  completedSteps: z.number().int().min(0),
  totalSteps: z.number().int().min(1),
  progressPercentage: z.number().min(0).max(100),
});

// Schéma pour la timeline d'élection
export const ElectionTimelineSchema = z.object({
  created: z.date(),
  configured: z.date().nullable(),
  started: z.date().nullable(),
  ended: z.date().nullable(),
  published: z.date().nullable(),
});

// Schéma principal pour une élection
export const ElectionSchema = z.object({
  id: z.string().uuid('ID invalide'),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  type: z.enum(['Législatives', 'Locales', 'Présidentielle'], {
    errorMap: () => ({ message: 'Type d\'élection invalide' })
  }),
  status: z.enum(['À venir', 'En cours', 'Terminée', 'Annulée'], {
    errorMap: () => ({ message: 'Statut d\'élection invalide' })
  }),
  date: z.date().min(new Date(), 'La date de l\'élection ne peut pas être dans le passé'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  location: GeographicLocationSchema,
  configuration: ElectionConfigSchema,
  statistics: ElectionStatsSchema,
  timeline: ElectionTimelineSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid('ID utilisateur invalide'),
});

// Schéma pour la création d'une élection
export const CreateElectionSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  type: z.enum(['Législatives', 'Locales', 'Présidentielle'], {
    errorMap: () => ({ message: 'Type d\'élection invalide' })
  }),
  date: z.string().datetime('Format de date invalide'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  location: z.object({
    province: z.string().min(1, 'La province est requise'),
    department: z.string().min(1, 'Le département est requis'),
    commune: z.string().min(1, 'La commune est requise'),
    arrondissement: z.string().min(1, 'L\'arrondissement est requis'),
  }),
  configuration: z.object({
    seatsAvailable: z.number().int().min(1, 'Le nombre de sièges doit être au moins 1'),
    budget: z.number().min(0, 'Le budget ne peut pas être négatif').optional(),
    voteGoal: z.number().int().min(0, 'L\'objectif de voix ne peut pas être négatif').optional(),
  }),
});

// Schéma pour la mise à jour d'une élection
export const UpdateElectionSchema = CreateElectionSchema.partial().extend({
  status: z.enum(['À venir', 'En cours', 'Terminée', 'Annulée']).optional(),
});

// Schéma pour un candidat
export const CandidateSchema = z.object({
  id: z.string().uuid('ID invalide'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  party: z.string().min(1, 'Le parti politique est requis').max(100, 'Le nom du parti ne peut pas dépasser 100 caractères'),
  photo: z.string().url('URL de photo invalide').optional(),
  isOurCandidate: z.boolean().default(false),
  votes: z.number().int().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
  biography: z.string().max(1000, 'La biographie ne peut pas dépasser 1000 caractères').optional(),
  contactInfo: z.object({
    email: z.string().email('Email invalide').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide').optional(),
    address: z.string().max(200, 'L\'adresse ne peut pas dépasser 200 caractères').optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schéma pour la création d'un candidat
export const CreateCandidateSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  party: z.string().min(1, 'Le parti politique est requis').max(100, 'Le nom du parti ne peut pas dépasser 100 caractères'),
  photo: z.string().url('URL de photo invalide').optional(),
  isOurCandidate: z.boolean().default(false),
  biography: z.string().max(1000, 'La biographie ne peut pas dépasser 1000 caractères').optional(),
  contactInfo: z.object({
    email: z.string().email('Email invalide').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide').optional(),
    address: z.string().max(200, 'L\'adresse ne peut pas dépasser 200 caractères').optional(),
  }).optional(),
});

// Schéma pour un centre de vote
export const VotingCenterSchema = z.object({
  id: z.string().uuid('ID invalide'),
  name: z.string().min(2, 'Le nom du centre doit contenir au moins 2 caractères').max(100, 'Le nom du centre ne peut pas dépasser 100 caractères'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères').max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
  contactInfo: z.object({
    responsible: z.string().min(2, 'Le nom du responsable doit contenir au moins 2 caractères').max(100, 'Le nom du responsable ne peut pas dépasser 100 caractères'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide'),
    email: z.string().email('Email invalide').optional(),
  }),
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    province: z.string().min(1, 'La province est requise'),
    department: z.string().min(1, 'Le département est requis'),
    commune: z.string().min(1, 'La commune est requise'),
    arrondissement: z.string().min(1, 'L\'arrondissement est requis'),
  }),
  totalVoters: z.number().int().min(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schéma pour la création d'un centre de vote
export const CreateVotingCenterSchema = z.object({
  name: z.string().min(2, 'Le nom du centre doit contenir au moins 2 caractères').max(100, 'Le nom du centre ne peut pas dépasser 100 caractères'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères').max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
  contactInfo: z.object({
    responsible: z.string().min(2, 'Le nom du responsable doit contenir au moins 2 caractères').max(100, 'Le nom du responsable ne peut pas dépasser 100 caractères'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide'),
    email: z.string().email('Email invalide').optional(),
  }),
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    province: z.string().min(1, 'La province est requise'),
    department: z.string().min(1, 'Le département est requis'),
    commune: z.string().min(1, 'La commune est requise'),
    arrondissement: z.string().min(1, 'L\'arrondissement est requis'),
  }),
  totalVoters: z.number().int().min(0).default(0),
});

// Schéma pour les filtres d'élection
export const ElectionFiltersSchema = z.object({
  status: z.array(z.enum(['À venir', 'En cours', 'Terminée', 'Annulée'])).optional(),
  type: z.array(z.enum(['Législatives', 'Locales', 'Présidentielle'])).optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  location: z.object({
    province: z.string().optional(),
    department: z.string().optional(),
    commune: z.string().optional(),
  }).optional(),
  search: z.string().optional(),
});

// Fonctions utilitaires de validation
export function validateElection(data: unknown) {
  return ElectionSchema.safeParse(data);
}

export function validateCreateElection(data: unknown) {
  return CreateElectionSchema.safeParse(data);
}

export function validateUpdateElection(data: unknown) {
  return UpdateElectionSchema.safeParse(data);
}

export function validateCandidate(data: unknown) {
  return CandidateSchema.safeParse(data);
}

export function validateCreateCandidate(data: unknown) {
  return CreateCandidateSchema.safeParse(data);
}

export function validateVotingCenter(data: unknown) {
  return VotingCenterSchema.safeParse(data);
}

export function validateCreateVotingCenter(data: unknown) {
  return CreateVotingCenterSchema.safeParse(data);
}

export function validateElectionFilters(data: unknown) {
  return ElectionFiltersSchema.safeParse(data);
}

// Fonction pour formater les erreurs de validation
export function formatValidationErrors(errors: z.ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(error.message);
  });
  
  return formattedErrors;
}
