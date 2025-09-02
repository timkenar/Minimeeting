import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogIn, Moon, Sun, Home, Users, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

interface NavigationProps {
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

const Navigation = ({ onLogout, isAuthenticated }: NavigationProps) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isLandingPage = location.pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
  
  // Clean minimal navigation for admin pages
  return (
    <nav className="bg-background/95 backdrop-blur border-b border-border sticky top-0 z-50">
      <div className="px-4">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo/Brand - Minimal */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="text-base sm:text-lg font-bold text-foreground">MiniMeet</span>
          </div>

          {/* Right side controls - Clean */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-8 h-8 p-0"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            {/* Logout Button */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="w-8 h-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;