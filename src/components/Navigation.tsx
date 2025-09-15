import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogIn, Moon, Sun, Home, Users, LogOut, Menu, X, PanelLeft } from "lucide-react";
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (isLandingPage && !isAuthenticated) {
    // Minimal navigation for landing page (unauthenticated)
    return (
      <nav className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
          <Link to="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
              title="Admin Login"
            >
              <LogIn className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </Link>
        </div>
      </nav>
    );
  }

  // Full navigation for admin pages or authenticated users
  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">MiniMeet</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    location.pathname === "/admin"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  } transition-colors duration-200`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/meetings"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    location.pathname === "/admin/meetings"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  } transition-colors duration-200`}
                >
                  <Users className="w-4 h-4" />
                  Meetings
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-10 h-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="w-10 h-10 p-0 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Mobile Menu Button - Hidden when in admin pages since we use bottom nav */}
          <div className="md:hidden flex items-center gap-2" style={{ display: location.pathname.startsWith('/admin') ? 'none' : 'flex' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-10 h-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="w-10 h-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Hidden when in admin pages since we use bottom nav */}
        {mobileMenuOpen && !location.pathname.startsWith('/admin') && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              {isAuthenticated && (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      location.pathname === "/admin"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    } transition-colors duration-200`}
                    onClick={toggleMobileMenu}
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/meetings"
                    className={`flex items-center gap-2 text-sm font-medium ${
                      location.pathname === "/admin/meetings"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    } transition-colors duration-200`}
                    onClick={toggleMobileMenu}
                  >
                    <Users className="w-4 h-4" />
                    Meetings
                  </Link>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onLogout?.();
                    toggleMobileMenu();
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 dark:hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;