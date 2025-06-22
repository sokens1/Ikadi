
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PublicHomePage from "./pages/PublicHomePage";
import Dashboard from "./pages/Dashboard";
import ElectionManagement from "./pages/ElectionManagement";
import VotingCenters from "./pages/VotingCenters";
import UserManagement from "./pages/UserManagement";
import ResultsCentralization from "./pages/ResultsCentralization";
import Conversations from "./pages/Conversations";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicHomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/elections" element={<ElectionManagement />} />
            <Route path="/centers" element={<VotingCenters />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/results" element={<ResultsCentralization />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
