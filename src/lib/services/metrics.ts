import { supabase } from '@/lib/supabase';

export async function fetchGlobalMetrics() {
  const [elections, centers, pvs, bureaux, candidates, candidatesParties] = await Promise.all([
    supabase.from('elections').select('nb_electeurs'),
    supabase.from('voting_centers').select('id', { count: 'exact' }),
    supabase.from('procès_verbaux').select('id', { count: 'exact' }),
    supabase.from('voting_bureaux').select('id', { count: 'exact' }),
    supabase.from('election_candidates').select('candidate_id', { count: 'exact' }),
    supabase.from('candidates').select('party')
  ]);

  if (elections.error) throw elections.error;
  if (centers.error) throw centers.error;
  if (pvs.error) throw pvs.error;
  if (bureaux.error) throw bureaux.error;
  if (candidates.error) throw candidates.error;

  // Calculer la somme des électeurs à partir de la colonne nb_electeurs des élections
  const totalVoters = elections.data?.reduce((sum, election) => 
    sum + (election.nb_electeurs || 0), 0) || 0;

  const parties = new Set<string>();
  (candidatesParties.data || []).forEach((c: any) => {
    if (c.party && String(c.party).trim().length > 0) parties.add(String(c.party).trim());
  });

  return {
    totalVoters: totalVoters,
    totalCenters: centers.count || 0,
    totalPVs: pvs.count || 0,
    totalBureaux: bureaux.count || 0,
    totalCandidats: candidates.count || 0,
    distinctParties: parties.size
  };
}


