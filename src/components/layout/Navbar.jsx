import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import { isTokenValid } from "../../utils/auth";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "Predictor", href: "/#predictor" },
  { name: "About", href: "/#about" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { valid, user: tokenUser } = isTokenValid();
  const isAuthenticated = valid;
  const currentUser = user || tokenUser;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleNavClick = (e, href) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setUserMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-violet-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition" />
              <div className="relative bg-linear-to-br from-blue-600 to-violet-600 p-2.5 rounded-xl">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
            </motion.div>
            <div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                CollegePredict
              </span>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                AI-Powered Admissions
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <motion.div key={link.name} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <Link
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="relative px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-linear-to-r from-blue-600 to-violet-600 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </Link>
              </motion.div>
            ))}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative ml-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-all"
                >
                  <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser?.firstName?.[0]}
                    {currentUser?.lastName?.[0]}
                  </div>
                  <span className="font-medium text-gray-700">
                    {currentUser?.firstName}
                  </span>
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {currentUser?.emailId}
                        </p>
                      </div>

                      {currentUser?.role === "ADMIN" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-violet-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                  >
                    Sign Up
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {currentUser?.firstName?.[0]}
                        {currentUser?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{currentUser?.role}</p>
                      </div>
                    </div>

                    {currentUser?.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full text-center bg-linear-to-r from-blue-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
