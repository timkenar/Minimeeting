import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Building2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface CalendarViewProps {
  meetings: Meeting[];
  onMeetingSelect?: (meeting: Meeting) => void;
  selectedMeeting?: Meeting | null;
  onCreateMeeting?: (date: Date) => void;
  onDaySelect?: (date: Date, meetings: Meeting[]) => void;
}

const CalendarView = ({ meetings, onMeetingSelect, selectedMeeting, onCreateMeeting, onDaySelect }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  const { calendarDays, todaysMeetings, upcomingMeetings } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get previous month's last days
    const prevMonth = new Date(year, month - 1, 0);
    const daysFromPrevMonth = startingDayOfWeek;
    
    // Build calendar grid
    const days = [];
    
    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }
    
    // Get today's and upcoming meetings
    const today = new Date();
    const todayStr = today.toDateString();
    
    const todaysMeetings = meetings.filter(meeting => {
      const meetingDate = meeting.assigned_datetime ? 
        new Date(meeting.assigned_datetime) : 
        new Date(meeting.created_at);
      return meetingDate.toDateString() === todayStr;
    });
    
    const upcomingMeetings = meetings
      .filter(meeting => {
        const meetingDate = meeting.assigned_datetime ? 
          new Date(meeting.assigned_datetime) : 
          new Date(meeting.created_at);
        return meetingDate > today;
      })
      .sort((a, b) => {
        const aDate = a.assigned_datetime ? 
          new Date(a.assigned_datetime) : 
          new Date(a.created_at);
        const bDate = b.assigned_datetime ? 
          new Date(b.assigned_datetime) : 
          new Date(b.created_at);
        return aDate.getTime() - bDate.getTime();
      })
      .slice(0, 5);
    
    return { calendarDays: days, todaysMeetings, upcomingMeetings };
  }, [currentDate, meetings]);
  
  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = meeting.assigned_datetime ? 
        new Date(meeting.assigned_datetime) : 
        new Date(meeting.created_at);
      return meetingDate.toDateString() === date.toDateString();
    });
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'next') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled': return 'bg-calendar-scheduled';
      case 'completed': return 'bg-calendar-completed';
      default: return 'bg-calendar-pending';
    }
  };

  const handleDayClick = (date: Date) => {
    const dayMeetings = getMeetingsForDate(date);
    setSelectedDay(date);
    setViewMode('day');
    onDaySelect?.(date, dayMeetings);
  };

  const goBackToMonth = () => {
    setViewMode('month');
    setSelectedDay(null);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 min-h-screen bg-gradient-subtle">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Mini Calendar */}
        <Card className="calendar-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-calendar-header">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="calendar-nav-button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="calendar-nav-button"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-calendar-muted p-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.slice(0, 35).map((day, index) => {
                const dayMeetings = getMeetingsForDate(day.date);
                return (
                  <button
                    key={index}
                    className={cn(
                      "p-2 text-sm rounded-lg transition-all duration-200 hover:bg-calendar-hover relative",
                      day.isCurrentMonth ? "text-calendar-day" : "text-calendar-muted",
                      isToday(day.date) && "calendar-today",
                      selectedDay && selectedDay.toDateString() === day.date.toDateString() && "ring-2 ring-blue-500 bg-blue-50"
                    )}
                    onClick={() => handleDayClick(day.date)}
                  >
                    {day.day}
                    {dayMeetings.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayMeetings.slice(0, 3).map((meeting, i) => (
                          <div
                            key={i}
                            className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(meeting.status))}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Events */}
        <Card className="calendar-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-calendar-header flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Today's Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {todaysMeetings.length === 0 ? (
              <p className="text-calendar-muted text-sm py-4">No meetings today</p>
            ) : (
              <div className="space-y-2">
                {todaysMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className={cn(
                      "p-3 rounded-lg calendar-event-card cursor-pointer",
                      selectedMeeting?.id === meeting.id && "ring-2 ring-primary"
                    )}
                    onClick={() => onMeetingSelect?.(meeting)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-2", getStatusColor(meeting.status))} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-calendar-day truncate">{meeting.name}</div>
                        <div className="text-xs text-calendar-muted truncate">{meeting.organization}</div>
                        {meeting.assigned_datetime && (
                          <div className="text-xs text-calendar-muted mt-1">
                            {new Date(meeting.assigned_datetime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Events */}
        <Card className="calendar-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-calendar-header flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {upcomingMeetings.length === 0 ? (
              <p className="text-calendar-muted text-sm py-4">No upcoming meetings</p>
            ) : (
              <div className="space-y-2">
                {upcomingMeetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className={cn(
                      "p-3 rounded-lg calendar-event-card cursor-pointer",
                      selectedMeeting?.id === meeting.id && "ring-2 ring-primary"
                    )}
                    onClick={() => onMeetingSelect?.(meeting)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-2", getStatusColor(meeting.status))} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-calendar-day truncate">{meeting.name}</div>
                        <div className="text-xs text-calendar-muted truncate">{meeting.organization}</div>
                        {meeting.assigned_datetime && (
                          <div className="text-xs text-calendar-muted mt-1">
                            {new Date(meeting.assigned_datetime).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Main Calendar */}
      <div className="lg:col-span-3">
        <Card className="calendar-card h-full">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-2xl font-bold text-calendar-header">
                  {viewMode === 'day' && selectedDay 
                    ? `${selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                    : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  }
                </CardTitle>
                {viewMode === 'day' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goBackToMonth}
                    className="calendar-today-button"
                  >
                    Back to Month
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="calendar-today-button"
                  >
                    Today
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => viewMode === 'day' && selectedDay ? 
                    handleDayClick(new Date(selectedDay.getTime() - 24 * 60 * 60 * 1000)) : 
                    navigateMonth('prev')
                  }
                  className="calendar-nav-button"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => viewMode === 'day' && selectedDay ? 
                    handleDayClick(new Date(selectedDay.getTime() + 24 * 60 * 60 * 1000)) : 
                    navigateMonth('next')
                  }
                  className="calendar-nav-button"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {viewMode === 'month' ? (
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-calendar-muted p-3">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dayMeetings = getMeetingsForDate(day.date);
                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[100px] p-2 rounded-xl border transition-all duration-200 hover:shadow-soft cursor-pointer hover:bg-calendar-hover",
                      day.isCurrentMonth 
                        ? "calendar-day-cell border-calendar-border" 
                        : "calendar-day-outside border-calendar-border-muted",
                      isToday(day.date) && "calendar-today-cell",
                      selectedDay && selectedDay.toDateString() === day.date.toDateString() && "ring-2 ring-blue-500 bg-blue-50"
                    )}
                    onClick={() => handleDayClick(day.date)}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      day.isCurrentMonth ? "text-calendar-day" : "text-calendar-muted",
                      isToday(day.date) && "text-calendar-today"
                    )}>
                      {day.day}
                    </div>
                    
                    <div className="space-y-1">
                      {dayMeetings.slice(0, 3).map(meeting => (
                        <div
                          key={meeting.id}
                          className={cn(
                            "text-xs p-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm",
                            "calendar-event-item",
                            selectedMeeting?.id === meeting.id && "ring-1 ring-primary"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMeetingSelect?.(meeting);
                          }}
                          style={{
                            backgroundColor: meeting.status === 'scheduled' ? 'hsl(var(--calendar-scheduled) / 0.2)' :
                                           meeting.status === 'completed' ? 'hsl(var(--calendar-completed) / 0.2)' :
                                           'hsl(var(--calendar-pending) / 0.2)',
                            borderLeft: `3px solid hsl(var(--calendar-${meeting.status || 'pending'}))`
                          }}
                        >
                          <div className="font-medium text-calendar-day truncate">{meeting.name}</div>
                          <div className="text-calendar-muted truncate">{meeting.organization}</div>
                          {meeting.assigned_datetime && (
                            <div className="text-calendar-muted">
                              {new Date(meeting.assigned_datetime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayMeetings.length > 3 && (
                        <div className="text-xs text-calendar-muted px-1.5">
                          +{dayMeetings.length - 3} more
                        </div>
                      )}
                      
                      {/* Add Meeting Button for available slots */}
                      {dayMeetings.length < 3 && day.isCurrentMonth && onCreateMeeting && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-6 text-xs p-1 hover:bg-green-100 flex items-center justify-center border border-dashed border-green-300 text-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateMeeting(day.date);
                          }}
                          title="Create new meeting"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
                </div>
              </>
            ) : (
              /* Day View */
              <div className="space-y-4">
                {selectedDay && (
                  <>
                    {/* Day's meetings */}
                    <div className="space-y-3">
                      {(() => {
                        const dayMeetings = getMeetingsForDate(selectedDay);
                        return dayMeetings.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-calendar-muted mx-auto mb-4" />
                            <p className="text-calendar-muted">No meetings scheduled for this day</p>
                            {onCreateMeeting && (
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCreateMeeting(selectedDay);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Meeting
                              </Button>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-calendar-header">
                                {dayMeetings.length} meeting{dayMeetings.length !== 1 ? 's' : ''} scheduled
                              </h3>
                              {onCreateMeeting && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCreateMeeting(selectedDay);
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Meeting
                                </Button>
                              )}
                            </div>
                            <div className="grid gap-3">
                              {dayMeetings.map(meeting => (
                                <div
                                  key={meeting.id}
                                  className={cn(
                                    "p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm",
                                    "calendar-event-card",
                                    selectedMeeting?.id === meeting.id && "ring-2 ring-primary"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMeetingSelect?.(meeting);
                                  }}
                                  style={{
                                    backgroundColor: meeting.status === 'scheduled' ? 'hsl(var(--calendar-scheduled) / 0.1)' :
                                                   meeting.status === 'completed' ? 'hsl(var(--calendar-completed) / 0.1)' :
                                                   'hsl(var(--calendar-pending) / 0.1)',
                                    borderLeft: `4px solid hsl(var(--calendar-${meeting.status || 'pending'}))`
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-calendar-day" />
                                        <span className="font-medium text-calendar-day">{meeting.name}</span>
                                        <Badge variant="outline" className={cn(
                                          "text-xs",
                                          meeting.status === 'scheduled' && "bg-green-50 text-green-700 border-green-200",
                                          meeting.status === 'completed' && "bg-blue-50 text-blue-700 border-blue-200",
                                          !meeting.status && "bg-orange-50 text-orange-700 border-orange-200"
                                        )}>
                                          {meeting.status || 'pending'}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 mb-1">
                                        <Building2 className="w-4 h-4 text-calendar-muted" />
                                        <span className="text-calendar-muted">{meeting.organization}</span>
                                      </div>
                                      
                                      {meeting.assigned_datetime && (
                                        <div className="flex items-center gap-2 mb-2">
                                          <Clock className="w-4 h-4 text-calendar-muted" />
                                          <span className="text-calendar-muted">
                                            {new Date(meeting.assigned_datetime).toLocaleTimeString('en-US', { 
                                              hour: 'numeric', 
                                              minute: '2-digit',
                                              hour12: true 
                                            })}
                                          </span>
                                        </div>
                                      )}
                                      
                                      <p className="text-sm text-calendar-day mt-2">{meeting.reason}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;