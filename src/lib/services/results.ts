import { supabase } from '@/lib/supabase';

export interface SummaryRow {
  election_id: string;
  candidate_id: string;
  candidate_name: string;
  party_name?: string;
  party?: string;
  total_votes: number;
  percentage: number;
  rank: number;
}

export async function fetchElectionSummary(electionId: string): Promise<SummaryRow[]> {
  const { data, error } = await supabase
    .from('election_result_summary')
    .select('*')
    .eq('election_id', electionId)
    .order('rank', { ascending: true });
  if (error) throw error;
  return (data || []) as SummaryRow[];
}


