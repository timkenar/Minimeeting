import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Meeting {
  id: string;
  name: string;
  organization: string;
  reason: string;
  dateTime: string;
  createdAt: string;
}

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    reason: "",
    preferredDateTime: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create meeting object
    const meeting: Meeting = {
      id: Date.now().toString(),
      ...formData,
      dateTime: formData.preferredDateTime,
      createdAt: new Date().toISOString()
    };

    // Store in localStorage for now
    const existingMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    localStorage.setItem('meetings', JSON.stringify([...existingMeetings, meeting]));

    // Generate ICS file
    generateICSFile(meeting);
    
    // Generate Google Calendar link
    const googleCalendarLink = generateGoogleCalendarLink(meeting);
    
    toast({
      title: "Meeting Scheduled!",
      description: (
        <div className="space-y-2">
          <p>Your meeting has been scheduled successfully.</p>
          <div className="flex gap-2">
            <a 
              href={googleCalendarLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Add to Google Calendar
            </a>
          </div>
        </div>
      ),
    });

    // Reset form
    setFormData({
      name: "",
      organization: "",
      reason: "",
      preferredDateTime: ""
    });
  };

  const generateICSFile = (meeting: Meeting) => {
    const startDate = new Date(meeting.dateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MiniMeet//EN
BEGIN:VEVENT
UID:${meeting.id}@minimeet.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Meeting with ${meeting.name}
DESCRIPTION:${meeting.reason}
LOCATION:${meeting.organization}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-${meeting.name.replace(/\s+/g, '-')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateGoogleCalendarLink = (meeting: Meeting) => {
    const startDate = new Date(meeting.dateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Meeting with ${meeting.name}`,
      dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
      details: meeting.reason,
      location: meeting.organization
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Schedule a Meeting</CardTitle>
          <CardDescription>
            Book your appointment and get calendar integration instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organization/Company
              </Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Your company or organization"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Brief description of meeting purpose"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="datetime" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <Clock className="w-4 h-4" />
                Preferred Date & Time
              </Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={formData.preferredDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredDateTime: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-primary shadow-elegant">
              Schedule Meeting
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;