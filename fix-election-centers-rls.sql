-- Fix RLS policies for election_centers table
-- This script creates the necessary RLS policies to allow operations on election_centers

-- First, check if RLS is enabled on election_centers
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'election_centers';

-- Create policies for election_centers table
-- Policy 1: Allow authenticated users to insert election-center links
CREATE POLICY "Allow authenticated users to insert election_centers" 
ON election_centers 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy 2: Allow authenticated users to select election-center links
CREATE POLICY "Allow authenticated users to select election_centers" 
ON election_centers 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy 3: Allow authenticated users to update election-center links
CREATE POLICY "Allow authenticated users to update election_centers" 
ON election_centers 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete election-center links
CREATE POLICY "Allow authenticated users to delete election_centers" 
ON election_centers 
FOR DELETE 
TO authenticated 
USING (true);

-- Also create policies for election_candidates table (similar issue likely exists)
CREATE POLICY "Allow authenticated users to insert election_candidates" 
ON election_candidates 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select election_candidates" 
ON election_candidates 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to update election_candidates" 
ON election_candidates 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete election_candidates" 
ON election_candidates 
FOR DELETE 
TO authenticated 
USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('election_centers', 'election_candidates')
ORDER BY tablename, policyname;
