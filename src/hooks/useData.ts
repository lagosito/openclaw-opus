import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbAgent = Tables<"agents">;
export type DbTask = Tables<"tasks">;
export type DbActivity = Tables<"activity">;
export type DbJob = Tables<"jobs">;
export type DbSkill = Tables<"skills">;

// ── Agents ──
export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agents").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

// ── Tasks ──
export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<DbTask>) => {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

// ── Activity ──
export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });
}

// ── Jobs ──
export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

// ── Skills ──
export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled, config }: { id: string; enabled?: boolean; config?: Record<string, unknown> }) => {
      const updates: Record<string, unknown> = {};
      if (enabled !== undefined) updates.enabled = enabled;
      if (config !== undefined) updates.config = config;
      const { data, error } = await supabase.from("skills").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }),
  });
}

// ── Usage (aggregated from task_runs + job_runs) ──
export function useUsageData() {
  const { data: agents } = useAgents();
  return useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const [{ data: taskRuns }, { data: jobRuns }, { data: activityData }] = await Promise.all([
        supabase.from("task_runs").select("*"),
        supabase.from("job_runs").select("*"),
        supabase.from("activity").select("*"),
      ]);
      const allRuns = [...(taskRuns || []), ...(jobRuns || [])];
      const totalCost = allRuns.reduce((s, r) => s + Number(r.cost), 0);
      const totalTokens = allRuns.reduce((s, r) => s + r.tokens_in + r.tokens_out, 0);

      // By agent aggregation
      const byAgentMap = new Map<string, { cost: number; tokens: number }>();
      for (const r of allRuns) {
        if (!r.agent_id) continue;
        const prev = byAgentMap.get(r.agent_id) || { cost: 0, tokens: 0 };
        byAgentMap.set(r.agent_id, { cost: prev.cost + Number(r.cost), tokens: prev.tokens + r.tokens_in + r.tokens_out });
      }

      // Also aggregate from activity for display data
      const actCost = (activityData || []).reduce((s, a) => s + Number(a.cost), 0);
      const actTokens = (activityData || []).reduce((s, a) => s + a.tokens_in + a.tokens_out, 0);
      const displayCost = totalCost || actCost;
      const displayTokens = totalTokens || actTokens;

      return {
        totalCost: displayCost,
        totalTokens: displayTokens,
        conversations: (activityData || []).length,
        activityCount: (activityData || []).length,
        byAgent: [] as { name: string; emoji: string; cost: number; percentage: number; tokens: number }[],
        byModel: [] as { name: string; cost: number; percentage: number; tokens: number; color?: string }[],
        costOverTime: [] as { date: string; cost: number; tokens: number; conversations: number; activity: number }[],
      };
    },
  });
}
