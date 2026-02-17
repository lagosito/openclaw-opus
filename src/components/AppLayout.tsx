import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home, Bot, Activity, CheckSquare, Zap, Puzzle, BarChart3,
  Settings, LogOut, ChevronLeft, ChevronRight, Search
} from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/agents", icon: Bot, label: "Agents" },
  { to: "/activity", icon: Activity, label: "Activity" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/skills", icon: Puzzle, label: "Skills" },
  { to: "/usage", icon: BarChart3, label: "Usage" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ${
          collapsed ? "w-16" : "w-52"
        }`}
      >
        {/* Gradient accent line on left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "var(--gradient-sidebar)" }} />

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
          <span className="text-xl">🦞</span>
          {!collapsed && <span className="font-bold text-foreground text-sm tracking-tight">OpenClaw</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 space-y-0.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border px-2 py-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">B</div>
            {!collapsed && <span className="text-sm font-medium text-foreground">Brian</span>}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-4 px-3 text-muted-foreground">
              <button className="flex items-center gap-1 text-xs hover:text-foreground transition-colors">
                <Settings size={14} /> Settings
              </button>
              <button className="flex items-center gap-1 text-xs hover:text-foreground transition-colors">
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
          <span className="text-sm text-muted-foreground">{dateStr}, {timeStr}</span>
          <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 w-80">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks, activity, jobs..."
              className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">TODAY</div>
              <div className="font-semibold text-foreground">$0.73</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">FEB</div>
              <div className="font-semibold text-foreground">$219.98</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
