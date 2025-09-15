import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Home,
  Users,
  Settings,
  Plus,
  LogOut,
  Bell,
  BellRing,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/NotificationBell";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface Meeting {
  id: number;
  name: string;
  organization: string;
  reason: string;
  email?: string;
  phone?: string;
  preferred_datetime?: string;
  created_at: string;
  comment?: string;
  signature?: string;
  status?: 'pending' | 'scheduled' | 'completed';
  assigned_datetime?: string;
}

interface AppSidebarProps {
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  onMeetingSelect: (meeting: Meeting) => void;
  onCreateMeeting: () => void;
  onLogout: () => void;
  onScheduleMeeting?: (meeting: Meeting) => void;
}

export function AppSidebar({ meetings, selectedMeeting, onMeetingSelect, onCreateMeeting, onLogout, onScheduleMeeting }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [lastSeenTimestamp, setLastSeenTimestamp] = React.useState(() => {
    return localStorage.getItem('lastSeenNotificationTime') || new Date().toISOString();
  });
  const [hasNewNotifications, setHasNewNotifications] = React.useState(false);

  // Calculate pending meetings
  const pendingMeetings = React.useMemo(() => {
    return meetings.filter(meeting => !meeting.assigned_datetime || meeting.status === 'pending');
  }, [meetings]);

  // Calculate new meetings since last seen
  const newMeetings = React.useMemo(() => {
    if (!lastSeenTimestamp) return [];
    return pendingMeetings.filter(meeting => 
      new Date(meeting.created_at) > new Date(lastSeenTimestamp)
    );
  }, [pendingMeetings, lastSeenTimestamp]);

  // Check for new pending meetings
  React.useEffect(() => {
    if (newMeetings.length > 0) {
      setHasNewNotifications(true);
      
      // Play notification sound (optional)
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+H2uWokBiN+x/DPdywF';
        audio.play().catch(() => {});
      } catch (e) {
        console.log('Notification sound failed');
      }
    } else {
      setHasNewNotifications(false);
    }
  }, [newMeetings.length]);

  const handleLogout = () => {
    onLogout();
    navigate('/admin');
  };

  const dismissNotifications = () => {
    const currentTime = new Date().toISOString();
    setHasNewNotifications(false);
    setLastSeenTimestamp(currentTime);
    localStorage.setItem('lastSeenNotificationTime', currentTime);
  };

  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-bold">MiniMeet</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>
          {onScheduleMeeting && (
            <NotificationBell
              meetings={meetings}
              onScheduleMeeting={onScheduleMeeting}
              onViewMeeting={onMeetingSelect}
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Notifications Section */}
        {hasNewNotifications && newMeetings.length > 0 && (
          <SidebarGroup className="border-b border-orange-200 bg-orange-50/50">
            <SidebarGroupContent>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-orange-800">
                    <BellRing className="w-4 h-4 animate-bounce" />
                    <span className="text-sm font-semibold">
                      {newMeetings.length} New Request{newMeetings.length !== 1 ? 's' : ''}!
                    </span>
                  </div>
                  <button
                    onClick={dismissNotifications}
                    className="text-xs text-orange-600 hover:text-orange-800 underline"
                  >
                    dismiss
                  </button>
                </div>
                <div className="text-xs text-orange-700 mb-2">
                  {pendingMeetings.length} total appointment{pendingMeetings.length !== 1 ? 's' : ''} waiting to be scheduled
                </div>
                <div className="flex flex-wrap gap-1">
                  {newMeetings.slice(0, 3).map(meeting => (
                    <div 
                      key={meeting.id}
                      className="text-xs bg-orange-200 text-orange-900 px-2 py-1 rounded-full border border-orange-400 font-medium animate-pulse"
                      title={`New request from ${meeting.organization}`}
                    >
                      {meeting.name}
                    </div>
                  ))}
                  {newMeetings.length > 3 && (
                    <div className="text-xs text-orange-600 font-medium">
                      +{newMeetings.length - 3} more new
                    </div>
                  )}
                </div>
                <div className="text-xs text-orange-600 mt-2 opacity-75">
                  Click Dashboard or Meetings to view and schedule
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                  <Link to="/admin" onClick={dismissNotifications}>
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                    {hasNewNotifications && newMeetings.length > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 text-xs p-0 flex items-center justify-center bg-orange-500 hover:bg-orange-600 animate-pulse">
                        {newMeetings.length}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/admin/meetings"}>
                  <Link to="/admin/meetings" onClick={dismissNotifications}>
                    <Users className="w-4 h-4" />
                    <span>Meetings</span>
                    {hasNewNotifications && newMeetings.length > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 text-xs p-0 flex items-center justify-center bg-orange-500 hover:bg-orange-600 animate-pulse">
                        {newMeetings.length}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onCreateMeeting}>
                  <Plus className="w-4 h-4" />
                  <span>New Meeting</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/admin/settings"}>
                  <Link to="/admin/settings">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}