import { useAgents, useActivity } from "@/hooks/useData";
import { Activity, Bot, Clock, Cpu } from "lucide-react";

const AGENT_META: Record<string, { color: string; badge: string; description: string }> = {
  "claude-kiosk-prod": {
    color: "from-violet-500/20 to-violet-600/5 border-violet-500/30",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    description: "Claude.ai · Panel Kiosk en producción. Atiende usuarios reales.",
  },
  "pablo-mac-mini": {
    color: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    description: "OpenClaw corriendo en Mac Mini. Zona de experimentos y desarrollo.",
  },
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]",
  idle: "bg-yellow-400 shadow-[0_0_6px_2px_rgba(250,204,21,0.4)]",
  error: "bg-red-400 shadow-[0_0_6px_2px_rgba(248,113,113,0.5)]",
};

export default function AgentsPage() {
  const { data: agents = [] } = useAgents();
  const { data: activities = [] } = useActivity();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {agents.filter((a) => a.status === "active").length} active · {agents.length} total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {agents.map((agent) => {
          const meta = AGENT_META[agent.id] ?? { color: "", badge: "", description: agent.role };
          const agentActivities = activities.filter((a) => a.agent_id === agent.id);
          const totalCost = agentActivities.reduce((s, a) => s + Number(a.cost), 0);
          const totalTokens = agentActivities.reduce((s, a) => s + a.tokens_in + a.tokens_out, 0);
          const lastSeen = agentActivities[0]?.created_at;

          return (
            <div
              key={agent.id}
              className={`bg-gradient-to-br border rounded-xl p-5 space-y-4 ${meta.color}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{agent.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[agent.status] ?? "bg-muted-foreground"}`} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${meta.badge}`}>
                    {agent.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">{meta.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatBox icon={<Activity size={13} />} label="Activities" value={agentActivities.length} />
                <StatBox icon={<Cpu size={13} />} label="Tokens" value={fmtTokens(totalTokens)} />
                <StatBox icon={<Bot size={13} />} label="Cost" value={`$${totalCost.toFixed(2)}`} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Cpu size={11} /> {agent.model}
                </span>
                {lastSeen && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    Last seen {new Date(lastSeen).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Bot size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No agents yet</p>
          <p className="text-sm mt-1">Run <code className="bg-muted px-1 rounded">npx tsx scripts/seed-agents.ts</code> to add CLAUDE &amp; PABLO</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-black/20 rounded-lg px-3 py-2 space-y-1">
      <div className="flex items-center gap-1 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
