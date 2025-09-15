import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarPlus, Trash2, Eye, Bell, User, Building2, Mail, Phone, MessageSquare, PenTool, Calendar, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG, createAuthHeaders } from "@/config/api";
import { Schedule } from "@/components/Schedule";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface AdminNotificationsProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
  onCreateMeetingChange?: (callback: (() => void) | null) => void;
}

const AdminNotifications = ({ onAuthChange, onCreateMeetingChange }: AdminNotificationsProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [meetingToSchedule, setMeetingToSchedule] = useState<Meeting | null>(null);
  const [isReschedule, setIsReschedule] = useState(false);

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);

  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [editingSignature, setEditingSignature] = useState<string | null>(null);
  const [tempSignature, setTempSignature] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      onAuthChange?.(true);
    } else {
      onAuthChange?.(false);
    }
  }, [onAuthChange]);

  useEffect(() => {
    if (accessToken) {
      loadMeetings();
    }
  }, [accessToken]);

  const loadMeetings = async () => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_LIST, {
        headers: createAuthHeaders(accessToken),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      } else {
        toast({ title: "Error", description: "Failed to load meetings", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" });
    }
  };

  const pendingMeetings = meetings.filter(m => m.status === 'pending' || !m.assigned_datetime);

  const handleSchedule = (meeting: Meeting) => {
    setMeetingToSchedule(meeting);
    setIsReschedule(!!meeting.assigned_datetime);
    setShowScheduleDialog(true);
  };

  const handleScheduleSuccess = () => {
    loadMeetings();
    setShowScheduleDialog(false);
  };

  const handleDelete = async (meetingId: number) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_DELETE(meetingId), {
        method: 'DELETE',
        headers: createAuthHeaders(accessToken!),
      });

      if (response.ok) {
        loadMeetings();
        toast({ title: "Meeting deleted", description: "The meeting has been deleted." });
      } else {
        throw new Error('Failed to delete meeting');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete meeting", variant: "destructive" });
    }
  };

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDialog(true);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const saveNotes = async (id: number) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(id), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify({ comment: tempNotes }),
      });
      if (response.ok) {
        loadMeetings();
        setEditingNotes(null);
        toast({ title: "Notes saved" });
      } else throw new Error();
    } catch (e) {
      toast({ title: "Error saving notes", variant: "destructive" });
    }
  };

  const saveSignature = async (id: number) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.MEETINGS_UPDATE(id), {
        method: 'PUT',
        headers: createAuthHeaders(accessToken!),
        body: JSON.stringify({ signature: tempSignature }),
      });
      if (response.ok) {
        loadMeetings();
        setEditingSignature(null);
        toast({ title: "Signature saved" });
      } else throw new Error();
    } catch (e) {
      toast({ title: "Error saving signature", variant: "destructive" });
    }
  };

  const startNotesEdit = (meeting: Meeting) => {
    setEditingNotes(meeting.id.toString());
    setTempNotes(meeting.comment || "");
  };

  const startSignatureEdit = (meeting: Meeting) => {
    setEditingSignature(meeting.id.toString());
    setTempSignature(meeting.signature || "");
  };

  return (
    <SidebarProvider>
      <AppSidebar 
        meetings={meetings}
        selectedMeeting={selectedMeeting}
        onMeetingSelect={handleViewDetails}
        onCreateMeeting={() => { window.location.href = '/admin'; }}
        onLogout={() => { localStorage.removeItem('accessToken'); onAuthChange?.(false); }}
        onScheduleMeeting={handleSchedule}
      />
      <SidebarInset>
        <div className="flex-1 p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2"><Bell /> Notifications</h1>
            <p className="text-muted-foreground">Pending requests that require your attention.</p>
          </div>
          <div className="space-y-4">
            {pendingMeetings.length > 0 ? (
              pendingMeetings.map(notification => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{notification.name}</span>
                        <span className="text-sm text-muted-foreground">from {notification.organization}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.reason}</p>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Requested on {new Date(notification.created_at).toLocaleDateString()}</span>
                        {notification.preferred_datetime && (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">| Prefers:</span>
                            {new Date(notification.preferred_datetime).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleSchedule(notification)}>
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(notification)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(notification.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
                <p className="mt-2 text-sm text-muted-foreground">There are no new notifications.</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
      
      <Schedule
        meeting={meetingToSchedule}
        isOpen={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onSuccess={handleScheduleSuccess}
        accessToken={accessToken || ''}
        isReschedule={isReschedule}
      />

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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /><span>{selectedMeeting.name}</span></div>
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /><span>{selectedMeeting.organization}</span></div>
                  <div className="flex items-start gap-2"><MessageSquare className="w-4 h-4 text-primary mt-1" /><span>{selectedMeeting.reason}</span></div>
                  {selectedMeeting.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /><span>{selectedMeeting.email}</span></div>}
                  {selectedMeeting.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /><span>{selectedMeeting.phone}</span></div>}
                </div>
                <div className="space-y-2">
                  {selectedMeeting.preferred_datetime && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>Prefers: {formatDateTime(selectedMeeting.preferred_datetime)}</span></div>}
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /><span>Status:</span><Badge variant={selectedMeeting.status === 'scheduled' ? 'default' : 'secondary'}>{selectedMeeting.status || 'pending'}</Badge></div>
                  {selectedMeeting.assigned_datetime && <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-green-600" /><span>Scheduled: {formatDateTime(selectedMeeting.assigned_datetime)}</span></div>}
                </div>
              </div>
              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label className="text-base font-medium mb-2 block">Notes</Label>
                  {editingNotes === selectedMeeting.id.toString() ? (
                    <div className="space-y-2">
                      <Textarea value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} />
                      <Button onClick={() => saveNotes(selectedMeeting.id)} size="sm">Save</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingNotes(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground italic mb-2">{selectedMeeting.comment || "No notes added."}</p>
                      <Button variant="outline" size="sm" onClick={() => startNotesEdit(selectedMeeting)}>{selectedMeeting.comment ? "Edit" : "Add"} Notes</Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-base font-medium mb-2 flex items-center gap-2"><PenTool className="w-4 h-4" />Signature</Label>
                  {editingSignature === selectedMeeting.id.toString() ? (
                    <div className="space-y-2">
                      <Input value={tempSignature} onChange={(e) => setTempSignature(e.target.value)} />
                      <Button onClick={() => saveSignature(selectedMeeting.id)} size="sm">Save</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingSignature(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground italic mb-2">{selectedMeeting.signature || "No signature."}</p>
                      <Button variant="outline" size="sm" onClick={() => startSignatureEdit(selectedMeeting)}>{selectedMeeting.signature ? "Edit" : "Add"} Signature</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminNotifications;
