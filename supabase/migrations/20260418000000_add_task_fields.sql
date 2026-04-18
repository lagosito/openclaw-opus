-- Add description, tags, project columns to tasks table
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS project TEXT;
