import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, Building2, MessageSquare, PenTool } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Meeting {
  id: string;
  name: string;
  organization: string;
  reason: string;
  dateTime: string;
  createdAt: string;
  notes?: string;
  signature?: string;
}

const AdminDashboard = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editingSignature, setEditingSignature] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [tempSignature, setTempSignature] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadMeetings = () => {
      const storedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
      setMeetings(storedMeetings);
    };
    
    loadMeetings();
    // Set up interval to check for new meetings
    const interval = setInterval(loadMeetings, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    const updatedMeetings = meetings.map(meeting => 
      meeting.id === id ? { ...meeting, ...updates } : meeting
    );
    setMeetings(updatedMeetings);
    localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
  };

  const saveNotes = (id: string) => {
    updateMeeting(id, { notes: tempNotes });
    setEditingNotes(null);
    setTempNotes("");
    toast({
      title: "Notes saved",
      description: "Meeting notes have been updated successfully."
    });
  };

  const saveSignature = (id: string) => {
    updateMeeting(id, { signature: tempSignature });
    setEditingSignature(null);
    setTempSignature("");
    toast({
      title: "Signature saved",
      description: "Meeting signature has been recorded."
    });
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const startNotesEdit = (meeting: Meeting) => {
    setEditingNotes(meeting.id);
    setTempNotes(meeting.notes || "");
  };

  const startSignatureEdit = (meeting: Meeting) => {
    setEditingSignature(meeting.id);
    setTempSignature(meeting.signature || "");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meeting Dashboard</h1>
          <p className="text-muted-foreground">Manage your scheduled meetings and add notes</p>
        </div>

        <div className="grid gap-6">
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No meetings scheduled</h3>
                <p className="text-muted-foreground">New meetings will appear here automatically.</p>
              </CardContent>
            </Card>
          ) : (
            meetings.map((meeting) => (
              <Card key={meeting.id} className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl">Meeting with {meeting.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {formatDateTime(meeting.dateTime)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">Name:</span>
                        <span>{meeting.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-medium">Organization:</span>
                        <span>{meeting.organization}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-primary mt-1" />
                        <span className="font-medium">Reason:</span>
                        <span>{meeting.reason}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">Scheduled:</span>
                        <span>{formatDateTime(meeting.dateTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">Requested:</span>
                        <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <Label className="text-base font-medium mb-2 block">Post-Meeting Notes</Label>
                      {editingNotes === meeting.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add your notes about this meeting..."
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => saveNotes(meeting.id)} size="sm">
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
                          {meeting.notes ? (
                            <div className="bg-muted p-3 rounded-md mb-2">
                              <p className="whitespace-pre-wrap">{meeting.notes}</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic mb-2">No notes added yet</p>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startNotesEdit(meeting)}
                          >
                            {meeting.notes ? "Edit Notes" : "Add Notes"}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-2 flex items-center gap-2">
                        <PenTool className="w-4 h-4" />
                        Signature
                      </Label>
                      {editingSignature === meeting.id ? (
                        <div className="space-y-2">
                          <Input
                            value={tempSignature}
                            onChange={(e) => setTempSignature(e.target.value)}
                            placeholder="Type your signature or approval (e.g., 'Approved by: John Smith')"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => saveSignature(meeting.id)} size="sm">
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
                          {meeting.signature ? (
                            <div className="bg-accent p-3 rounded-md mb-2 border-l-4 border-primary">
                              <p className="font-medium">{meeting.signature}</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic mb-2">No signature recorded</p>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startSignatureEdit(meeting)}
                          >
                            {meeting.signature ? "Update Signature" : "Add Signature"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;