import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthPromptProvider } from "./context/AuthPromptContext";
import { AuthPromptDialog } from "./components/AuthPromptDialog";
import Index from "./pages/Index";
import Submit from "./pages/Submit";
import Editorial from "./pages/Editorial";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Guidelines from "./pages/Guidelines";
import AllCreatives from "./pages/AllCreatives";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PWAManager from "./components/PWAManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <AuthPromptProvider>
          <PWAManager />
          <Toaster />
          <Sonner
            position="bottom-right"
            toastOptions={{
              className: 'rounded-2xl shadow-card border-0',
            }}
          />
          <BrowserRouter>
            <AuthPromptDialog />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/all-creatives" element={<AllCreatives />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/community" element={<Community />} />
              <Route
                path="/editorial"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'EDITORIAL']}>
                    <Editorial />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthPromptProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
