import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/transitions/PageTransition";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyGroups from "./pages/PropertyGroups";
import PropertyGroupDetail from "./pages/PropertyGroupDetail";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CheckApiData from "./pages/APIChecker";
import WorkOrders from "./pages/WorkOrders";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import Sensors from "./pages/Sensors";
import NotFound from "@/pages/not-found";
import Footer from "./components/Footer";
import {
  Bell,
  Search,
  Menu,
  X,
  Calendar as CalendarIcon,
  Download,
  BarChart4,
  Check,
  User,
  Shield,
  LogOut,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";

// Import the needed components for the dropdown menu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

import PrivateRoute from "./routes/PrivateRoute";
import { logout, getUserFromToken } from "./auth";

// Modern Header component with improved UX
const Header = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [username, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("guest@gmail.com");;
  const user = getUserFromToken();
  console.log('UserId: ', user?.userId);
  const userId = user?.userId || 0;

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users/' + userId, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();

        console.log('User response:', result.data);
        setUserName(result.data.name);
        setUserEmail(result.data.email);

      } catch (error) {
        console.error('Error during get user:', error);
      }
    };

    getUser();
  }, []);

  // Alerts/notifications data
  const notifications = [
    {
      id: 1,
      title: "High Moisture Alert",
      description: "42 Maple Street has exceeded moisture threshold",
      timestamp: "10 minutes ago",
      read: false,
      priority: "high"
    },
    {
      id: 2,
      title: "Inspection Due",
      description: "Scheduled inspection for Riverdale Apartments due today",
      timestamp: "1 hour ago",
      read: false,
      priority: "medium"
    },
    {
      id: 3,
      title: "Temperature Warning",
      description: "Low temperature detected at Sunset Towers, Unit 12B",
      timestamp: "2 hours ago",
      read: false,
      priority: "medium"
    },
    {
      id: 4,
      title: "Work Order Completed",
      description: "Mold remediation completed at 15 Oak Lane",
      timestamp: "Yesterday",
      read: false,
      priority: "low"
    }
  ];

  // Close notification panel when clicking outside
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section with mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Middle section with page title and breadcrumb */}
          <div className="flex flex-1 items-center justify-center md:justify-start">
            <h1 className="text-xl font-semibold text-gray-900">
              Housing Compliance Dashboard
            </h1>
          </div>

          {/* Right section with action buttons */}
          <div className="flex items-center space-x-4">
            {/* Search toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="absolute right-0 top-0 -mt-1 flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 rounded-lg border border-gray-300 py-2 px-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  className="flex items-center rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Date picker */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex items-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <div className="p-3">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </div>
                      {date && (
                        <div className="border-t border-gray-100 p-3">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">Selected date:</p>
                            <p className="text-sm text-gray-500">
                              {format(date, "PPP")}
                            </p>
                          </div>
                          <Link to={`/reports?date=${format(date, "yyyy-MM-dd")}`}>
                            <div className="w-full mt-3 flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer">
                              View Reports for This Date
                            </div>
                          </Link>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by date</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative" ref={notificationRef}>
                    <div
                      className="relative rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                      <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {notifications.filter(n => !n.read).length}
                      </span>
                      <Bell className="h-5 w-5" />
                    </div>

                    {/* Notifications dropdown panel */}
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="p-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Notifications</h3>
                            <Link to="/alerts" className="text-xs text-emerald-600 hover:text-emerald-500">
                              View All
                            </Link>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-6 px-4 text-center">
                              <p className="text-sm text-gray-500">No notifications at this time</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notification) => (
                                <Link to={`/alerts/${notification.id}`} key={notification.id}>
                                  <div className="flex px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                    <div className={`flex-shrink-0 mr-3 mt-1 h-2 w-2 rounded-full ${notification.priority === 'high' ? 'bg-red-500' :
                                      notification.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                      }`} />
                                    <div className="flex-1 space-y-1">
                                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                      <p className="text-sm text-gray-500">{notification.description}</p>
                                      <p className="text-xs text-gray-400">{notification.timestamp}</p>
                                    </div>
                                    {!notification.read && (
                                      <div className="flex-shrink-0 ml-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="border-t border-gray-100 p-3">
                          <div
                            className="w-full flex items-center justify-center rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                            onClick={() => {
                              // Mark all notifications as read
                              setNotificationsOpen(false);
                              // This would normally update the API
                            }}
                          >
                            <Check className="h-4 w-4 mr-1.5" />
                            Mark All as Read
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Action buttons for exports and reports */}
            <div className="hidden sm:flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer">
                      <Download className="h-4 w-4 mr-1.5" />
                      Export
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export current data as CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/reports">
                      <span className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                        <BarChart4 className="h-4 w-4 mr-1.5" />
                        Reports
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View compliance reports</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* User profile dropdown */}
            <div className="relative ml-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer rounded-full bg-white p-1 hover:bg-gray-50">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="hidden md:flex items-center text-sm font-medium text-gray-700">
                      <span>{username}</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{username}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Profile",
                      description: "Your profile page would be shown here",
                    });
                  }}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Help & Support",
                      description: "The support page would be shown here",
                    });
                  }}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Signed out",
                      description: "You have been successfully signed out",
                    });

                    logout();

                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <span className="block rounded-md bg-emerald-100 px-3 py-2 text-base font-medium text-emerald-800">Dashboard</span>
            </Link>
            <Link to="/properties" onClick={() => setMobileMenuOpen(false)}>
              <span className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">Properties</span>
            </Link>
            <Link to="/property-groups" onClick={() => setMobileMenuOpen(false)}>
              <span className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">Property Groups</span>
            </Link>
            <Link to="/work-orders" onClick={() => setMobileMenuOpen(false)}>
              <span className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">Work Orders</span>
            </Link>
            <Link to="/alerts" onClick={() => setMobileMenuOpen(false)}>
              <span className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">Alerts</span>
            </Link>
            <Link to="/reports" onClick={() => setMobileMenuOpen(false)}>
              <span className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">Reports</span>
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
              <span className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">Settings</span>
            </Link>

            {/* Divider for user options in mobile menu */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* User profile section in mobile menu */}
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">User Options</p>
            </div>

            <div
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false);
                toast({
                  title: "Profile",
                  description: "Your profile page would be shown here",
                });
              }}
            >
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </div>
            </div>

            <div
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false);
                toast({
                  title: "Help & Support",
                  description: "The support page would be shown here",
                });
              }}
            >
              <div className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </div>
            </div>

            <div
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false);
                toast({
                  title: "Signed out",
                  description: "You have been successfully signed out",
                });
              }}
            >
              <div className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <PageTransition routeKey={location}>
                <Switch>
                  <PrivateRoute path="/dashboard" component={Dashboard} />
                  <PrivateRoute path="/" component={() => <Redirect to="/dashboard" />} />
                  <PrivateRoute path="/properties" component={Properties} />
                  {/* <Route path="/" component={() => <Redirect to="/dashboard" />} />
                  <Route path="/dashboard" component={Dashboard} /> */}
                  {/* <Route path="/properties" component={Properties} /> */}
                  <Route path="/properties/:id" component={PropertyDetail} />
                  <Route path="/property-groups" component={PropertyGroups} />
                  <Route path="/property-groups/:id" component={PropertyGroupDetail} />
                  <Route path="/work-orders" component={WorkOrders} />
                  <Route path="/work-orders/:id" component={WorkOrderDetail} />
                  <Route path="/alerts" component={Alerts} />
                  <Route path="/reports" component={Reports} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/api-checker" component={CheckApiData} />
                  <Route path="/sensors" component={Sensors} />
                  <Route component={NotFound} />
                </Switch>
              </PageTransition>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;