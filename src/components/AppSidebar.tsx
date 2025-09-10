import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  CalendarDays,
  Clock,
  Home,
  Users,
  Settings,
  MessageSquare,
  Plus,
  ChevronDown,
  ChevronRight,
  User,
  Building2,
  Mail,
  Phone,
  Bell,
  BarChart3,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
}

export function AppSidebar({ meetings, selectedMeeting, onMeetingSelect, onCreateMeeting, onLogout }: AppSidebarProps) {
  const location = useLocation();
  const [calendarExpanded, setCalendarExpanded] = React.useState(true);
  const [meetingsExpanded, setMeetingsExpanded] = React.useState(true);

  // Group meetings by status
  const pendingMeetings = meetings.filter(m => m.status === 'pending' || !m.status);
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled');
  const completedMeetings = meetings.filter(m => m.status === 'completed');

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const renderMeetingItem = (meeting: Meeting) => (
    <SidebarMenuItem key={meeting.id}>
      <SidebarMenuButton
        onClick={() => onMeetingSelect(meeting)}
        isActive={selectedMeeting?.id === meeting.id}
        className={cn(
          "w-full justify-start text-left hover:bg-sidebar-accent/50",
          selectedMeeting?.id === meeting.id && "bg-sidebar-accent"
        )}
        tooltip={`${meeting.name} - ${meeting.organization}`}
      >
        <div className="flex items-center gap-2 w-full min-w-0">
          <div className="flex-shrink-0">
            {meeting.status === 'scheduled' ? (
              <CalendarDays className="w-4 h-4 text-green-600" />
            ) : meeting.status === 'completed' ? (
              <Calendar className="w-4 h-4 text-blue-600" />
            ) : (
              <Clock className="w-4 h-4 text-orange-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate text-sm">{meeting.name}</div>
            <div className="text-xs text-muted-foreground truncate">{meeting.organization}</div>
            {meeting.assigned_datetime && (
              <div className="text-xs text-green-600 font-medium">
                {formatDateTime(meeting.assigned_datetime)}
              </div>
            )}
            {!meeting.assigned_datetime && meeting.preferred_datetime && (
              <div className="text-xs text-orange-600">
                Prefers: {formatDateTime(meeting.preferred_datetime)}
              </div>
            )}
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Calendar className="w-6 h-6 text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-bold">MiniMeet</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                  <Link to="/admin">
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/admin/meetings"}>
                  <Link to="/admin/meetings">
                    <Users className="w-4 h-4" />
                    <span>Meetings</span>
                    <Badge variant="secondary" className="ml-auto">
                      {meetings.length}
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onCreateMeeting}>
                  <Plus className="w-4 h-4" />
                  <span>New Meeting</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Calendar Views */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Collapsible open={calendarExpanded} onOpenChange={setCalendarExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span>Calendar Views</span>
                  {calendarExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Collapsible open={calendarExpanded} onOpenChange={setCalendarExpanded}>
              <CollapsibleContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Calendar className="w-4 h-4" />
                      <span>Month View</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <CalendarDays className="w-4 h-4" />
                      <span>Week View</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Clock className="w-4 h-4" />
                      <span>Day View</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <BarChart3 className="w-4 h-4" />
                      <span>Analytics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Meeting Requests */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>
            <Collapsible open={meetingsExpanded} onOpenChange={setMeetingsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="flex items-center gap-2">
                    Meeting Requests
                    <Badge variant="secondary" className="ml-auto">
                      {meetings.length}
                    </Badge>
                  </span>
                  {meetingsExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Collapsible open={meetingsExpanded} onOpenChange={setMeetingsExpanded}>
              <CollapsibleContent>
                <SidebarMenu>
                  {/* Pending Meetings */}
                  {pendingMeetings.length > 0 && (
                    <SidebarMenuItem>
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="group/collapsible">
                            <Bell className="w-4 h-4 text-orange-600" />
                            <span>Pending</span>
                            <Badge variant="secondary" className="ml-auto group-data-[state=open]/collapsible:hidden">
                              {pendingMeetings.length}
                            </Badge>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {pendingMeetings.map(meeting => (
                              <SidebarMenuSubItem key={meeting.id}>
                                <SidebarMenuSubButton 
                                  onClick={() => onMeetingSelect(meeting)}
                                  isActive={selectedMeeting?.id === meeting.id}
                                  className="cursor-pointer"
                                >
                                  <User className="w-3 h-3" />
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium text-xs">{meeting.name}</div>
                                    <div className="truncate text-xs text-muted-foreground">{meeting.organization}</div>
                                  </div>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  )}

                  {/* Scheduled Meetings */}
                  {scheduledMeetings.length > 0 && (
                    <SidebarMenuItem>
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="group/collapsible">
                            <CalendarDays className="w-4 h-4 text-green-600" />
                            <span>Scheduled</span>
                            <Badge variant="secondary" className="ml-auto group-data-[state=open]/collapsible:hidden">
                              {scheduledMeetings.length}
                            </Badge>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {scheduledMeetings.map(meeting => (
                              <SidebarMenuSubItem key={meeting.id}>
                                <SidebarMenuSubButton 
                                  onClick={() => onMeetingSelect(meeting)}
                                  isActive={selectedMeeting?.id === meeting.id}
                                  className="cursor-pointer"
                                >
                                  <Calendar className="w-3 h-3" />
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium text-xs">{meeting.name}</div>
                                    <div className="truncate text-xs text-muted-foreground">{meeting.organization}</div>
                                    {meeting.assigned_datetime && (
                                      <div className="truncate text-xs text-green-600">
                                        {formatDateTime(meeting.assigned_datetime)}
                                      </div>
                                    )}
                                  </div>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  )}

                  {/* Completed Meetings */}
                  {completedMeetings.length > 0 && (
                    <SidebarMenuItem>
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="group/collapsible">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>Completed</span>
                            <Badge variant="secondary" className="ml-auto group-data-[state=open]/collapsible:hidden">
                              {completedMeetings.length}
                            </Badge>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {completedMeetings.map(meeting => (
                              <SidebarMenuSubItem key={meeting.id}>
                                <SidebarMenuSubButton 
                                  onClick={() => onMeetingSelect(meeting)}
                                  isActive={selectedMeeting?.id === meeting.id}
                                  className="cursor-pointer"
                                >
                                  <Calendar className="w-3 h-3" />
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium text-xs">{meeting.name}</div>
                                    <div className="truncate text-xs text-muted-foreground">{meeting.organization}</div>
                                    {meeting.assigned_datetime && (
                                      <div className="truncate text-xs text-blue-600">
                                        {formatDateTime(meeting.assigned_datetime)}
                                      </div>
                                    )}
                                  </div>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  )}

                  {meetings.length === 0 && (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">No requests</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout}>
              <Home className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}