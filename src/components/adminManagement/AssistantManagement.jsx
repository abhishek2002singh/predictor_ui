import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Eye,
  Edit,
  Download,
  LayoutDashboard,
  BarChart3,
  User,
} from "lucide-react";
import assistantService from "../../services/assistantService";
import useDebounce from "../../hooks/useDebounce";
import ConfirmationModal from "../../ConfirmationModal/ConfirmationModal";
import { Link } from "react-router-dom";

const AssistantManagement = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const [error, setError] = useState("");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: '',
    data: null,
    onConfirm: null,
    isLoading: false
  });

  // Form state for creating assistant
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    mobileNumber: "",
    password: "",
    permissions: {
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canViewPredictions: false,
      canExportData: false,
      canViewDashboard: true,
      canViewStats: false,
    },
  });

  // Permission edit state
  const [permissionForm, setPermissionForm] = useState({
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewPredictions: false,
    canExportData: false,
    canViewDashboard: true,
    canViewStats: false,
  });

  useEffect(() => {
    if (debouncedSearch.length === 0 || debouncedSearch.length >= 2) {
      fetchAssistants();
    }
  }, [pagination.page, debouncedSearch]);

  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const response = await assistantService.getAllAssistants(
        pagination.page,
        pagination.limit,
        debouncedSearch
      );
      setAssistants(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.totalRecords,
        pages: response.totalPages,
      }));
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssistant = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      await assistantService.createAssistant(createForm);
      setShowCreateModal(false);
      setCreateForm({
        firstName: "",
        lastName: "",
        emailId: "",
        mobileNumber: "",
        password: "",
        permissions: {
          canViewUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewPredictions: false,
          canExportData: false,
          canViewDashboard: true,
          canViewStats: false,
        },
      });
      fetchAssistants();
    } catch (error) {
      setError(error.message || "Failed to create assistant");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePermissions = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      await assistantService.updatePermissions(selectedAssistant._id, permissionForm);
      setShowPermissionModal(false);
      setSelectedAssistant(null);
      fetchAssistants();
    } catch (error) {
      setError(error.message || "Failed to update permissions");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusToggle = async (assistantId, currentStatus) => {
    try {
      await assistantService.updateStatus(assistantId, !currentStatus);
      fetchAssistants();
      setModalConfig({
        isOpen: false,
        type: '',
        data: null,
        onConfirm: null,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setActionMenuOpen(null);
  };

  const handleDelete = async (assistantId) => {
    setModalConfig(prev => ({ ...prev, isLoading: true }));
    try {
      await assistantService.deleteAssistant(assistantId);
      fetchAssistants();
      setModalConfig({
        isOpen: false,
        type: '',
        data: null,
        onConfirm: null,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to delete assistant:", error);
    }
    setActionMenuOpen(null);
  };

  const openPermissionModal = (assistant) => {
    setSelectedAssistant(assistant);
    setPermissionForm(
      assistant.permissions || {
        canViewUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canViewPredictions: false,
        canExportData: false,
        canViewDashboard: true,
        canViewStats: false,
      }
    );
    setShowPermissionModal(true);
    setActionMenuOpen(null);
  };

  const confirmStatusToggle = (assistant) => {
    const type = assistant.isActive ? 'deactivate-assistant' : 'activate-assistant';
    const actionText = assistant.isActive ? 'deactivate' : 'activate';

    setModalConfig({
      isOpen: true,
      type: type,
      data: {
        name: `${assistant.firstName} ${assistant.lastName}`,
        email: assistant.emailId,
        assistantType: 'Assistant'
      },
      onConfirm: () => handleStatusToggle(assistant._id, assistant.isActive),
      isLoading: false
    });
    setActionMenuOpen(null);
  };

  const confirmDeleteAssistant = (assistant) => {
    setModalConfig({
      isOpen: true,
      type: 'delete-assistant',
      data: {
        name: `${assistant.firstName} ${assistant.lastName}`,
        email: assistant.emailId,
        assistantType: 'Assistant'
      },
      onConfirm: () => handleDelete(assistant._id),
      isLoading: false
    });
    setActionMenuOpen(null);
  };

  const confirmUpdatePermissions = () => {
    setModalConfig({
      isOpen: true,
      type: 'update-permissions',
      data: selectedAssistant ? {
        name: `${selectedAssistant.firstName} ${selectedAssistant.lastName}`,
        email: selectedAssistant.emailId,
        assistantType: 'Assistant'
      } : null,
      onConfirm: () => {
        // Trigger form submission
        const submitEvent = new Event('submit', { bubbles: true });
        document.querySelector('form')?.dispatchEvent(submitEvent);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      },
      isLoading: false
    });
  };

  const permissionLabels = {
    canViewUsers: { label: "View Users", icon: Eye, description: "Can view user list and details" },
    canEditUsers: { label: "Edit Users", icon: Edit, description: "Can edit user information" },
    canDeleteUsers: { label: "Delete Users", icon: Trash2, description: "Can delete users" },
    canViewPredictions: { label: "View Predictions", icon: BarChart3, description: "Can view prediction data" },
    canExportData: { label: "Export Data", icon: Download, description: "Can export data to files" },
    canViewDashboard: { label: "View Dashboard", icon: LayoutDashboard, description: "Can access dashboard" },
    canViewStats: { label: "View Statistics", icon: BarChart3, description: "Can view detailed statistics" },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistants</h1>
          <p className="text-gray-500 mt-1">Manage assistants and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Assistant
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search assistants..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        />
      </div>

      {/* Assistants Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Assistant
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Contact
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Permissions
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Joined
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assistants.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No assistants found</p>
                      </td>
                    </tr>
                  ) : (
                    assistants.map((assistant) => (
                      <tr
                        key={assistant._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {assistant.firstName?.[0]}
                              {assistant.lastName?.[0]}
                            </div>
                            <div>
                              <Link
                                to={`/admin/assistants/${assistant._id}`}
                                className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {assistant.firstName} {assistant.lastName}
                              </Link>
                              <p className="text-sm text-gray-500">Assistant</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">{assistant.emailId}</p>
                          <p className="text-sm text-gray-500">
                            {assistant.mobileNumber}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {assistant.permissions ? (
                              Object.entries(assistant.permissions)
                                .filter(([key, value]) => value && key.startsWith("can"))
                                .slice(0, 3)
                                .map(([key]) => (
                                  <span
                                    key={key}
                                    className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                                  >
                                    {permissionLabels[key]?.label || key}
                                  </span>
                                ))
                            ) : (
                              <span className="text-gray-400 text-sm">No permissions</span>
                            )}
                            {assistant.permissions &&
                              Object.entries(assistant.permissions).filter(
                                ([key, value]) => value && key.startsWith("can")
                              ).length > 3 && (
                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                  +
                                  {Object.entries(assistant.permissions).filter(
                                    ([key, value]) => value && key.startsWith("can")
                                  ).length - 3}{" "}
                                  more
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${assistant.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                              }`}
                          >
                            {assistant.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(assistant.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setActionMenuOpen(
                                  actionMenuOpen === assistant._id ? null : assistant._id
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="h-5 w-5 text-gray-400" />
                            </button>
                            {actionMenuOpen === assistant._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                                <button
                                  onClick={() => openPermissionModal(assistant)}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Shield className="h-4 w-4" />
                                  Edit Permissions
                                </button>
                                <button
                                  onClick={() => confirmStatusToggle(assistant)}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {assistant.isActive ? (
                                    <>
                                      <UserX className="h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => confirmDeleteAssistant(assistant)}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                                <Link to={`/admin/assistants/${assistant._id}`}>
                                <button
                                  
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-sm"
                                >
                                  <User className="h-4 w-4" />
                                  Details
                                </button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} assistants
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Create Assistant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create Assistant</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssistant} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.firstName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.lastName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={createForm.emailId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, emailId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={createForm.mobileNumber}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, mobileNumber: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {Object.entries(permissionLabels).map(([key, { label, description }]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={createForm.permissions[key]}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            permissions: {
                              ...createForm.permissions,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Assistant
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showPermissionModal && selectedAssistant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Permissions</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedAssistant.firstName} {selectedAssistant.lastName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedAssistant(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form id="permissionForm" onSubmit={handleUpdatePermissions} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                {Object.entries(permissionLabels).map(([key, { label, icon: Icon, description }]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={permissionForm[key]}
                      onChange={(e) =>
                        setPermissionForm({
                          ...permissionForm,
                          [key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionModal(false);
                    setSelectedAssistant(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmUpdatePermissions}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Permissions
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        type={modalConfig.type}
        data={modalConfig.data}
        isLoading={modalConfig.isLoading}
      />
    </div>
  );
};

export default AssistantManagement;