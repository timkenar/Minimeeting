import AdminDashboard from "@/components/AdminDashboard";

interface AdminProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
  onCreateMeetingChange?: (callback: (() => void) | null) => void;
}

const Admin = ({ onAuthChange, onCreateMeetingChange }: AdminProps) => {
  return (
    <div className="pt-0">
      <AdminDashboard onAuthChange={onAuthChange} onCreateMeetingChange={onCreateMeetingChange} />
    </div>
  );
};

export default Admin;