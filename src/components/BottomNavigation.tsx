import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Plus, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface BottomNavigationProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onCreateMeeting?: () => void;
}

export function BottomNavigation({ 
  isAuthenticated, 
  onLogout, 
  onCreateMeeting 
}: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleCreateMeeting = useCallback(() => {
    if (onCreateMeeting) {
      onCreateMeeting();
    }
  }, [onCreateMeeting]);

  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout();
      navigate('/admin');
    }
  }, [onLogout, navigate]);

  // Early return after all hooks are called
  if (!isMobile || !isAuthenticated) {
    return null;
  }

  const navigationItems = [
    {
      path: "/admin",
      icon: Home,
      label: "Dashboard",
      action: null
    },
    {
      path: "/admin/meetings", 
      icon: Users,
      label: "Meetings",
      action: null
    },
    {
      path: null,
      icon: Plus,
      label: "New",
      action: handleCreateMeeting,
      isSpecial: true
    },
    {
      path: "/admin/settings",
      icon: Settings, 
      label: "Settings",
      action: null
    },
    {
      path: null,
      icon: LogOut,
      label: "Logout", 
      action: handleLogout,
      isLogout: true
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-2xl animate-in slide-in-from-bottom-2 duration-300 no-select">
      <div className="flex items-center justify-around px-3 py-3 max-w-md mx-auto">
        {navigationItems.map((item, index) => {
          const isActive = item.path && location.pathname === item.path;
          const Icon = item.icon;

          if (item.action) {
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={item.action}
                className={cn(
                  "mobile-button flex flex-col items-center justify-center h-14 w-14 rounded-2xl transition-colors duration-200",
                  item.isSpecial && "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
                  item.isLogout && "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
                  !item.isSpecial && !item.isLogout && "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mb-1",
                  item.isSpecial && "text-white"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  item.isSpecial && "text-white font-semibold"
                )}>
                  {item.label}
                </span>
              </Button>
            );
          }

          return (
            <Link key={index} to={item.path!}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "mobile-button flex flex-col items-center justify-center h-14 w-14 rounded-2xl transition-colors duration-200",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="bottom-nav-safe-area" />
    </div>
  );
}