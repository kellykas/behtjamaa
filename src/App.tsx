import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LivePage from "./pages/LivePage";
import PrayerPage from "./pages/PrayerPage";
import MembersPage from "./pages/MembersPage";
import AdminPage from "./pages/AdminPage";
import TeamMemberEditorPage from "./pages/TeamMemberEditorPage";
import FounderEditorPage from "./pages/FounderEditorPage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DonatePage from "./pages/DonatePage";
import NotFound from "./pages/NotFound";
import BranchPortalPage from "./pages/BranchPortalPage";
import BranchesPage from "./pages/BranchesPage";
import StateBranchEditorPage from "./pages/StateBranchEditorPage";
import CityBranchPortalPage from "./pages/CityBranchPortalPage";
import EventDetailPage from "./pages/EventDetailPage";

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/prayer" element={<PrayerPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/branches/state/:id" element={<StateBranchEditorPage />} />
            <Route path="/branches/:slug" element={<BranchPortalPage />} />
            <Route path="/branches/:stateSlug/:childSlug" element={<CityBranchPortalPage />} />
            <Route path="/branches/:slug/events/:eventId" element={<EventDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/team/:id" element={<TeamMemberEditorPage />} />
            <Route path="/admin/founders" element={<AdminPage />} />
            <Route path="/admin/founders/:id" element={<FounderEditorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
