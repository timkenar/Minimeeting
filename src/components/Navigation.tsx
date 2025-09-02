import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-4 right-4 z-50">
      {location.pathname === "/" ? (
        <Link to="/admin">
          <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-soft">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
      ) : (
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-soft">
            <Calendar className="w-4 h-4 mr-2" />
            Book Meeting
          </Button>
        </Link>
      )}
    </nav>
  );
};

export default Navigation;