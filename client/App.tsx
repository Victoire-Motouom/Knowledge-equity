import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { RequireAuth } from "@/auth/RequireAuth";
import { Suspense, lazy } from "react";
import InstallPrompt from "@/components/InstallPrompt";

const NotFound = lazy(() => import("./pages/NotFound"));
const Feed = lazy(() => import("./pages/Feed"));
const Contribute = lazy(() => import("./pages/Contribute"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const ContributionDetail = lazy(() => import("./pages/ContributionDetail"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Domains = lazy(() => import("./pages/Domains"));
const MyContributions = lazy(() => import("./pages/MyContributions"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Examples = lazy(() => import("./pages/Examples"));
const NonTechnicalExamples = lazy(() => import("./pages/NonTechnicalExamples"));
const SubmitReview = lazy(() => import("./pages/SubmitReview"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const SolveIssueDetail = lazy(() => import("./pages/SolveIssueDetail"));
const CreateIssue = lazy(() => import("./pages/CreateIssue"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPrompt />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense
              fallback={
                <div className="min-h-screen bg-background page-surface flex items-center justify-center text-sm text-muted-foreground">
                  Loading…
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/feed" replace />} />
                <Route path="/feed" element={<Feed />} />
                <Route
                  path="/contribute"
                  element={
                    <RequireAuth>
                      <Contribute />
                    </RequireAuth>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <Settings />
                    </RequireAuth>
                  }
                />
                <Route path="/profile/:handle" element={<Profile />} />
                <Route
                  path="/contribution/:id"
                  element={<ContributionDetail />}
                />
                <Route path="/solve/new" element={<CreateIssue />} />
                <Route path="/solve/:id" element={<SolveIssueDetail />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/domains" element={<Domains />} />
                <Route
                  path="/my-contributions"
                  element={
                    <RequireAuth>
                      <MyContributions />
                    </RequireAuth>
                  }
                />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/examples" element={<Examples />} />
                <Route
                  path="/non-technical"
                  element={<NonTechnicalExamples />}
                />
                <Route
                  path="/review"
                  element={
                    <RequireAuth>
                      <SubmitReview />
                    </RequireAuth>
                  }
                />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
