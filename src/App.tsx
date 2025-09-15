import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useCallback } from "react";
import Navigation from "./components/Navigation";
import { BottomNavigation } from "./components/BottomNavigation";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminMeetings from "./pages/AdminMeetings";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onCreateMeeting, setOnCreateMeeting] = useState<(() => void) | null>(null);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleCreateMeetingChange = useCallback((callback: (() => void) | null) => {
    setOnCreateMeeting(() => callback);
  }, []);

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isLandingPage && !isAdminPage && (
        <Navigation 
          onLogout={handleLogout} 
          isAuthenticated={isAuthenticated} 
        />
      )}
      <div className={isAuthenticated && isAdminPage ? "pb-20 md:pb-0" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route 
            path="/admin" 
            element={
              <Admin 
                onAuthChange={setIsAuthenticated} 
                onCreateMeetingChange={handleCreateMeetingChange}
              />
            } 
          />
          <Route 
            path="/admin/meetings" 
            element={
              <AdminMeetings 
                onAuthChange={setIsAuthenticated}
                onCreateMeetingChange={handleCreateMeetingChange}
              />
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <AdminSettings 
                onAuthChange={setIsAuthenticated}
                onCreateMeetingChange={handleCreateMeetingChange}
              />
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      <BottomNavigation 
        isAuthenticated={isAuthenticated && isAdminPage}
        onLogout={handleLogout}
        onCreateMeeting={onCreateMeeting || undefined}
      />
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
