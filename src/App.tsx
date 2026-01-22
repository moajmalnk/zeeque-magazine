import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Submit from "./pages/Submit";
import Editorial from "./pages/Editorial";
import Login from "./pages/Login";
import Guidelines from "./pages/Guidelines";
import AllCreatives from "./pages/AllCreatives";
import Teachers from "./pages/Teachers";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner
          position="bottom-right"
          toastOptions={{
            className: 'rounded-2xl shadow-card border-0',
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/all-creatives" element={<AllCreatives />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/editorial"
              element={
                <ProtectedRoute>
                  <Editorial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
