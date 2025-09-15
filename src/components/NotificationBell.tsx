import { useState } from "react";
import { Bell, Clock, User, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface NotificationBellProps {
  meetings: Meeting[];
  onScheduleMeeting: (meeting: Meeting) => void;
  onViewMeeting: (meeting: Meeting) => void;
}

export function NotificationBell({ meetings, onScheduleMeeting, onViewMeeting }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get pending meetings
  const pendingMeetings = meetings.filter(meeting => !meeting.status || meeting.status === 'pending');
  const pendingCount = pendingMeetings.length;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatPreferredTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {pendingCount > 9 ? '9+' : pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Pending Meetings</span>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingCount} pending
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {pendingCount === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending meetings</p>
            <p className="text-xs">All meetings are scheduled!</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            {pendingMeetings.slice(0, 10).map((meeting) => (
              <div key={meeting.id} className="border-b last:border-b-0">
                <div className="p-3 hover:bg-muted/50 space-y-2">
                  {/* Meeting Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{meeting.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{meeting.organization}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(meeting.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {meeting.reason}
                  </p>

                  {/* Preferred Time */}
                  {meeting.preferred_datetime && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Clock className="h-3 w-3" />
                      <span>Prefers: {formatPreferredTime(meeting.preferred_datetime)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleMeeting(meeting);
                        setIsOpen(false);
                      }}
                      className="h-7 px-2 text-xs flex-1"
                    >
                      <PenTool className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewMeeting(meeting);
                        setIsOpen(false);
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      <User className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {pendingCount > 10 && (
              <div className="p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  And {pendingCount - 10} more pending meetings...
                </p>
              </div>
            )}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}