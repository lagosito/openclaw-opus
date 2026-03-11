
-- First, clean up any existing data that would conflict
TRUNCATE public.activity, public.task_runs, public.job_runs, public.tasks, public.jobs CASCADE;

-- Remove foreign key constraints
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_agent_id_fkey;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_agent_id_fkey;
ALTER TABLE public.activity DROP CONSTRAINT IF EXISTS activity_agent_id_fkey;
ALTER TABLE public.task_runs DROP CONSTRAINT IF EXISTS task_runs_agent_id_fkey;
ALTER TABLE public.job_runs DROP CONSTRAINT IF EXISTS job_runs_agent_id_fkey;

-- Remove the existing primary key constraint
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_pkey;

-- Change agents.id from UUID to TEXT with custom IDs
ALTER TABLE public.agents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.agents ALTER COLUMN id TYPE TEXT USING COALESCE(id::TEXT, gen_random_uuid()::TEXT);

-- Add new primary key
ALTER TABLE public.agents ADD PRIMARY KEY (id);

-- Change all agent_id columns to TEXT
ALTER TABLE public.tasks ALTER COLUMN agent_id TYPE TEXT USING agent_id::TEXT;
ALTER TABLE public.jobs ALTER COLUMN agent_id TYPE TEXT USING agent_id::TEXT;
ALTER TABLE public.activity ALTER COLUMN agent_id TYPE TEXT USING agent_id::TEXT;
ALTER TABLE public.task_runs ALTER COLUMN agent_id TYPE TEXT USING agent_id::TEXT;
ALTER TABLE public.job_runs ALTER COLUMN agent_id TYPE TEXT USING agent_id::TEXT;

-- Recreate foreign key constraints
ALTER TABLE public.tasks ADD CONSTRAINT tasks_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.activity ADD CONSTRAINT activity_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.task_runs ADD CONSTRAINT task_runs_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.job_runs ADD CONSTRAINT job_runs_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;

-- Insert the two agents
INSERT INTO public.agents (id, name, emoji, role, model, status)
VALUES 
  ('claude-kiosk-prod', 'CLAUDE', '🤖', 'Kiosk · Producción', 'claude-opus-4-5', 'active'),
  ('pablo-mac-mini', 'PABLO', '🦞', 'OpenClaw · Experimentos', 'claude-opus-4-5', 'idle')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  role = EXCLUDED.role,
  model = EXCLUDED.model,
  status = EXCLUDED.status,
  updated_at = NOW();
