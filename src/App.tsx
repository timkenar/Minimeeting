import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminMeetings from "./pages/AdminMeetings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isLandingPage && !isAdminPage && (
        <Navigation 
          onLogout={handleLogout} 
          isAuthenticated={isAuthenticated} 
        />
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin onAuthChange={setIsAuthenticated} />} />
        <Route path="/admin/meetings" element={<AdminMeetings onAuthChange={setIsAuthenticated} />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
