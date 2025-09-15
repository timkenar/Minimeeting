import { useState, useEffect } from "react";
import { MeetingsTable } from "@/components/MeetingsTable";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MessageSquare, 
  PenTool,
  Edit,
  Trash2,
  CalendarDays
} from "lucide-react";
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

interface AdminMeetingsProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
  onCreateMeetingChange?: (callback: (() => void) | null) => void;
}

const AdminMeetings = ({ onAuthChange, onCreateMeetingChange }: AdminMeetingsProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editingSignature, setEditingSignature] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [tempSignature, setTempSignature] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [editingDateTime, setEditingDateTime] = useState(false);
  const [tempDateTime, setTempDateTime] = useState({ date: '', time: '' });
  const [editingDetails, setEditingDetails] = useState(false);
  const [tempDetails, setTempDetails] = useState({ name: '', organization: '', reason: '', email: '', phone: '' });
  const { toast } = useToast();

  useEffect(() => {
    // Get token from localStorage and set authentication
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

  useEffect(() => {
    if (accessToken && onCreateMeetingChange) {
      const createMeetingHandler = () => {
        window.location.href = '/admin';
      };
      onCreateMeetingChange(createMeetingHandler);
      
      return () => {
        onCreateMeetingChange(null);
      };
    }
  }, [accessToken, onCreateMeetingChange]);

  // Reset editing states when dialog closes or meeting changes
  useEffect(() => {
    if (!showMeetingDialog || !selectedMeeting) {
      setEditingDetails(false);
      setEditingDateTime(false);
      setEditingNotes(null);
      setEditingSignature(null);
    }
  }, [showMeetingDialog, selectedMeeting?.id]);

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
        setShowMeetingDialog(false);
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

  return (
    <SidebarProvider>
      <AppSidebar 
        meetings={meetings}
        selectedMeeting={selectedMeeting}
        onMeetingSelect={(meeting) => {
          setSelectedMeeting(meeting);
          setShowMeetingDialog(true);
        }}
        onCreateMeeting={() => {
          // Navigate to dashboard for meeting creation
          window.location.href = '/admin';
        }}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <div className="flex-1 p-4 lg:p-6">
          <MeetingsTable 
            meetings={meetings}
            onMeetingSelect={(meeting) => {
              setSelectedMeeting(meeting);
              setShowMeetingDialog(true);
            }}
            onEditMeeting={(meeting) => {
              setSelectedMeeting(meeting);
              setShowMeetingDialog(true);
            }}
            onDeleteMeeting={deleteMeeting}
          />

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
                          <span className="font-medium">Scheduled:</span>
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

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="destructive" 
                        onClick={() => deleteMeeting(selectedMeeting.id)}
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

export default AdminMeetings;