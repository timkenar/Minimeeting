import AdminDashboard from "@/components/AdminDashboard";

interface AdminProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

const Admin = ({ onAuthChange }: AdminProps) => {
  return (
    <div className="pt-0">
      <AdminDashboard onAuthChange={onAuthChange} />
    </div>
  );
};

export default Admin;