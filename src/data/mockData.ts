import { Agent, Task, Activity, Job, Skill, UsageData } from "./types";

export const mockAgents: Agent[] = [
  { id: "1", name: "Gumbo", emoji: "🍲", role: "General Assistant", model: "Claude Opus 4", status: "active", created_at: "2026-01-15" },
  { id: "2", name: "Claw", emoji: "🦞", role: "Code Reviewer", model: "Claude Opus 4", status: "active", created_at: "2026-01-20" },
  { id: "3", name: "Vale", emoji: "🌿", role: "Research", model: "Claude Sonnet 4", status: "active", created_at: "2026-02-01" },
  { id: "4", name: "Bernard", emoji: "🐻", role: "Writer", model: "Claude Haiku 3.5", status: "idle", created_at: "2026-02-05" },
];

export const mockTasks: Task[] = [
  { id: "1", title: "Weekly rollup", agent_id: "1", status: "scheduled", priority: "medium", due_at: "2026-02-13T16:00:00Z", created_at: "2026-02-10" },
  { id: "2", title: "Budget check", agent_id: "2", status: "scheduled", priority: "high", due_at: "2026-02-13T12:00:00Z", created_at: "2026-02-10" },
  { id: "3", title: "Open threads review", agent_id: "1", status: "scheduled", priority: "low", due_at: "2026-02-16T13:30:00Z", created_at: "2026-02-10" },
  { id: "4", title: "Monthly rollup", agent_id: "1", status: "scheduled", priority: "medium", due_at: "2026-03-01T10:00:00Z", created_at: "2026-02-10" },
  { id: "5", title: "Daily synthesis", agent_id: "1", status: "scheduled", priority: "high", due_at: "2026-02-13T19:00:00Z", created_at: "2026-02-10" },
  { id: "6", title: "Intake processing", agent_id: "1", status: "scheduled", priority: "medium", due_at: "2026-02-13T09:00:00Z", created_at: "2026-02-10" },
  { id: "7", title: "Intake processing", agent_id: "1", status: "done", priority: "medium", due_at: "2026-02-12T09:00:00Z", created_at: "2026-02-10" },
  { id: "8", title: "Daily synthesis", agent_id: "1", status: "done", priority: "high", due_at: "2026-02-12T19:00:00Z", created_at: "2026-02-10" },
  { id: "9", title: "Intake processing", agent_id: "1", status: "done", priority: "medium", due_at: "2026-02-12T14:00:00Z", created_at: "2026-02-10" },
  { id: "10", title: "Intake processing", agent_id: "1", status: "done", priority: "medium", due_at: "2026-02-12T19:00:00Z", created_at: "2026-02-10" },
];

export const mockActivities: Activity[] = [
  { id: "1", agent_id: "1", type: "task_completed", message: "Completed daily synthesis", tokens_in: 12400, tokens_out: 3200, cost: 0.45, model: "Claude Opus 4", created_at: "2026-02-12T19:00:00Z" },
  { id: "2", agent_id: "2", type: "task_completed", message: "Finished code review for auth module", tokens_in: 8900, tokens_out: 2100, cost: 0.32, model: "Claude Opus 4", created_at: "2026-02-12T18:30:00Z" },
  { id: "3", agent_id: "1", type: "task_completed", message: "Intake processing completed", tokens_in: 5600, tokens_out: 1800, cost: 0.22, model: "Claude Opus 4", created_at: "2026-02-12T14:00:00Z" },
  { id: "4", agent_id: "3", type: "task_started", message: "Started research on competitor analysis", tokens_in: 0, tokens_out: 0, cost: 0, model: "Claude Sonnet 4", created_at: "2026-02-12T13:00:00Z" },
  { id: "5", agent_id: "1", type: "task_completed", message: "Intake processing completed", tokens_in: 4200, tokens_out: 1200, cost: 0.15, model: "Claude Opus 4", created_at: "2026-02-12T09:00:00Z" },
  { id: "6", agent_id: "4", type: "job_completed", message: "Generated weekly newsletter draft", tokens_in: 15000, tokens_out: 8000, cost: 0.12, model: "Claude Haiku 3.5", created_at: "2026-02-11T22:00:00Z" },
  { id: "7", agent_id: "2", type: "error", message: "Rate limit exceeded during batch processing", tokens_in: 0, tokens_out: 0, cost: 0, model: "Claude Opus 4", created_at: "2026-02-11T15:00:00Z" },
  { id: "8", agent_id: "1", type: "task_completed", message: "Daily synthesis completed", tokens_in: 11000, tokens_out: 2800, cost: 0.40, model: "Claude Opus 4", created_at: "2026-02-11T19:00:00Z" },
];

export const mockJobs: Job[] = [
  { id: "1", name: "Daily Synthesis", agent_id: "1", schedule: "0 19 * * *", timezone: "America/New_York", enabled: true, last_run: "2026-02-12T19:00:00Z", next_run: "2026-02-13T19:00:00Z", created_at: "2026-01-20" },
  { id: "2", name: "Weekly Rollup", agent_id: "1", schedule: "0 16 * * 5", timezone: "America/New_York", enabled: true, last_run: "2026-02-07T16:00:00Z", next_run: "2026-02-14T16:00:00Z", created_at: "2026-01-20" },
  { id: "3", name: "Intake Processing", agent_id: "1", schedule: "0 9 * * 1-5", timezone: "America/New_York", enabled: true, last_run: "2026-02-12T09:00:00Z", next_run: "2026-02-13T09:00:00Z", created_at: "2026-01-25" },
  { id: "4", name: "Newsletter Draft", agent_id: "4", schedule: "0 22 * * 0", timezone: "America/New_York", enabled: true, last_run: "2026-02-09T22:00:00Z", next_run: "2026-02-16T22:00:00Z", created_at: "2026-02-01" },
  { id: "5", name: "Budget Check", agent_id: "2", schedule: "0 12 * * 5", timezone: "America/New_York", enabled: false, last_run: null, next_run: null, created_at: "2026-02-05" },
];

export const mockSkills: Skill[] = [
  { id: "1", name: "Web Search", description: "Search the web for information", icon: "🔍", enabled: true, config: { engine: "google", max_results: 10 } },
  { id: "2", name: "Slack Integration", description: "Send/read messages from Slack", icon: "💬", enabled: true, config: { workspace: "openclaw", channel: "#general" } },
  { id: "3", name: "GitHub", description: "Read/write code repositories", icon: "🐙", enabled: true, config: { org: "openclaw", repos: ["main", "docs"] } },
  { id: "4", name: "Email", description: "Send and read emails", icon: "📧", enabled: false, config: {} },
  { id: "5", name: "Calendar", description: "Read/create calendar events", icon: "📅", enabled: true, config: { provider: "google" } },
  { id: "6", name: "Weather", description: "Get weather information", icon: "🌤️", enabled: false, config: {} },
];

export const mockUsageData: UsageData = {
  totalCost: 9.41,
  totalTokens: 1900000,
  conversations: 28,
  activityCount: 121,
  costOverTime: [
    { date: "Sun 2/8", cost: 0.12, tokens: 45000, conversations: 2, activity: 5 },
    { date: "Mon 2/9", cost: 2.45, tokens: 520000, conversations: 8, activity: 32 },
    { date: "Tue 2/10", cost: 1.89, tokens: 410000, conversations: 6, activity: 25 },
    { date: "Wed 2/11", cost: 4.95, tokens: 925000, conversations: 12, activity: 59 },
  ],
  byAgent: [
    { name: "Claw", emoji: "🦞", cost: 8.49, percentage: 90.2, tokens: 1500000 },
    { name: "Gumbo", emoji: "🍲", cost: 0.45, percentage: 4.8, tokens: 154100 },
    { name: "Vale", emoji: "🌿", cost: 0.43, percentage: 4.5, tokens: 135200 },
    { name: "Bernard", emoji: "🐻", cost: 0.04, percentage: 0.5, tokens: 39900 },
  ],
  byModel: [
    { name: "Claude Opus 4", cost: 8.89, percentage: 94.5, tokens: 1600000, color: "hsl(38, 92%, 55%)" },
    { name: "Claude Sonnet 4", cost: 0.37, percentage: 4.0, tokens: 115500 },
    { name: "Claude Haiku 3.5", cost: 0.15, percentage: 1.6, tokens: 136600 },
    { name: "delivery-mirror", cost: 0, percentage: 0, tokens: 0 },
  ],
};
