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
  total_bureaux: number;
  total_votes: number;
  participation: number;
  score?: number;
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
  center_id: string;
  center_name: string;
  bureau_number: number;
  registered?: number;
  voters?: number;
  total_votes: number;
  participation?: number;
  score?: number;
}

export async function fetchBureauSummary(electionId: string): Promise<BureauSummaryRow[]> {
  const { data, error } = await supabase
    .from('bureau_results_summary')
    .select('*')
    .eq('election_id', electionId);
  if (error) throw error;
  return (data || []) as BureauSummaryRow[];
}


