export interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  model: string;
  status: "active" | "idle" | "error";
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  agent_id: string;
  status: "scheduled" | "queue" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  due_at: string;
  created_at: string;
}

export interface Activity {
  id: string;
  agent_id: string;
  type: "task_completed" | "task_started" | "job_completed" | "error";
  message: string;
  tokens_in: number;
  tokens_out: number;
  cost: number;
  model: string;
  created_at: string;
}

export interface Job {
  id: string;
  name: string;
  agent_id: string;
  schedule: string;
  timezone: string;
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface UsageData {
  totalCost: number;
  totalTokens: number;
  conversations: number;
  activityCount: number;
  costOverTime: { date: string; cost: number; tokens: number; conversations: number; activity: number }[];
  byAgent: { name: string; emoji: string; cost: number; percentage: number; tokens: number }[];
  byModel: { name: string; cost: number; percentage: number; tokens: number; color?: string }[];
}

export type TaskStatus = Task["status"];
