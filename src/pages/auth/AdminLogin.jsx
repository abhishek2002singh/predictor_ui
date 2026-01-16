import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  GraduationCap,
} from "lucide-react";
import { authService } from "../../services/authService";
import { setToken } from "../../utils/auth";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.adminLogin(formData);
      console.log("Login response:", response);

      if (response.success && response.token) {
        setToken(response.token);
        console.log("Token saved, navigating to /admin");
        navigate("/admin");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="bg-linear-to-br from-blue-600 to-violet-600 p-3 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CollegePredict</span>
          </Link>
        </div>

        {/* Admin Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Admin Portal
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">
              Access the admin dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  placeholder="Enter admin email"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-violet-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Admin Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Back to User Login */}
          <p className="mt-6 text-center text-gray-400">
            Not an admin?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              User Login
            </Link>
          </p>
        </div>

        {/* Security Note */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          This is a restricted area. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
