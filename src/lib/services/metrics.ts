import { supabase } from '@/lib/supabase';

export async function fetchGlobalMetrics() {
  const [voters, centers, pvs, bureaux, candidates, candidatesParties] = await Promise.all([
    supabase.from('voters').select('id', { count: 'exact' }),
    supabase.from('voting_centers').select('id', { count: 'exact' }),
    supabase.from('procès_verbaux').select('id', { count: 'exact' }),
    supabase.from('voting_bureaux').select('id', { count: 'exact' }),
    supabase.from('candidates').select('id', { count: 'exact' }),
    supabase.from('candidates').select('party')
  ]);

  if (voters.error) throw voters.error;
  if (centers.error) throw centers.error;
  if (pvs.error) throw pvs.error;
  if (bureaux.error) throw bureaux.error;
  if (candidates.error) throw candidates.error;

  const parties = new Set<string>();
  (candidatesParties.data || []).forEach((c: any) => {
    if (c.party && String(c.party).trim().length > 0) parties.add(String(c.party).trim());
  });

  return {
    totalVoters: voters.count || 0,
    totalCenters: centers.count || 0,
    totalPVs: pvs.count || 0,
    totalBureaux: bureaux.count || 0,
    totalCandidats: candidates.count || 0,
    distinctParties: parties.size
  };
}


