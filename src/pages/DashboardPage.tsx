import { useAgents, useTasks, useActivity } from "@/hooks/useData";
import { Bot, CheckSquare, DollarSign, Zap } from "lucide-react";
import { Link } from "react-router-dom";

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
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon={<Bot size={20} />} label="Active Agents" value={activeAgents} color="primary" />
        <KpiCard icon={<CheckSquare size={20} />} label="Active Tasks" value={activeTasks} color="info" />
        <KpiCard icon={<DollarSign size={20} />} label="Total Cost" value={`$${todayCost.toFixed(2)}`} color="success" />
        <KpiCard icon={<Zap size={20} />} label="Total Tokens" value={formatTokens(totalTokens)} color="warning" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Agents</h2>
          <Link to="/agents" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <div className="font-semibold text-sm text-card-foreground">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">{agent.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <Link to="/activity" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {activities.slice(0, 5).map((act) => {
            const agent = agents.find((a) => a.id === act.agent_id);
            return (
              <div key={act.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg">{agent?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-card-foreground">{act.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {agent?.name} · {new Date(act.created_at).toLocaleString()}
                  </div>
                </div>
                {Number(act.cost) > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">${Number(act.cost).toFixed(2)}</span>
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
