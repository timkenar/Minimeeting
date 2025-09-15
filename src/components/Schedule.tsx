import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG, createAuthHeaders } from "@/config/api";

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

interface ScheduleProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accessToken: string;
  isReschedule?: boolean;
}

export function Schedule({ meeting, isOpen, onClose, onSuccess, accessToken, isReschedule = false }: ScheduleProps) {
  const [tempDateTime, setTempDateTime] = useState({ date: '', time: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form when meeting changes
  React.useEffect(() => {
    if (meeting) {
      if (meeting.assigned_datetime) {
        const date = new Date(meeting.assigned_datetime);
        setTempDateTime({
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().slice(0, 5)
        });
      } else if (meeting.preferred_datetime) {
        const date = new Date(meeting.preferred_datetime);
        setTempDateTime({
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().slice(0, 5)
        });
      } else {
        const now = new Date();
        setTempDateTime({
          date: now.toISOString().split('T')[0],
          time: '09:00'
        });
      }
    }
  }, [meeting]);

  const handleSchedule = async () => {
    if (!meeting || !tempDateTime.date || !tempDateTime.time) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const combinedDateTime = new Date(`${tempDateTime.date}T${tempDateTime.time}`);
      
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(meeting.id), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify({
          assigned_datetime: combinedDateTime.toISOString(),
          status: 'scheduled'
        }),
      });

      if (response.ok) {
        toast({
          title: isReschedule ? "Meeting rescheduled" : "Meeting scheduled",
          description: `Meeting with ${meeting.name} has been ${isReschedule ? 'rescheduled' : 'scheduled'} successfully.`
        });
        onSuccess();
        onClose();
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast({
          title: "Time slot occupied",
          description: `This time is already booked by ${errorData.conflicting_meeting?.name || 'another meeting'}`,
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to schedule meeting');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {isReschedule ? 'Reschedule Meeting' : 'Schedule Meeting'}
          </DialogTitle>
        </DialogHeader>
        
        {meeting && (
          <div className="space-y-4">
            {/* Meeting Info */}
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <p className="font-medium">{meeting.name}</p>
              <p className="text-sm text-muted-foreground">{meeting.organization}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{meeting.reason}</p>
            </div>

            {/* Show current scheduled time if rescheduling */}
            {isReschedule && meeting.assigned_datetime && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Currently scheduled:</span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  {formatDateTime(meeting.assigned_datetime)}
                </p>
              </div>
            )}

            {/* Show preferred time if available and not rescheduling */}
            {!isReschedule && meeting.preferred_datetime && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Preferred time:</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {formatDateTime(meeting.preferred_datetime)}
                </p>
              </div>
            )}

            {/* Date and Time Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={tempDateTime.date}
                    onChange={(e) => setTempDateTime(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={tempDateTime.time}
                    onChange={(e) => setTempDateTime(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Preview */}
              {tempDateTime.date && tempDateTime.time && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Meeting will be {isReschedule ? 'rescheduled' : 'scheduled'} for:
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {formatDateTime(`${tempDateTime.date}T${tempDateTime.time}`)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                className="flex-1"
                disabled={isLoading || !tempDateTime.date || !tempDateTime.time}
              >
                {isLoading 
                  ? (isReschedule ? "Rescheduling..." : "Scheduling...") 
                  : (isReschedule ? "Reschedule Meeting" : "Schedule Meeting")
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}