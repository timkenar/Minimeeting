import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogIn, Moon, Sun, Home, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Navigation = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isLandingPage = location.pathname === "/";
  
  if (isLandingPage) {
    // Minimal navigation for landing page
    return (
      <nav className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-muted"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>
          
          {/* Hidden Admin Login */}
          <Link to="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-muted"
              title="Admin Login"
            >
              <LogIn className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>
    );
  }
  
  // Full navigation for admin pages
  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Appointment</span>
            <Badge variant="secondary" className="text-xs">v1.0</Badge>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Book Meeting
              </Button>
            </Link>
            
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2"
              disabled
            >
              <Users className="w-4 h-4" />
              Admin Dashboard
            </Button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center gap-2"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;