import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { mockTasks, mockAgents } from "@/data/mockData";
import { Task, TaskStatus } from "@/data/types";
import { Plus, Search, LayoutGrid, List, ExternalLink, Calendar } from "lucide-react";

const columns: { id: TaskStatus; label: string; dotClass: string }[] = [
  { id: "scheduled", label: "Scheduled", dotClass: "bg-status-scheduled" },
  { id: "queue", label: "Queue", dotClass: "bg-status-queue" },
  { id: "in-progress", label: "In Progress", dotClass: "bg-status-in-progress" },
  { id: "done", label: "Done", dotClass: "bg-status-done" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [search, setSearch] = useState("");

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const getColumnTasks = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border pb-0">
        <button className="text-sm font-medium text-primary border-b-2 border-primary pb-2">Tasks</button>
        <button className="text-sm text-muted-foreground pb-2">Templates <span className="ml-1 text-xs bg-muted rounded px-1.5 py-0.5">6</span></button>
        <button className="text-sm text-muted-foreground pb-2">Recurring <span className="ml-1 text-xs bg-muted rounded px-1.5 py-0.5">6</span></button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">{activeTasks} active · {tasks.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
            <LayoutGrid size={16} />
          </button>
          <button className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
            <List size={16} />
          </button>
          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Search / Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2 flex-1 max-w-md">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <button className="text-sm text-muted-foreground border border-border rounded-md px-3 py-2">
          All agents ▾
        </button>
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = getColumnTasks(col.id);
            return (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-muted rounded-lg p-3 min-h-[300px] transition-colors ${
                      snapshot.isDraggingOver ? "ring-2 ring-primary/30 bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.dotClass}`} />
                        <span className="text-sm font-semibold text-foreground">{col.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{colTasks.length}</span>
                    </div>

                    <div className="space-y-2">
                      {colTasks.map((task, index) => {
                        const agent = mockAgents.find((a) => a.id === task.agent_id);
                        const dueDate = new Date(task.due_at);
                        const dateStr = dueDate.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
                        const timeStr = dueDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-card border border-border rounded-md p-3 cursor-grab active:cursor-grabbing transition-shadow ${
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : "hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-center gap-1 mb-2">
                                  <span className="text-sm font-medium text-card-foreground">{task.title}</span>
                                  <ExternalLink size={12} className="text-muted-foreground" />
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <span>{agent?.emoji}</span>
                                    <span>{agent?.name?.substring(0, 4)}{(agent?.name?.length || 0) > 4 ? "..." : ""}</span>
                                  </div>
                                  <div className={`flex items-center gap-1 ${col.id === "done" ? "bg-secondary/20 text-secondary px-1.5 py-0.5 rounded" : ""}`}>
                                    <Calendar size={10} />
                                    <span>{dateStr} {timeStr}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>

                    <button className="flex items-center gap-1 text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors w-full justify-center py-1">
                      <Plus size={12} /> Add task
                    </button>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
