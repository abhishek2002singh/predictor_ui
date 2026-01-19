import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Eye,
  Edit,
  Download,
  LayoutDashboard,
  BarChart3,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import assistantService from "../../services/assistantService";

const AssistanceProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchAssistantDetails();
    }
  }, [id]);

  const fetchAssistantDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await assistantService.getAssistantById(id);
      setAssistant(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch assistant details");
      console.error("Error fetching assistant:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const permissionLabels = {
    canViewUsers: { label: "View Users", icon: Eye, color: "blue" },
    canEditUsers: { label: "Edit Users", icon: Edit, color: "green" },
    canDeleteUsers: { label: "Delete Users", icon: Trash2, color: "red" },
    canViewPredictions: { label: "View Predictions", icon: BarChart3, color: "purple" },
    canExportData: { label: "Export Data", icon: Download, color: "orange" },
    canViewDashboard: { label: "View Dashboard", icon: LayoutDashboard, color: "indigo" },
    canViewStats: { label: "View Statistics", icon: BarChart3, color: "teal" },
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600", iconBg: "bg-blue-100" },
      green: { bg: "bg-green-50", border: "border-green-100", text: "text-green-600", iconBg: "bg-green-100" },
      red: { bg: "bg-red-50", border: "border-red-100", text: "text-red-600", iconBg: "bg-red-100" },
      purple: { bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600", iconBg: "bg-purple-100" },
      orange: { bg: "bg-orange-50", border: "border-orange-100", text: "text-orange-600", iconBg: "bg-orange-100" },
      indigo: { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-600", iconBg: "bg-indigo-100" },
      teal: { bg: "bg-teal-50", border: "border-teal-100", text: "text-teal-600", iconBg: "bg-teal-100" },
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading assistant details...</p>
        </div>
      </div>
    );
  }

  if (error || !assistant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {error || "Assistant not found"}
          </h2>
          <button
            onClick={() => navigate("/admin/assistants")}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Assistants
          </button>
        </div>
      </div>
    );
  }

  const activePermissions = assistant.permissions
    ? Object.entries(assistant.permissions)
        .filter(([key, value]) => value && permissionLabels[key])
    : [];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/assistants")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Assistants</span>
        </button>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            assistant.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {assistant.isActive ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Active
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              Inactive
            </>
          )}
        </span>
      </div>

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                {assistant.firstName?.[0]}
                {assistant.lastName?.[0]}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {assistant.firstName} {assistant.lastName}
              </h1>
              <p className="text-gray-500 mt-1">Assistant Account</p>
              
              {/* Contact Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{assistant.emailId || "N/A"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{assistant.mobileNumber || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(assistant.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(assistant.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Permissions</h2>
          </div>

          {activePermissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePermissions.map(([key, value]) => {
                const permission = permissionLabels[key];
                if (!permission) return null;
                
                const Icon = permission.icon;
                const colorClasses = getColorClasses(permission.color);
                
                return (
                  <div
                    key={key}
                    className={`p-4 border rounded-xl ${colorClasses.border} ${colorClasses.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClasses.iconBg}`}>
                        <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {permission.label}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {value === true ? "Granted" : "Restricted"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-4 text-gray-500">No permissions assigned</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/admin/assistants`)}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Back to List
          </button>
          <button
            onClick={() => navigate(`/admin/assistants/edit/${assistant._id}`)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Edit Assistant
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AssistanceProfile;