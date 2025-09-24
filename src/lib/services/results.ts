import { supabase } from '@/lib/supabase';

export interface SummaryRow {
  election_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_party?: string;
  party?: string;
  total_votes: number;
  percentage: number;
  rank: number;
}

export async function fetchElectionSummary(electionId: string): Promise<SummaryRow[]> {
  const { data, error } = await supabase
    .from('election_results_summary')
    .select('*')
    .eq('election_id', electionId);
  if (error) throw error;
  return (data || []) as SummaryRow[];
}

export interface CenterSummaryRow {
  election_id: string;
  center_id: string;
  center_name: string;
  total_registered: number;
  total_voters: number;
  total_null_votes: number;
  total_expressed_votes: number;
  participation_pct: number;
  score_pct: number;
}

export async function fetchCenterSummary(electionId: string): Promise<CenterSummaryRow[]> {
  const { data, error } = await supabase
    .from('center_results_summary')
    .select('*')
    .eq('election_id', electionId);
  if (error) throw error;
  return (data || []) as CenterSummaryRow[];
}

export interface BureauSummaryRow {
  election_id: string;
  bureau_id: string;
  bureau_name: string;
  center_id: string;
  total_registered: number;
  total_voters: number;
  total_null_votes: number;
  total_expressed_votes: number;
  participation_pct: number;
  score_pct: number;
}

export async function fetchBureauSummary(electionId: string): Promise<BureauSummaryRow[]> {
  const { data, error } = await supabase
    .from('bureau_results_summary')
    .select('*')
    .eq('election_id', electionId);
  if (error) throw error;
  return (data || []) as BureauSummaryRow[];
}


