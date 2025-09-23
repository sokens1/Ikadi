/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer, useCallback, useMemo, useState } from 'react';
import { Election, ElectionState, ElectionAction, ElectionFilters } from '@/types/elections';

// État initial
const initialState: ElectionState = {
  elections: [],
  selectedElection: null,
  loading: false,
  error: null,
  filters: {},
  searchQuery: '',
};

// Reducer pour la gestion d'état
function electionReducer(state: ElectionState, action: ElectionAction): ElectionState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'SET_ELECTIONS':
      return {
        ...state,
        elections: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_ELECTION':
      return {
        ...state,
        elections: [...state.elections, action.payload],
        loading: false,
        error: null,
      };

    case 'UPDATE_ELECTION':
      return {
        ...state,
        elections: state.elections.map(election =>
          election.id === action.payload.id ? action.payload : election
        ),
        selectedElection: state.selectedElection?.id === action.payload.id 
          ? action.payload 
          : state.selectedElection,
        loading: false,
        error: null,
      };

    case 'DELETE_ELECTION':
      return {
        ...state,
        elections: state.elections.filter(election => election.id !== action.payload),
        selectedElection: state.selectedElection?.id === action.payload 
          ? null 
          : state.selectedElection,
        loading: false,
        error: null,
      };

    case 'SET_SELECTED_ELECTION':
      return {
        ...state,
        selectedElection: action.payload,
      };

    default:
      return state;
  }
}

// Hook principal pour la gestion des élections
export function useElectionState() {
  const [state, dispatch] = useReducer(electionReducer, initialState);

  // Actions
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setElections = useCallback((elections: Election[]) => {
    dispatch({ type: 'SET_ELECTIONS', payload: elections });
  }, []);

  const addElection = useCallback((election: Election) => {
    dispatch({ type: 'ADD_ELECTION', payload: election });
  }, []);

  const updateElection = useCallback((election: Election) => {
    dispatch({ type: 'UPDATE_ELECTION', payload: election });
  }, []);

  const deleteElection = useCallback((electionId: string) => {
    dispatch({ type: 'DELETE_ELECTION', payload: electionId });
  }, []);

  const setSelectedElection = useCallback((election: Election | null) => {
    dispatch({ type: 'SET_SELECTED_ELECTION', payload: election });
  }, []);

  const setFilters = useCallback((filters: ElectionFilters) => {
    // Cette action est gérée localement
    return filters;
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    // Cette action est gérée localement
    return query;
  }, []);

  // Filtrage et recherche
  const filteredElections = useMemo(() => {
    let filtered = state.elections;

    // Filtrage par statut
    if (state.filters.status && state.filters.status.length > 0) {
      filtered = filtered.filter(election => 
        state.filters.status!.includes(election.status)
      );
    }

    // Filtrage par type
    if (state.filters.type && state.filters.type.length > 0) {
      filtered = filtered.filter(election => 
        state.filters.type!.includes(election.type)
      );
    }

    // Filtrage par localisation
    if (state.filters.location) {
      const { province, department, commune } = state.filters.location;
      filtered = filtered.filter(election => {
        if (province && election.location.province !== province) return false;
        if (department && election.location.department !== department) return false;
        if (commune && election.location.commune !== commune) return false;
        return true;
      });
    }

    // Filtrage par plage de dates
    if (state.filters.dateRange) {
      const { start, end } = state.filters.dateRange;
      filtered = filtered.filter(election => {
        const electionDate = new Date(election.date);
        return electionDate >= start && electionDate <= end;
      });
    }

    // Recherche textuelle
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(election =>
        election.title.toLowerCase().includes(query) ||
        election.description?.toLowerCase().includes(query) ||
        election.location.commune.toLowerCase().includes(query) ||
        election.location.department.toLowerCase().includes(query) ||
        election.location.province.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [state.elections, state.filters, state.searchQuery]);

  // Statistiques calculées
  const statistics = useMemo(() => {
    const total = state.elections.length;
    const byStatus = state.elections.reduce((acc, election) => {
      acc[election.status] = (acc[election.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = state.elections.reduce((acc, election) => {
      acc[election.type] = (acc[election.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus,
      byType,
      filtered: filteredElections.length,
    };
  }, [state.elections, filteredElections]);

  return {
    // État
    elections: state.elections,
    selectedElection: state.selectedElection,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    searchQuery: state.searchQuery,
    filteredElections,
    statistics,

    // Actions
    setLoading,
    setError,
    setElections,
    addElection,
    updateElection,
    deleteElection,
    setSelectedElection,
    setFilters,
    setSearchQuery,
  };
}

// Hook pour la gestion des filtres
export function useElectionFilters() {
  const [filters, setFilters] = useState<ElectionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const updateFilter = useCallback((key: keyof ElectionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || searchQuery.length > 0;
  }, [filters, searchQuery]);

  return {
    filters,
    searchQuery,
    updateFilter,
    setSearchQuery,
    clearFilters,
    hasActiveFilters,
  };
}

// Hook pour la validation des élections
export function useElectionValidation() {
  const validateElection = useCallback((election: Partial<Election>): string[] => {
    const errors: string[] = [];

    if (!election.title || election.title.trim().length < 3) {
      errors.push('Le titre doit contenir au moins 3 caractères');
    }

    if (!election.type) {
      errors.push('Le type d\'élection est requis');
    }

    if (!election.date) {
      errors.push('La date de l\'élection est requise');
    } else if (new Date(election.date) < new Date()) {
      errors.push('La date de l\'élection ne peut pas être dans le passé');
    }

    if (!election.location?.province) {
      errors.push('La province est requise');
    }

    if (!election.location?.commune) {
      errors.push('La commune est requise');
    }

    if (election.configuration?.seatsAvailable && election.configuration.seatsAvailable < 1) {
      errors.push('Le nombre de sièges doit être au moins 1');
    }

    if (election.configuration?.budget && election.configuration.budget < 0) {
      errors.push('Le budget ne peut pas être négatif');
    }

    if (election.configuration?.voteGoal && election.configuration.voteGoal < 0) {
      errors.push('L\'objectif de voix ne peut pas être négatif');
    }

    return errors;
  }, []);

  const isValidElection = useCallback((election: Partial<Election>): boolean => {
    return validateElection(election).length === 0;
  }, [validateElection]);

  return {
    validateElection,
    isValidElection,
  };
}
