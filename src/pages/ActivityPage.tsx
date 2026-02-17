import { useState } from "react";
import { mockActivities, mockAgents } from "@/data/mockData";
import { Search, Filter } from "lucide-react";

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");

  const filtered = mockActivities.filter((a) => {
    if (agentFilter !== "all" && a.agent_id !== agentFilter) return false;
    if (search && !a.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeColors: Record<string, string> = {
    task_completed: "bg-success",
    task_started: "bg-primary",
    job_completed: "bg-primary",
    error: "bg-destructive",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Activity</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2 flex-1 max-w-md">
          <Search size={14} className="text-muted-foreground" />
          <input type="text" placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground" />
        </div>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="text-sm border border-border rounded-md px-3 py-2 bg-card text-foreground"
        >
          <option value="all">All agents</option>
          {mockAgents.map((a) => (
            <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {filtered.map((act) => {
          const agent = mockAgents.find((a) => a.id === act.agent_id);
          return (
            <div key={act.id} className="flex items-start gap-3 px-4 py-3">
              <span className={`w-2 h-2 rounded-full mt-2 ${typeColors[act.type] || "bg-muted-foreground"}`} />
              <span className="text-lg">{agent?.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-card-foreground">{act.message}</div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{agent?.name}</span>
                  <span>{act.model}</span>
                  <span>{new Date(act.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                {act.cost > 0 && <div className="font-medium text-card-foreground">${act.cost.toFixed(2)}</div>}
                {act.tokens_in > 0 && <div>{((act.tokens_in + act.tokens_out) / 1000).toFixed(1)}K tokens</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
