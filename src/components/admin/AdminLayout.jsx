import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Bell,
  MessageSquare,
  Briefcase,
  FileText,
  BarChart3,
  UserCog,
  Settings,
} from "lucide-react";
import { isTokenValid, removeToken } from "../../utils/auth";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Assistance",
    href: "/admin/assistance",
    icon: Users,
  },
  {
    name: "Publisher",
    href: "/admin/publisher",
    icon: FileText,
  },
  {
    name: "Job Alert",
    href: "/admin/job-alert",
    icon: Briefcase,
  },
  {
    name: "Results",
    href: "/admin/results",
    icon: BarChart3,
  },
  {
    name: "Cyber Management",
    href: "/admin/cyber-management",
    icon: Shield,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: UserCog,
  },
  {
    name: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { valid, user: tokenUser } = isTokenValid();
    if (valid) {
      setUser(tokenUser);
    } else {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AdminPanel</h1>
              <p className="text-xs text-purple-200">Management System</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-white text-indigo-900 shadow-lg"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <link.icon className={`h-5 w-5 ${isActive ? "text-indigo-900" : "text-white/80 group-hover:text-white"}`} />
                <span className="flex-1">{link.name}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gradient-to-t from-black/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 transition-all border border-red-400/30"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title placeholder */}
            <div className="hidden lg:block" />

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.[0] || "A"}
                  {user?.lastName?.[0] || "D"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || "Admin"} {user?.lastName || "User"}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
