import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, Mail, Phone } from "lucide-react";
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
    email: "",
    phone: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8000/meetings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          organization: formData.organization,
          reason: formData.reason,
          email: formData.email,
          phone: formData.phone,
          signature: ""
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const result = await response.json();
      
      toast({
        title: "Meeting Scheduled!",
        description: (
          <div className="space-y-2">
            <p>Your meeting has been scheduled successfully.</p>
            <div className="flex gap-2">
              <a 
                href={result.google_calendar_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Add to Google Calendar
              </a>
              <a 
                href={`http://localhost:8000${result.ics_download_url}`} 
                className="text-primary hover:underline text-sm"
              >
                Download ICS
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
        email: "",
        phone: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive"
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Company Logo" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Request a Meeting</CardTitle>
          <CardDescription>
            Submit your meeting request and our admin will schedule a time for you
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
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0712345678"
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-primary shadow-elegant">
              Submit Meeting Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;