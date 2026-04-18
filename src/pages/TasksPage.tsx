import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask } from "@/hooks/useData";
import { Plus, Search, LayoutGrid, List, ExternalLink, Calendar, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import TaskDialog from "@/components/TaskDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";

type TaskStatus = "scheduled" | "queue" | "in-progress" | "done";
type DbTask = Tables<"tasks">;

const columns: { id: TaskStatus; label: string; dotClass: string }[] = [
  { id: "scheduled", label: "Scheduled", dotClass: "bg-status-scheduled" },
  { id: "queue", label: "Queue", dotClass: "bg-status-queue" },
  { id: "in-progress", label: "In Progress", dotClass: "bg-status-in-progress" },
  { id: "done", label: "Done", dotClass: "bg-status-done" },
];

export default function TasksPage() {
  const { data: tasks = [] } = useTasks();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const [search, setSearch] = useState("");

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("queue");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DbTask | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const getColumnTasks = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;
    updateTask.mutate({ id: taskId, status: newStatus });
  };

  const handleCreateTask = (data: {
    title: string;
    description: string;
    status: string;
    priority: string;
    due_at: string | null;
    tags: string[];
    project: string;
  }) => {
    createTask.mutate({
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      due_at: data.due_at,
      tags: data.tags,
      project: data.project || undefined,
    });
  };

  const handleEditTask = (data: {
    title: string;
    description: string;
    status: string;
    priority: string;
    due_at: string | null;
    tags: string[];
    project: string;
  }) => {
    if (!editingTask) return;
    updateTask.mutate({
      id: editingTask.id,
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      due_at: data.due_at,
      tags: data.tags,
      project: data.project || null,
    });
  };

  const handleDeleteConfirm = () => {
    if (deletingTaskId) {
      deleteTask.mutate(deletingTaskId);
      setDeletingTaskId(null);
    }
  };

  const openEditDialog = (task: DbTask) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (taskId: string) => {
    setDeletingTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 border-b border-border pb-0">
        <button className="text-sm font-medium text-primary border-b-2 border-primary pb-2">Tasks</button>
        <button className="text-sm text-muted-foreground pb-2">Templates <span className="ml-1 text-xs bg-muted rounded px-1.5 py-0.5">6</span></button>
        <button className="text-sm text-muted-foreground pb-2">Recurring <span className="ml-1 text-xs bg-muted rounded px-1.5 py-0.5">6</span></button>
      </div>

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
          <button
            onClick={() => {
              setCreateDefaultStatus("queue");
              setCreateDialogOpen(true);
            }}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

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
      </div>

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
                        const dueDate = task.due_at ? new Date(task.due_at) : null;
                        const dateStr = dueDate?.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }) || "";
                        const timeStr = dueDate?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) || "";

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group bg-card border border-border rounded-md p-3 cursor-grab active:cursor-grabbing transition-shadow ${
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : "hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex items-center gap-1 flex-1 min-w-0">
                                    <span className="text-sm font-medium text-card-foreground truncate">{task.title}</span>
                                    <ExternalLink size={12} className="text-muted-foreground flex-shrink-0" />
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openEditDialog(task); }}
                                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openDeleteDialog(task.id); }}
                                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                                )}

                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {task.tags.map((tag) => (
                                      <span key={tag} className="text-xs bg-secondary/20 text-secondary-foreground px-1.5 py-0.5 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    {task.priority === "high" && (
                                      <span className="text-red-500 font-medium">● High</span>
                                    )}
                                    {task.project && (
                                      <span className="bg-muted px-1.5 py-0.5 rounded">{task.project}</span>
                                    )}
                                  </div>
                                  {dueDate && (
                                    <div className={`flex items-center gap-1 ${col.id === "done" ? "bg-secondary/20 text-secondary px-1.5 py-0.5 rounded" : ""}`}>
                                      <Calendar size={10} />
                                      <span>{dateStr} {timeStr}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>

                    <button
                      onClick={() => {
                        setCreateDefaultStatus(col.id);
                        setCreateDialogOpen(true);
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors w-full justify-center py-1"
                    >
                      <Plus size={12} /> Add task
                    </button>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create Task Dialog */}
      <TaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTask}
        defaultStatus={createDefaultStatus}
        mode="create"
      />

      {/* Edit Task Dialog */}
      <TaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditTask}
        initialValues={editingTask ? {
          title: editingTask.title,
          description: editingTask.description || "",
          status: editingTask.status,
          priority: editingTask.priority,
          due_at: editingTask.due_at,
          tags: editingTask.tags || [],
          project: editingTask.project || "",
        } : undefined}
        mode="edit"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
