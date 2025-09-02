import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Building2, MessageSquare, PenTool, LogIn, CalendarDays, ChevronLeft, ChevronRight, LogOut, Edit, Trash2, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CalendarView from "./CalendarView";

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

const AdminDashboard = () => {
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
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadMeetings();
    }
  }, [isAuthenticated]);

  const loadMeetings = async () => {
    try {
      const response = await fetch('http://localhost:8000/meetings/list/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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
      const response = await fetch('http://localhost:8000/meetings/admin/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access);
        setIsAuthenticated(true);
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
      const response = await fetch(`http://localhost:8000/meetings/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`http://localhost:8000/meetings/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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

  const assignMeetingTime = async (meetingId: number, dateTime: string) => {
    try {
      const response = await fetch(`http://localhost:8000/meetings/${meetingId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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
      await fetch('http://localhost:8000/meetings/admin/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Ignore logout errors
    }

    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setAccessToken(null);
    setMeetings([]);
    setSelectedMeeting(null);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };

  const deleteMeeting = async (meetingId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/meetings/${meetingId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
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
      const response = await fetch(`http://localhost:8000/meetings/${meetingId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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
                <div key={hour} className={`flex items-center gap-4 p-3 rounded-lg border ${
                  !isAvailable ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="w-20 text-sm font-medium">
                    {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </div>
                  <div className="flex-1">
                    {scheduledMeeting ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-red-500">Occupied</Badge>
                          <div>
                            <div className="text-sm font-medium">{scheduledMeeting.name}</div>
                            <div className="text-xs text-muted-foreground">{scheduledMeeting.organization}</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            onClick={() => setSelectedMeeting(scheduledMeeting)}
                            title="Edit meeting"
                          >
                            <Edit className="w-3 h-3 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100"
                            onClick={() => deleteMeeting(scheduledMeeting.id)}
                            title="Delete meeting"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Available</Badge>
                        <span className="text-sm text-muted-foreground">Open slot</span>
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
          <div className="grid grid-cols-8 gap-1 text-sm">
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
                    <div key={`${day.toISOString()}-${hour}`} className={`border rounded p-1 min-h-[60px] ${
                      !isAvailable ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200 hover:bg-green-50'
                    }`}>
                      {scheduledMeeting ? (
                        <div className="p-1 group">
                          <div className="text-xs font-medium text-red-700 truncate">{scheduledMeeting.name}</div>
                          <div className="text-xs text-red-600 truncate">{scheduledMeeting.organization}</div>
                          <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-blue-100"
                              onClick={() => setSelectedMeeting(scheduledMeeting)}
                              title="Edit"
                            >
                              <Edit className="w-2 h-2 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-red-100"
                              onClick={() => deleteMeeting(scheduledMeeting.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-2 h-2 text-red-600" />
                            </Button>
                          </div>
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
                      ) : null}
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
          <div className="grid grid-cols-7 gap-1">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center font-medium p-3 bg-primary/10 rounded-t">
                <span className="text-sm">{day}</span>
              </div>
            ))}
            {days.map(day => {
              const dayMeetings = getScheduledMeetingsForDay(day);
              const isCurrentMonth = day.getMonth() === date.getMonth();
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`border rounded p-2 min-h-[120px] ${
                    !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-white'
                  }`}
                >
                  <div className="text-sm font-bold mb-2">{day.getDate()}</div>
                  
                  <div className="space-y-1">
                    {dayMeetings.map(meeting => (
                      <div key={meeting.id} className="bg-blue-100 text-blue-800 text-xs p-1 rounded group relative">
                        <div className="font-medium truncate">{meeting.name}</div>
                        <div className="text-xs">{new Date(meeting.assigned_datetime!).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                        <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-4 w-4 p-0 bg-white hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMeeting(meeting);
                            }}
                            title="Edit"
                          >
                            <Edit className="w-2 h-2 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-4 w-4 p-0 bg-white hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMeeting(meeting.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="w-2 h-2 text-red-600" />
                          </Button>
                        </div>
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
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-muted/50 border-r p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Meeting Requests</h2>
            <p className="text-sm text-muted-foreground">Manage and assign meeting times</p>
          </div>
          
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No meeting requests</p>
                </CardContent>
              </Card>
            ) : (
              meetings.map((meeting) => (
                <Card 
                  key={meeting.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedMeeting?.id === meeting.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium truncate">{meeting.name}</h3>
                      <Badge variant={meeting.status === 'scheduled' ? 'default' : meeting.status === 'completed' ? 'outline' : 'secondary'} 
                             className={meeting.status === 'scheduled' ? 'bg-green-500' : meeting.status === 'completed' ? 'bg-blue-500' : 'bg-orange-500'}>
                        {meeting.status || 'pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 truncate">{meeting.organization}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Requested: {new Date(meeting.created_at).toLocaleDateString()}
                      </p>
                      {meeting.preferred_datetime && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Preferred: {formatDateTime(meeting.preferred_datetime)}
                        </p>
                      )}
                      {meeting.email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {meeting.email}
                        </p>
                      )}
                      {meeting.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {meeting.phone}
                        </p>
                      )}
                      {meeting.assigned_datetime && (
                        <p className="text-xs text-green-700 flex items-center gap-1 font-medium">
                          <CalendarDays className="w-3 h-3" />
                          Scheduled: {formatDateTime(meeting.assigned_datetime)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Assign meeting times and manage appointments</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as 'day' | 'week' | 'month' | 'calendar')}>
            <div className="flex items-center justify-between mb-6">
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
                onMeetingSelect={setSelectedMeeting}
                selectedMeeting={selectedMeeting}
              />
            </TabsContent>

            <TabsContent value="day" className="mt-0">
              {!selectedMeeting && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Select a meeting request from the sidebar to assign a time slot
                  </p>
                </div>
              )}
              <CalendarDayView date={currentDate} meetings={meetings} onAssignMeeting={assignMeetingTime} selectedMeeting={selectedMeeting} />
            </TabsContent>
            
            <TabsContent value="week" className="mt-0">
              {!selectedMeeting && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Select a meeting request from the sidebar to assign a time slot
                  </p>
                </div>
              )}
              <CalendarWeekView date={currentDate} meetings={meetings} onAssignMeeting={assignMeetingTime} selectedMeeting={selectedMeeting} />
            </TabsContent>
            
            <TabsContent value="month" className="mt-0">
              {!selectedMeeting && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Select a meeting request from the sidebar to assign a time slot
                  </p>
                </div>
              )}
              <CalendarMonthView date={currentDate} meetings={meetings} onAssignMeeting={assignMeetingTime} selectedMeeting={selectedMeeting} />
            </TabsContent>
          </Tabs>

          {/* Meeting Details Panel */}
          {selectedMeeting && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    {selectedMeeting.assigned_datetime && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Assigned Time:</span>
                        <span className="text-green-700 font-medium">{formatDateTime(selectedMeeting.assigned_datetime)}</span>
                      </div>
                    )}
                  </div>
                </div>

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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;