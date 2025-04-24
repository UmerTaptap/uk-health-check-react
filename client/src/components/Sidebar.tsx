import { Link, useLocation } from "wouter";
import { 
  Home, 
  Building, 
  AlertTriangle, 
  FileText, 
  Settings, 
  LayoutGrid, 
  ClipboardList,
  Thermometer,
  BarChart2,
} from "lucide-react";
import CompanyLogo from "./CompanyLogo";

const Sidebar = () => {
  const [location] = useLocation();
  
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  // Generate class name based on active status
  const getLinkClass = (path: string) => {
    return `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive(path)
        ? "bg-emerald-100/80 text-emerald-800 font-medium shadow-sm" 
        : "text-gray-600 hover:bg-gray-100/70 hover:text-emerald-700"
    }`;
  };
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white text-gray-800 border-r border-gray-200 shadow-sm">
        <div className="flex flex-col flex-1">
          <div className="px-4 pt-6 pb-4 flex flex-col items-center border-b border-gray-200">
            <div className="mb-3">
              <CompanyLogo size="medium" />
            </div>
            <div className="mt-2 text-center">
              <h2 className="text-xl font-bold text-gray-900">Awaab's Law</h2>
              <p className="text-sm text-gray-500 mt-1">Compliance Dashboard</p>
            </div>
          </div>
          
          {/* Main Navigation */}
          <div className="px-3 py-4">
            <div className="mb-2 pl-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main
            </div>
            <nav className="space-y-1 mb-6">
              <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                <Home className="h-5 w-5 mr-3 text-gray-500" />
                Dashboard
              </Link>
              <Link href="/properties" className={getLinkClass("/properties")}>
                <Building className="h-5 w-5 mr-3 text-gray-500" />
                Properties
              </Link>
              <Link href="/property-groups" className={getLinkClass("/property-groups")}>
                <LayoutGrid className="h-5 w-5 mr-3 text-gray-500" />
                Property Groups
              </Link>
              <Link href="/work-orders" className={getLinkClass("/work-orders")}>
                <ClipboardList className="h-5 w-5 mr-3 text-gray-500" />
                Work Orders
              </Link>
              <Link href="/alerts" className={getLinkClass("/alerts")}>
                <AlertTriangle className="h-5 w-5 mr-3 text-gray-500" />
                Alerts
              </Link>
            </nav>
            
            <div className="mb-2 pl-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Management
            </div>
            <nav className="space-y-1">
              <Link href="/sensors" className={getLinkClass("/sensors")}>
                <Thermometer className="h-5 w-5 mr-3 text-gray-500" />
                Sensors
              </Link>
              <Link href="/reports" className={getLinkClass("/reports")}>
                <FileText className="h-5 w-5 mr-3 text-gray-500" />
                Reports
              </Link>
              <Link href="/settings" className={getLinkClass("/settings")}>
                <Settings className="h-5 w-5 mr-3 text-gray-500" />
                Settings
              </Link>

              <Link href="/api-checker" className={getLinkClass("/api-checker")}>
                <BarChart2 className="h-5 w-5 mr-3 text-gray-500" />
                Explore UK Health Data
              </Link>

            </nav>
          </div>
          
          {/* Footer - could add branding or version info here */}
          <div className="mt-auto border-t border-gray-200 p-4 text-xs text-center text-gray-500">
            beta test 0.2
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
