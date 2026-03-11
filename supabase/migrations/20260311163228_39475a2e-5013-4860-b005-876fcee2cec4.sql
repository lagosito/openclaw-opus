-- Disable RLS on activity and agents tables
-- This allows external scripts to write using the anon key

-- Disable RLS on activity table
ALTER TABLE public.activity DISABLE ROW LEVEL SECURITY;

-- Disable RLS on agents table
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;