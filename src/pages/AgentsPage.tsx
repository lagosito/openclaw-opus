import { mockAgents } from "@/data/mockData";
import { Plus } from "lucide-react";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Agents</h1>
        <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Agent
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mockAgents.map((agent) => (
          <div key={agent.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{agent.emoji}</span>
              <div>
                <h3 className="font-semibold text-card-foreground">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.role}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Model: {agent.model}</span>
              <span>Created: {new Date(agent.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
