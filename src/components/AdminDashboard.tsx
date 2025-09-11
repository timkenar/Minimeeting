import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, User, Building2, MessageSquare, PenTool, LogIn, CalendarDays, ChevronLeft, ChevronRight, Edit, Trash2, Mail, Phone, Plus, Menu, X, Users, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CalendarView from "./CalendarView";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { API_CONFIG, createAuthHeaders, createBasicHeaders } from "@/config/api";

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

interface AdminDashboardProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

const AdminDashboard = ({ onAuthChange }: AdminDashboardProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editingSignature, setEditingSignature] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [tempSignature, setTempSignature] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month' | 'calendar'>('calendar');
  const [createMeetingForm, setCreateMeetingForm] = useState({
    name: '',
    organization: '',
    reason: '',
    email: '',
    phone: '',
    date: '',
    start_time: '',
    end_time: ''
  });
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createMeetingDateTime, setCreateMeetingDateTime] = useState<{date: string, time: string} | null>(null);
  const [editingDateTime, setEditingDateTime] = useState(false);
  const [tempDateTime, setTempDateTime] = useState({ date: '', time: '' });
  const [editingDetails, setEditingDetails] = useState(false);
  const [tempDetails, setTempDetails] = useState({ name: '', organization: '', reason: '', email: '', phone: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [mobileView, setMobileView] = useState<'calendar' | 'requests'>('calendar');
  const { toast } = useToast();

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
      onAuthChange?.(true);
    }
  }, [onAuthChange]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadMeetings();
    }
  }, [isAuthenticated, accessToken]);

  const loadMeetings = async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_LIST, {
        headers: createAuthHeaders(accessToken!),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load meetings",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, {
        method: 'POST',
        headers: createBasicHeaders(),
        body: JSON.stringify({
          username,
          password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access);
        localStorage.setItem('accessToken', data.access);
        setIsAuthenticated(true);
        onAuthChange?.(true);
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard"
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    }
  };

  const saveNotes = async (id: number) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(id), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify({
          comment: tempNotes
        }),
      });

      if (response.ok) {
        await loadMeetings();
        setEditingNotes(null);
        setTempNotes("");
        toast({
          title: "Notes saved",
          description: "Meeting notes have been updated successfully."
        });
      } else {
        throw new Error('Failed to save notes');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      });
    }
  };

  const saveSignature = async (id: number) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(id), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify({
          signature: tempSignature
        }),
      });

      if (response.ok) {
        await loadMeetings();
        setEditingSignature(null);
        setTempSignature("");
        toast({
          title: "Signature saved",
          description: "Meeting signature has been recorded."
        });
      } else {
        throw new Error('Failed to save signature');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save signature",
        variant: "destructive"
      });
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const startNotesEdit = (meeting: Meeting) => {
    setEditingNotes(meeting.id.toString());
    setTempNotes(meeting.comment || "");
  };

  const startSignatureEdit = (meeting: Meeting) => {
    setEditingSignature(meeting.id.toString());
    setTempSignature(meeting.signature || "");
  };

  const startDateTimeEdit = (meeting: Meeting) => {
    if (meeting.assigned_datetime) {
      const date = new Date(meeting.assigned_datetime);
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
    setEditingDateTime(true);
  };

  const saveDateTimeEdit = async (meetingId: number) => {
    try {
      const combinedDateTime = new Date(`${tempDateTime.date}T${tempDateTime.time}`);
      
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(meetingId), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify({
          assigned_datetime: combinedDateTime.toISOString(),
          status: 'scheduled'
        }),
      });

      if (response.ok) {
        await loadMeetings();
        setEditingDateTime(false);
        toast({
          title: "Meeting rescheduled",
          description: "Meeting time has been updated successfully."
        });
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast({
          title: "Time slot occupied",
          description: `This time is already booked by ${errorData.conflicting_meeting.name}`,
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to reschedule meeting');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule meeting",
        variant: "destructive"
      });
    }
  };

  const startDetailsEdit = (meeting: Meeting) => {
    setTempDetails({
      name: meeting.name,
      organization: meeting.organization,
      reason: meeting.reason,
      email: meeting.email || '',
      phone: meeting.phone || ''
    });
    setEditingDetails(true);
  };

  const saveDetailsEdit = async (meetingId: number) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(meetingId), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify(tempDetails),
      });

      if (response.ok) {
        await loadMeetings();
        setEditingDetails(false);
        toast({
          title: "Details updated",
          description: "Meeting details have been updated successfully."
        });
      } else {
        throw new Error('Failed to update details');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update meeting details",
        variant: "destructive"
      });
    }
  };

  const assignMeetingTime = async (meetingId: number, dateTime: string) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(meetingId), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify({
          assigned_datetime: dateTime,
          status: 'scheduled'
        }),
      });

      if (response.ok) {
        await loadMeetings();
        setSelectedMeeting(null);
        toast({
          title: "Meeting scheduled",
          description: "Meeting time has been assigned successfully."
        });
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast({
          title: "Time slot occupied",
          description: `This time is already booked by ${errorData.conflicting_meeting.name} from ${errorData.conflicting_meeting.organization}`,
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to assign meeting time');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign meeting time",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(API_CONFIG.ENDPOINTS.ADMIN_LOGOUT, {
        method: 'POST',
        headers: createAuthHeaders(accessToken!),
      });
    } catch (error) {
      // Ignore logout errors
    }

    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setAccessToken(null);
    setMeetings([]);
    setSelectedMeeting(null);
    onAuthChange?.(false);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };

  const deleteMeeting = async (meetingId: number) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_DELETE(meetingId), {
        method: 'DELETE',
        headers: createAuthHeaders(accessToken!),
      });

      if (response.ok) {
        await loadMeetings();
        setSelectedMeeting(null);
        toast({
          title: "Meeting deleted",
          description: "Meeting has been deleted successfully."
        });
      } else {
        throw new Error('Failed to delete meeting');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive"
      });
    }
  };

  const rescheduleMeeting = async (meetingId: number, newDateTime: string) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(meetingId), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify({
          assigned_datetime: newDateTime,
          status: 'scheduled'
        }),
      });

      if (response.ok) {
        await loadMeetings();
        toast({
          title: "Meeting rescheduled",
          description: "Meeting time has been updated successfully."
        });
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast({
          title: "Time slot occupied",
          description: `This time is already booked by ${errorData.conflicting_meeting.name}`,
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to reschedule meeting');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule meeting",
        variant: "destructive"
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const days = calendarView === 'day' ? 1 : calendarView === 'week' ? 7 : 30;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? days : -days));
    setCurrentDate(newDate);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_CREATE, {
        method: 'POST',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify(createMeetingForm),
      });

      if (response.ok) {
        const data = await response.json();
        await loadMeetings();
        setCreateMeetingForm({
          name: '',
          organization: '',
          reason: '',
          email: '',
          phone: '',
          date: '',
          start_time: '',
          end_time: ''
        });
        setShowCreateDialog(false);
        setCreateMeetingDateTime(null);
        toast({
          title: "Meeting created",
          description: `Meeting with ${data.meeting_details.name} has been scheduled successfully.`
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to create meeting",
          description: Object.values(errorData).flat().join(', '),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    }
  };

  const openCreateMeetingDialog = (date: Date, hour?: number) => {
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = hour ? `${hour.toString().padStart(2, '0')}:00` : '09:00';
    
    setCreateMeetingForm({
      ...createMeetingForm,
      date: dateStr,
      start_time: timeStr,
      end_time: hour ? `${(hour + 1).toString().padStart(2, '0')}:00` : '10:00'
    });
    setCreateMeetingDateTime({ date: dateStr, time: timeStr });
    setShowCreateDialog(true);
  };

  const CalendarDayView = ({ date, meetings, onAssignMeeting, selectedMeeting }: {
    date: Date, meetings: Meeting[], onAssignMeeting: (id: number, dateTime: string) => void, selectedMeeting: Meeting | null
  }) => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    
    const getScheduledMeetingAtTime = (hour: number) => {
      return meetings.find(meeting => {
        if (!meeting.assigned_datetime) return false;
        const assignedDate = new Date(meeting.assigned_datetime);
        return assignedDate.toDateString() === date.toDateString() && 
               assignedDate.getHours() === hour;
      });
    };

    const isTimeSlotAvailable = (hour: number) => {
      return !getScheduledMeetingAtTime(hour);
    };
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Day View - {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            {hours.map(hour => {
              const scheduledMeeting = getScheduledMeetingAtTime(hour);
              const isAvailable = isTimeSlotAvailable(hour);
              
              return (
                <div key={hour} className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border ${
                  !isAvailable ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium">
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </div>
                  <div className="flex-1">
                    {scheduledMeeting ? (
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:bg-red-50 p-2 rounded"
                        onClick={() => {
                          setSelectedMeeting(scheduledMeeting);
                          setShowMeetingDialog(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-red-500">Occupied</Badge>
                          <div>
                            <div className="text-sm font-medium">{scheduledMeeting.name}</div>
                            <div className="text-xs text-muted-foreground">{scheduledMeeting.organization}</div>
                          </div>
                        </div>
                      </div>
                    ) : selectedMeeting ? (
                      <Button 
                        variant="default" 
                        size="sm"
                        className={selectedMeeting.status === 'scheduled' ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                        onClick={() => {
                          const dateTime = new Date(date);
                          dateTime.setHours(hour, 0, 0, 0);
                          if (selectedMeeting.status === 'scheduled') {
                            rescheduleMeeting(selectedMeeting.id, dateTime.toISOString());
                          } else {
                            onAssignMeeting(selectedMeeting.id, dateTime.toISOString());
                          }
                        }}
                      >
                        {selectedMeeting.status === 'scheduled' ? 'Reschedule' : 'Assign'} {selectedMeeting.name} to {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">Available</Badge>
                          <span className="text-xs sm:text-sm text-muted-foreground">Open slot</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-green-100"
                          onClick={() => openCreateMeetingDialog(date, hour)}
                          title="Create new meeting"
                        >
                          <Plus className="w-3 h-3 text-green-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CalendarWeekView = ({ date, meetings, onAssignMeeting, selectedMeeting }: {
    date: Date, meetings: Meeting[], onAssignMeeting: (id: number, dateTime: string) => void, selectedMeeting: Meeting | null
  }) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);

    const getScheduledMeetingAtTime = (day: Date, hour: number) => {
      return meetings.find(meeting => {
        if (!meeting.assigned_datetime) return false;
        const assignedDate = new Date(meeting.assigned_datetime);
        return assignedDate.toDateString() === day.toDateString() && 
               assignedDate.getHours() === hour;
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Week View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-1 text-xs sm:text-sm overflow-x-auto">
            <div className="p-2"></div>
            {days.map(day => (
              <div key={day.toISOString()} className="text-center font-medium p-2 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="font-bold">{day.getDate()}</div>
              </div>
            ))}
            {hours.map(hour => (
              <>
                <div key={hour} className="text-right pr-2 py-2 font-medium text-muted-foreground">
                  {hour > 12 ? hour - 12 : hour}:00
                  <br />
                  <span className="text-xs">{hour >= 12 ? 'PM' : 'AM'}</span>
                </div>
                {days.map(day => {
                  const scheduledMeeting = getScheduledMeetingAtTime(day, hour);
                  const isAvailable = !scheduledMeeting;
                  
                  return (
                    <div key={`${day.toISOString()}-${hour}`} className={`border rounded p-1 min-h-[40px] sm:min-h-[60px] ${
                      !isAvailable ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200 hover:bg-green-50'
                    }`}>
                      {scheduledMeeting ? (
                        <div 
                          className="p-1 group cursor-pointer hover:bg-red-200 rounded"
                          onClick={() => {
                            setSelectedMeeting(scheduledMeeting);
                            setShowMeetingDialog(true);
                          }}
                        >
                          <div className="text-xs font-medium text-red-700 truncate">{scheduledMeeting.name}</div>
                          <div className="text-xs text-red-600 truncate lg:block hidden">{scheduledMeeting.organization}</div>
                        </div>
                      ) : selectedMeeting ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`w-full h-full text-xs p-1 ${
                            selectedMeeting.status === 'scheduled' ? 'hover:bg-blue-200' : 'hover:bg-green-200'
                          }`}
                          onClick={() => {
                            const dateTime = new Date(day);
                            dateTime.setHours(hour, 0, 0, 0);
                            if (selectedMeeting.status === 'scheduled') {
                              rescheduleMeeting(selectedMeeting.id, dateTime.toISOString());
                            } else {
                              onAssignMeeting(selectedMeeting.id, dateTime.toISOString());
                            }
                          }}
                        >
                          {selectedMeeting.status === 'scheduled' ? 'Move' : 'Assign'}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-full text-xs p-1 hover:bg-green-100 flex items-center justify-center"
                          onClick={() => openCreateMeetingDialog(day, hour)}
                          title="Create new meeting"
                        >
                          <Plus className="w-3 h-3 text-green-600" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CalendarMonthView = ({ date, meetings, onAssignMeeting, selectedMeeting }: {
    date: Date, meetings: Meeting[], onAssignMeeting: (id: number, dateTime: string) => void, selectedMeeting: Meeting | null
  }) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
    
    const days = Array.from({ length: 42 }, (_, i) => {
      const day = new Date(startOfCalendar);
      day.setDate(startOfCalendar.getDate() + i);
      return day;
    });

    const getScheduledMeetingsForDay = (day: Date) => {
      return meetings.filter(meeting => {
        if (!meeting.assigned_datetime) return false;
        const assignedDate = new Date(meeting.assigned_datetime);
        return assignedDate.toDateString() === day.toDateString();
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Month View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="text-center font-medium p-1 sm:p-3 bg-primary/10 rounded-t">
                <span className="text-xs sm:text-sm">{day}</span>
              </div>
            ))}
            {days.map(day => {
              const dayMeetings = getScheduledMeetingsForDay(day);
              const isCurrentMonth = day.getMonth() === date.getMonth();
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`border rounded p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] ${
                    !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-white'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold mb-1 sm:mb-2">{day.getDate()}</div>
                  
                  <div className="space-y-1">
                    {dayMeetings.map(meeting => (
                      <div 
                        key={meeting.id} 
                        className="bg-blue-100 text-blue-800 text-xs p-1 rounded cursor-pointer hover:bg-blue-200"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowMeetingDialog(true);
                        }}
                      >
                        <div className="font-medium truncate text-xs">{meeting.name}</div>
                        <div className="text-xs hidden sm:block">{new Date(meeting.assigned_datetime!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                      </div>
                    ))}
                    
                    {selectedMeeting && isCurrentMonth && dayMeetings.length < 3 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`w-full text-xs ${
                          selectedMeeting.status === 'scheduled' 
                            ? 'bg-blue-50 hover:bg-blue-100 border-blue-300' 
                            : 'bg-green-50 hover:bg-green-100 border-green-300'
                        }`}
                        onClick={() => {
                          const dateTime = new Date(day);
                          dateTime.setHours(10, 0, 0, 0); // Default to 10 AM
                          if (selectedMeeting.status === 'scheduled') {
                            rescheduleMeeting(selectedMeeting.id, dateTime.toISOString());
                          } else {
                            onAssignMeeting(selectedMeeting.id, dateTime.toISOString());
                          }
                        }}
                      >
                        {selectedMeeting.status === 'scheduled' ? 'Move Here' : 'Assign'}
                      </Button>
                    )}

                    {dayMeetings.length < 3 && isCurrentMonth && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs p-1 hover:bg-green-100 flex items-center justify-center border border-dashed border-green-300"
                        onClick={() => openCreateMeetingDialog(day)}
                        title="Create new meeting"
                      >
                        <Plus className="w-3 h-3 text-green-600 mr-1" />
                        <span className="hidden sm:inline">Add Meeting</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <LogIn className="w-6 h-6" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        meetings={meetings}
        selectedMeeting={selectedMeeting}
        onMeetingSelect={(meeting) => {
          setSelectedMeeting(meeting);
          setShowMeetingDialog(true);
        }}
        onCreateMeeting={() => openCreateMeetingDialog(new Date())}
        onLogout={handleLogout}
      />
      <SidebarInset>
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6" onClick={() => setSelectedMeeting(null)}>
          <div className="mb-3 lg:mb-6">
            <h1 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1 lg:mb-2">Dashboard</h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground hidden sm:block">Assign meeting times and manage appointments</p>
          </div>

          <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as 'day' | 'week' | 'month' | 'calendar')}>
            {/* Mobile: Simplified header */}
            <div className="lg:hidden mb-3">
              <div className="flex items-center justify-between">
                <TabsList className="grid grid-cols-4 text-xs">
                  <TabsTrigger value="calendar">Cal</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')} className="w-8 h-8 p-0">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigateDate('next')} className="w-8 h-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h2 className="text-xs text-center mt-2 text-muted-foreground">
                {calendarView === 'month' 
                  ? currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : calendarView === 'week'
                  ? `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
              </h2>
            </div>
            
            {/* Desktop: Full header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <h2 className="text-lg font-medium min-w-[200px] text-center">
                  {calendarView === 'month' 
                    ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : calendarView === 'week'
                    ? `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  }
                </h2>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="calendar" className="mt-0">
              <CalendarView 
                meetings={meetings} 
                onMeetingSelect={(meeting) => {
                  setSelectedMeeting(meeting);
                  setShowMeetingDialog(true);
                }}
                selectedMeeting={selectedMeeting}
                onCreateMeeting={openCreateMeetingDialog}
                onDaySelect={(date, dayMeetings) => {
                  setSelectedMeeting(null); // Clear meeting selection when day is selected
                }}
              />
            </TabsContent>

            <TabsContent value="day" className="mt-0">
              {!selectedMeeting && (
                <div className="mb-2 lg:mb-4 p-2 lg:p-3 bg-blue-50 border border-blue-200 rounded-lg hidden lg:block">
                  <p className="text-xs sm:text-sm text-blue-700 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    Select a meeting request to assign a time slot
                  </p>
                </div>
              )}
              <CalendarDayView date={currentDate} meetings={meetings} onAssignMeeting={assignMeetingTime} selectedMeeting={selectedMeeting} />
            </TabsContent>
            
            <TabsContent value="week" className="mt-0">
              {!selectedMeeting && (
                <div className="mb-2 lg:mb-4 p-2 lg:p-3 bg-blue-50 border border-blue-200 rounded-lg hidden lg:block">
                  <p className="text-xs sm:text-sm text-blue-700 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    Select a meeting request to assign a time slot
                  </p>
                </div>
              )}
              <CalendarWeekView date={currentDate} meetings={meetings} onAssignMeeting={assignMeetingTime} selectedMeeting={selectedMeeting} />
            </TabsContent>
            
            <TabsContent value="month" className="mt-0">
              {!selectedMeeting && (
                <div className="mb-2 lg:mb-4 p-2 lg:p-3 bg-blue-50 border border-blue-200 rounded-lg hidden lg:block">
                  <p className="text-xs sm:text-sm text-blue-700 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    Select a meeting request to assign a time slot
                  </p>
                </div>
              )}
              <CalendarMonthView date={currentDate} meetings={meetings} onAssignMeeting={assignMeetingTime} selectedMeeting={selectedMeeting} />
            </TabsContent>

          </Tabs>

          {/* Create Meeting Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Meeting
                  {createMeetingDateTime && (
                    <span className="text-sm font-normal text-muted-foreground">
                      for {createMeetingDateTime.date} at {createMeetingDateTime.time}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name*</Label>
                    <Input
                      id="name"
                      value={createMeetingForm.name}
                      onChange={(e) => setCreateMeetingForm({...createMeetingForm, name: e.target.value})}
                      placeholder="Enter attendee name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization*</Label>
                    <Input
                      id="organization"
                      value={createMeetingForm.organization}
                      onChange={(e) => setCreateMeetingForm({...createMeetingForm, organization: e.target.value})}
                      placeholder="Enter organization"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason*</Label>
                  <Textarea
                    id="reason"
                    value={createMeetingForm.reason}
                    onChange={(e) => setCreateMeetingForm({...createMeetingForm, reason: e.target.value})}
                    placeholder="Enter meeting reason"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createMeetingForm.email}
                      onChange={(e) => setCreateMeetingForm({...createMeetingForm, email: e.target.value})}
                      placeholder="Enter email (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={createMeetingForm.phone}
                      onChange={(e) => setCreateMeetingForm({...createMeetingForm, phone: e.target.value})}
                      placeholder="Enter phone (optional)"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date*</Label>
                    <Input
                      id="date"
                      type="date"
                      value={createMeetingForm.date}
                      onChange={(e) => setCreateMeetingForm({...createMeetingForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time*</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={createMeetingForm.start_time}
                      onChange={(e) => setCreateMeetingForm({...createMeetingForm, start_time: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time*</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={createMeetingForm.end_time}
                      onChange={(e) => setCreateMeetingForm({...createMeetingForm, end_time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Meeting
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Meeting Details Dialog */}
          <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
            <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Meeting Details
                </DialogTitle>
              </DialogHeader>
              {selectedMeeting && (
                <div className="space-y-4">
                  {editingDetails ? (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={tempDetails.name}
                            onChange={(e) => setTempDetails({...tempDetails, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-organization">Organization</Label>
                          <Input
                            id="edit-organization"
                            value={tempDetails.organization}
                            onChange={(e) => setTempDetails({...tempDetails, organization: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-reason">Reason</Label>
                        <Textarea
                          id="edit-reason"
                          value={tempDetails.reason}
                          onChange={(e) => setTempDetails({...tempDetails, reason: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={tempDetails.email}
                            onChange={(e) => setTempDetails({...tempDetails, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">Phone</Label>
                          <Input
                            id="edit-phone"
                            value={tempDetails.phone}
                            onChange={(e) => setTempDetails({...tempDetails, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => saveDetailsEdit(selectedMeeting.id)} size="sm">
                          Save Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingDetails(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">Name:</span>
                          <span>{selectedMeeting.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-medium">Organization:</span>
                          <span>{selectedMeeting.organization}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-primary mt-1" />
                          <span className="font-medium">Reason:</span>
                          <span>{selectedMeeting.reason}</span>
                        </div>
                        {selectedMeeting.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <span className="font-medium">Email:</span>
                            <span>{selectedMeeting.email}</span>
                          </div>
                        )}
                        {selectedMeeting.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />
                            <span className="font-medium">Phone:</span>
                            <span>{selectedMeeting.phone}</span>
                          </div>
                        )}
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startDetailsEdit(selectedMeeting)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit Details
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {selectedMeeting.preferred_datetime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-medium">Preferred Time:</span>
                            <span>{formatDateTime(selectedMeeting.preferred_datetime)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">Status:</span>
                          <Badge variant={selectedMeeting.status === 'scheduled' ? 'default' : 'secondary'} 
                                 className={selectedMeeting.status === 'scheduled' ? 'bg-green-500' : 'bg-orange-500'}>
                            {selectedMeeting.status || 'pending'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Assigned Time:</span>
                          </div>
                          {editingDateTime ? (
                            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Date</Label>
                                  <Input
                                    type="date"
                                    value={tempDateTime.date}
                                    onChange={(e) => setTempDateTime({...tempDateTime, date: e.target.value})}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Time</Label>
                                  <Input
                                    type="time"
                                    value={tempDateTime.time}
                                    onChange={(e) => setTempDateTime({...tempDateTime, time: e.target.value})}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => saveDateTimeEdit(selectedMeeting.id)} size="sm">
                                  Save Time
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setEditingDateTime(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {selectedMeeting.assigned_datetime ? (
                                <>
                                  <span className="text-green-700 font-medium">{formatDateTime(selectedMeeting.assigned_datetime)}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => startDateTimeEdit(selectedMeeting)}
                                    className="ml-2"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span className="text-muted-foreground italic">Not scheduled</span>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => startDateTimeEdit(selectedMeeting)}
                                    className="ml-2"
                                  >
                                    Schedule
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <Label className="text-base font-medium mb-2 block">Post-Meeting Notes</Label>
                      {editingNotes === selectedMeeting.id.toString() ? (
                        <div className="space-y-2">
                          <Textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add your notes about this meeting..."
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => saveNotes(selectedMeeting.id)} size="sm">
                              Save Notes
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setEditingNotes(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {selectedMeeting.comment ? (
                            <div className="bg-muted p-3 rounded-md mb-2">
                              <p className="whitespace-pre-wrap">{selectedMeeting.comment}</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic mb-2">No notes added yet</p>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startNotesEdit(selectedMeeting)}
                          >
                            {selectedMeeting.comment ? "Edit Notes" : "Add Notes"}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-2 flex items-center gap-2">
                        <PenTool className="w-4 h-4" />
                        Signature
                      </Label>
                      {editingSignature === selectedMeeting.id.toString() ? (
                        <div className="space-y-2">
                          <Input
                            value={tempSignature}
                            onChange={(e) => setTempSignature(e.target.value)}
                            placeholder="Type your signature or approval (e.g., 'Approved by: John Smith')"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => saveSignature(selectedMeeting.id)} size="sm">
                              Save Signature
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setEditingSignature(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {selectedMeeting.signature ? (
                            <div className="bg-accent p-3 rounded-md mb-2 border-l-4 border-primary">
                              <p className="font-medium">{selectedMeeting.signature}</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic mb-2">No signature recorded</p>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startSignatureEdit(selectedMeeting)}
                          >
                            {selectedMeeting.signature ? "Update Signature" : "Add Signature"}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          deleteMeeting(selectedMeeting.id);
                          setShowMeetingDialog(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Meeting
                      </Button>
                    </div>
                  </div>
                </div>
                      
              )}
            </DialogContent>
          </Dialog>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDashboard;