import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import AgentsPage from "./pages/AgentsPage";
import ActivityPage from "./pages/ActivityPage";
import TasksPage from "./pages/TasksPage";
import UsagePage from "./pages/UsagePage";
import SkillsPage from "./pages/SkillsPage";
import JobsPage from "./pages/JobsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
