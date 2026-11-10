import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const LivePage = lazy(() => import("./pages/LivePage"));
const PrayerPage = lazy(() => import("./pages/PrayerPage"));
const MembersPage = lazy(() => import("./pages/MembersPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const TeamMemberEditorPage = lazy(() => import("./pages/TeamMemberEditorPage"));
const FounderEditorPage = lazy(() => import("./pages/FounderEditorPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DonatePage = lazy(() => import("./pages/DonatePage"));
const BranchPortalPage = lazy(() => import("./pages/BranchPortalPage"));
const BranchesPage = lazy(() => import("./pages/BranchesPage"));
const StateBranchEditorPage = lazy(() => import("./pages/StateBranchEditorPage"));
const CityBranchPortalPage = lazy(() => import("./pages/CityBranchPortalPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));

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
          <Suspense fallback={<div className="min-h-screen" />}>
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
