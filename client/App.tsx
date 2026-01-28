import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Feed from "./pages/Feed";
import Contribute from "./pages/Contribute";
import Profile from "./pages/Profile";
import ContributionDetail from "./pages/ContributionDetail";
import Leaderboard from "./pages/Leaderboard";
import Domains from "./pages/Domains";
import MyContributions from "./pages/MyContributions";
import Settings from "./pages/Settings";
import HowItWorks from "./pages/HowItWorks";
import Examples from "./pages/Examples";
import NonTechnicalExamples from "./pages/NonTechnicalExamples";
import SubmitReview from "./pages/SubmitReview";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/profile/:handle" element={<Profile />} />
            <Route path="/contribution/:id" element={<ContributionDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/my-contributions" element={<MyContributions />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/examples" element={<Examples />} />
            <Route path="/non-technical" element={<NonTechnicalExamples />} />
            <Route path="/review" element={<SubmitReview />} />
            <Route path="/onboarding" element={<Onboarding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
