import { useJobs, useAgents } from "@/hooks/useData";
import { Plus, Clock, Calendar } from "lucide-react";

export default function JobsPage() {
  const { data: jobs = [] } = useJobs();
  const { data: agents = [] } = useAgents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
        <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Job
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {jobs.map((job) => {
          const agent = agents.find((a) => a.id === job.agent_id);
          return (
            <div key={job.id} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-2 h-2 rounded-full ${job.enabled ? "bg-success" : "bg-muted-foreground"}`} />
              <span className="text-lg">{agent?.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-card-foreground">{job.name}</div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{agent?.name}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {job.schedule}</span>
                  <span>{job.timezone}</span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {job.last_run && <div>Last: {new Date(job.last_run).toLocaleDateString()}</div>}
                {job.next_run && (
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar size={10} />
                    Next: {new Date(job.next_run).toLocaleDateString()}
                  </div>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${job.enabled ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {job.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
