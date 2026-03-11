import { useAgents, useTasks, useActivity } from "@/hooks/useData";
import { Bot, CheckSquare, DollarSign, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const AGENT_ACCENT: Record<string, string> = {
  "claude-kiosk-prod": "border-l-violet-500",
  "pablo-mac-mini": "border-l-amber-500",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-400 shadow-[0_0_5px_1px_rgba(52,211,153,0.6)]",
  idle: "bg-yellow-400",
  error: "bg-red-400",
};

export default function DashboardPage() {
  const { data: agents = [] } = useAgents();
  const { data: tasks = [] } = useTasks();
  const { data: activities = [] } = useActivity();

  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const activeAgents = agents.filter((a) => a.status === "active").length;
  const todayCost = activities.reduce((s, a) => s + Number(a.cost), 0);
  const totalTokens = activities.reduce((s, a) => s + a.tokens_in + a.tokens_out, 0);

  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Control Center</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon={<Bot size={20} />} label="Active Agents" value={activeAgents} color="primary" />
        <KpiCard icon={<CheckSquare size={20} />} label="Active Tasks" value={activeTasks} color="info" />
        <KpiCard icon={<DollarSign size={20} />} label="Total Cost" value={`$${todayCost.toFixed(2)}`} color="success" />
        <KpiCard icon={<Zap size={20} />} label="Total Tokens" value={formatTokens(totalTokens)} color="warning" />
      </div>

      {/* Agent cards — one per agent, side by side */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Agents</h2>
          <Link to="/agents" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {agents.map((agent) => {
            const agentActivities = activities.filter((a) => a.agent_id === agent.id);
            const cost = agentActivities.reduce((s, a) => s + Number(a.cost), 0);
            const tokens = agentActivities.reduce((s, a) => s + a.tokens_in + a.tokens_out, 0);
            const accent = AGENT_ACCENT[agent.id] ?? "border-l-primary";
            return (
              <div key={agent.id} className={`bg-card border border-border border-l-4 ${accent} rounded-lg p-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{agent.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-base text-card-foreground">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.role}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[agent.status] ?? "bg-muted-foreground"}`} />
                    <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted rounded px-2 py-1">
                    <span className="text-muted-foreground">Activities </span>
                    <span className="font-semibold text-foreground">{agentActivities.length}</span>
                  </div>
                  <div className="bg-muted rounded px-2 py-1">
                    <span className="text-muted-foreground">Cost </span>
                    <span className="font-semibold text-foreground">${cost.toFixed(2)}</span>
                  </div>
                  <div className="bg-muted rounded px-2 py-1 col-span-2">
                    <span className="text-muted-foreground">Tokens </span>
                    <span className="font-semibold text-foreground">{formatTokens(tokens)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <Link to="/activity" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {activities.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No activity yet. Run the reporter to push data from your agents.
            </div>
          )}
          {activities.slice(0, 5).map((act) => {
            const agent = agents.find((a) => a.id === act.agent_id);
            const accent = AGENT_ACCENT[act.agent_id ?? ""] ?? "";
            return (
              <div key={act.id} className={`flex items-center gap-3 px-4 py-3 border-l-2 ${accent}`}>
                <span className="text-lg">{agent?.emoji ?? "🔲"}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-card-foreground">{act.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {agent?.name ?? act.agent_id} · {new Date(act.created_at).toLocaleString()}
                  </div>
                </div>
                {Number(act.cost) > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">${Number(act.cost).toFixed(4)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-accent text-primary",
    info: "bg-accent text-primary",
    success: "bg-accent text-accent-foreground",
    warning: "bg-accent text-accent-foreground",
  };
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.primary}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-card-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
