


import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  Eye,
  X,
  BarChart3,
  TrendingUp,
  Save,
  CheckCircle,
  XCircle,
  FileDown,
  FileText,
  AlertCircle,
  Check,
  Loader2,
  FileUp,
} from "lucide-react";
import userDataService from "../../services/userDataService";

const UserDataManagement = ({ permissions, isAdmin = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState(null);
  const [examStats, setExamStats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    examType: "",
    minChecks: "",
    maxChecks: "",
    fromDate: "",
    toDate: "",
    isNegativeResponse: "",
    isPositiveResponse: "",
    isDataExport: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedExportExam, setSelectedExportExam] = useState("");
  const limit = 10;

  // Check if user has permission to view (admin always has access)
  const canView = isAdmin || permissions?.canViewUsers;
  const canExport = isAdmin || permissions?.canExportData;
  const canUpdate = isAdmin || permissions?.canUpdateUsers;

  useEffect(() => {
    if (canView) {
      fetchUsers();
    }
  }, [currentPage, canView]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Prepare params with all filters
      const params = {
        page: currentPage,
        limit,
        ...(filters.examType && { examType: filters.examType }),
        ...(filters.minChecks && { minChecks: filters.minChecks }),
        ...(filters.maxChecks && { maxChecks: filters.maxChecks }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
        ...(filters.isNegativeResponse !== "" && { isNegativeResponse: filters.isNegativeResponse }),
        ...(filters.isPositiveResponse !== "" && { isPositiveResponse: filters.isPositiveResponse }),
        ...(filters.isDataExport !== "" && { isDataExport: filters.isDataExport }),
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await userDataService.getAllUserData(params);
      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.totalRecords || 0);
      setStats(response.stats || null);
      setExamStats(response.examStats || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleFilterApply = () => {
    setCurrentPage(1);
    fetchUsers();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      examType: "",
      minChecks: "",
      maxChecks: "",
      fromDate: "",
      toDate: "",
      isNegativeResponse: "",
      isPositiveResponse: "",
      isDataExport: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
    fetchUsers();
    setShowFilters(false);
  };

const handleExport = async (examType = "") => {
  if (!canExport) {
    alert("You don't have permission to export data");
    return;
  }

  try {
    setExporting(true);
    setExportMessage("");
    setExportSuccess(false);

    console.log('🔵 Starting export for:', examType || 'ALL exams');
    
    // Use the service (cleaner approach)
    const response = await userDataService.exportUserData(
      examType === "ALL" ? "" : examType
    );

    console.log('📥 Service response received:');
    console.log('- Is CSV?', response.isCsvResponse);
    console.log('- Is JSON?', response.isJsonResponse);
    console.log('- Data type:', typeof response.data);
    console.log('- Is Blob?', response.data instanceof Blob);
    
    // Handle CSV response
    if (response.isCsvResponse || response.data instanceof Blob) {
      console.log('✅ Processing CSV download...');
      
      // Ensure we have a Blob
      let blobData;
      if (response.data instanceof Blob) {
        blobData = response.data;
      } else {
        // Convert whatever we have to Blob
        const data = typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
        blobData = new Blob([data], { type: 'text/csv' });
      }
      
      // Check if blob has data
      if (blobData.size === 0) {
        setExportMessage("No data to export");
        setExportSuccess(false);
        return;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement('a');
      link.href = url;
      
      // Create filename
      const effectiveExamType = examType === "ALL" || examType === "" ? 'all' : examType;
      const filename = `user-data-export-${effectiveExamType}-${new Date().toISOString().split('T')[0]}.csv`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success
      setExportSuccess(true);
      setExportMessage(`✅ Data exported successfully! ${examType && examType !== "ALL" ? `(${examType})` : '(All exams)'}`);
      
      // Refresh user list
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
    } 
    // Handle JSON response (no data)
    else if (response.isJsonResponse || (response.data && response.data.message)) {
      const message = response.data?.message || "No new data to export";
      console.log('📝 No data message:', message);
      setExportMessage(message);
      setExportSuccess(false);
    }
    // Fallback: Check if response data is string that looks like CSV
    else if (typeof response.data === 'string' && response.data.includes('Mobile Number')) {
      console.log('🔄 Fallback: String contains CSV, converting...');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${examType || 'all'}-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setExportMessage(`✅ Data exported successfully!`);
      setTimeout(() => fetchUsers(), 1000);
    }
    else {
      console.error('❌ Unexpected response:', response);
      setExportMessage("Unexpected response from server");
      setExportSuccess(false);
    }
    
  } catch (error) {
    console.error("❌ Export error:", error);
    setExportMessage(`❌ ${error.message}`);
    setExportSuccess(false);
    
  } finally {
    setExporting(false);
    setSelectedExportExam("");
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setExportMessage("");
      setExportSuccess(false);
    }, 5000);
  }
};

  const handleLocalExport = () => {
    if (!canExport) {
      alert("You don't have permission to export data");
      return;
    }

    // Local CSV export as fallback
    const headers = [
      "Name", "Email", "Mobile", "Exam Type", "Rank", "Category",
      "Gender", "State", "Checked At", "Total Checks", "Exams Checked",
      "Created At", "Updated At", "Negative Response", "Positive Response", "Data Export"
    ];
    
    const csvContent = [
      headers.join(","),
      ...users.flatMap(user => 
        user.checkHistory?.map(check => [
          `"${user.firstName || ''} ${user.lastName || ''}"`,
          user.emailId || '',
          user.mobileNumber,
          check.examType,
          check.rank || '',
          check.category || '',
          check.gender || '',
          check.homeState || '',
          new Date(check.checkedAt).toISOString(),
          user.totalChecks,
          `"${user.examsChecked?.join(", ") || ""}"`,
          new Date(user.createdAt).toISOString(),
          new Date(user.updatedAt).toISOString(),
          user.isNegativeResponse ? 'Yes' : 'No',
          user.isPositiveResponse ? 'Yes' : 'No',
          user.isDataExport ? 'Yes' : 'No',
        ].join(",")) || []
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `local_users_data_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleUpdateUser = async (userId, updates) => {
    if (!canUpdate) {
      alert("You don't have permission to update user data");
      return;
    }

    try {
      setSaving(true);
      const response = await userDataService.updateUserData(userId, updates);
      
      if (response.success) {
        // Update local state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, ...updates } : user
        ));
        
        // If editing current selected user, update it too
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, ...updates });
        }
        
        setEditingUser(null);
        // Refresh the data
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If no permission, show access denied
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Users className="h-16 w-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
        <p className="mt-2">You don't have permission to view user data.</p>
        <p className="text-sm mt-1">Contact your administrator to request access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Message */}
      {exportMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${exportSuccess 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {exportSuccess ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="font-medium">{exportMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Export Modal */}
      {selectedExportExam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
              <button
                onClick={() => setSelectedExportExam("")}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={exporting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Export {selectedExportExam === "ALL" ? "all unexported data" : `unexported ${selectedExportExam} data`}?
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedExportExam("")}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={exporting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExport(selectedExportExam === "ALL" ? "" : selectedExportExam)}
                  disabled={exporting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting...
                    </div>
                  ) : (
                    "Export Data"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Data Management</h1>
          <p className="text-gray-500 mt-1">
            View, manage, and export user prediction data
          </p>
        </div>
        {canExport && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleLocalExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              title="Export current view to CSV"
            >
              <FileText className="h-4 w-4" />
              Export Local
            </button>
            
            <div className="relative group">
              <button
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export New Data
                  </>
                )}
              </button>
              
              {/* Dropdown for exam-specific export */}
              <div className="absolute right-0 mt-1 hidden group-hover:block z-10">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]">
                  <button
                    onClick={() => setSelectedExportExam("ALL")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Exams
                  </button>
                  <div className="border-t border-gray-100"></div>
                  {["JEE_MAINS", "JEE_ADVANCED", "CUET", "NEET", "MHT_CET", "KCET", "WBJEE", "BITSAT"].map((exam) => (
                    <button
                      key={exam}
                      onClick={() => setSelectedExportExam(exam)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {exam.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Export Percentage</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.exportPercentage} %</p>
              </div>
            </div>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">Avg Checks/User</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.avgChecksPerUser?.toFixed(1) || 0}
                </p>
              </div>
            </div>
          </motion.div> */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <FileUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Export</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalUnexportedData || 0}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <FileDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">total Export Data</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalExportedData || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rest of the component remains exactly the same from your original code */}
      {/* Exam Stats */}
      {examStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Users by Exam Type</h3>
          <div className="flex flex-wrap gap-2">
            {examStats.map((exam) => (
              <span
                key={exam._id}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {exam._id}: {exam.userCount}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={filters.examType}
                  onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Exams</option>
                  <option value="JEE_MAINS">JEE Mains</option>
                  <option value="JEE_ADVANCED">JEE Advanced</option>
                  <option value="CUET">CUET</option>
                  <option value="NEET">NEET</option>
                  <option value="MHT_CET">MHT CET</option>
                  <option value="KCET">KCET</option>
                  <option value="WBJEE">WBJEE</option>
                  <option value="BITSAT">BITSAT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Checks
                </label>
                <input
                  type="number"
                  value={filters.minChecks || ""}
                  onChange={(e) => setFilters({ ...filters, minChecks: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Checks
                </label>
                <input
                  type="number"
                  value={filters.maxChecks || ""}
                  onChange={(e) => setFilters({ ...filters, maxChecks: e.target.value })}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.fromDate || ""}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.toDate || ""}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Negative Response
                </label>
                <select
                  value={filters.isNegativeResponse || ""}
                  onChange={(e) => setFilters({ ...filters, isNegativeResponse: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Positive Response
                </label>
                <select
                  value={filters.isPositiveResponse || ""}
                  onChange={(e) => setFilters({ ...filters, isPositiveResponse: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Export
                </label>
                <select
                  value={filters.isDataExport || ""}
                  onChange={(e) => setFilters({ ...filters, isDataExport: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleFilterApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Users Table - Rest of the table and modals remain exactly as in your original code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="h-12 w-12 mb-4 text-gray-300" />
            <p>No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Exams Checked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Checks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user?.firstName?.[0] && user?.lastName?.[0]
                              ? `${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`
                              : "NA"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName || 'N/A'} {user.lastName || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            {user.emailId || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            {user.mobileNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.examsChecked?.map((exam) => (
                            <span
                              key={exam}
                              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                            >
                              {exam}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          {user.totalChecks}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.isNegativeResponse && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> Negative
                            </span>
                          )}
                          {user.isPositiveResponse && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Positive
                            </span>
                          )}
                          {user.isDataExport && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1">
                              <FileDown className="h-3 w-3" /> Exported
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {canUpdate && (
                            <button
                              onClick={() => setEditingUser({
                                ...user,
                                isNegativeResponse: user.isNegativeResponse || false,
                                isPositiveResponse: user.isPositiveResponse || false,
                                isDataExport: user.isDataExport || false,
                                isCheckData: user.isCheckData || false
                              })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName || 'N/A'} {user.lastName || ''}
                        </p>
                        <p className="text-sm text-gray-500">{user.emailId || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {canUpdate && (
                        <button
                          onClick={() => setEditingUser({
                            ...user,
                            isNegativeResponse: user.isNegativeResponse || false,
                            isPositiveResponse: user.isPositiveResponse || false,
                            isDataExport: user.isDataExport || false,
                            isCheckData: user.isCheckData || false
                          })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {user.totalChecks} checks
                    </span>
                    {user.examsChecked?.slice(0, 2).map((exam) => (
                      <span
                        key={exam}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {exam}
                      </span>
                    ))}
                    {user.isNegativeResponse && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        Negative
                      </span>
                    )}
                    {user.isPositiveResponse && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Positive
                      </span>
                    )}
                    {user.isDataExport && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        Exported
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * limit + 1} to{" "}
              {Math.min(currentPage * limit, totalRecords)} of {totalRecords} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser.firstName || 'N/A'} {selectedUser.lastName || ''}
                  </h3>
                  <p className="text-gray-500">{selectedUser.emailId || 'No email'}</p>
                  <p className="text-gray-500">{selectedUser.mobileNumber}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600">Total Checks</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedUser.totalChecks}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600">Exams Checked</p>
                  <p className="text-2xl font-bold text-purple-900">{selectedUser.examsChecked?.length || 0}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600">Last Active</p>
                  <p className="text-sm font-bold text-green-900">{formatDateTime(selectedUser.updatedAt)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm text-red-600">Registered</p>
                  <p className="text-sm font-bold text-red-900">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">User Status</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.isNegativeResponse && (
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> Negative Response
                    </span>
                  )}
                  {selectedUser.isPositiveResponse && (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Positive Response
                    </span>
                  )}
                  {selectedUser.isDataExport && (
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <FileDown className="h-4 w-4" /> Data Exported
                    </span>
                  )}
                  {selectedUser.isCheckData && (
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Check Data
                    </span>
                  )}
                  {!selectedUser.isNegativeResponse && !selectedUser.isPositiveResponse && !selectedUser.isDataExport && !selectedUser.isCheckData && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      No status set
                    </span>
                  )}
                </div>
              </div>

              {/* Exams Checked */}
              {selectedUser.examsChecked?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Exams Checked</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.examsChecked.map((exam) => (
                      <span
                        key={exam}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Check History */}
              {selectedUser.checkHistory?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Recent Check History</h4>
                    <span className="text-sm text-gray-500">{selectedUser.checkHistory.length} total checks</span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedUser.checkHistory.slice(-10).reverse().map((check, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {check.examType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(check.checkedAt)}
                          </span>
                          {check?.gainLeedFrom?.map((leed)=>(
                            <div>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {leed}
                          </span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Rank:</span>{" "}
                            <span className="font-medium">{check.rank}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Category:</span>{" "}
                            <span className="font-medium">{check.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Gender:</span>{" "}
                            <span className="font-medium">{check.gender}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">State:</span>{" "}
                            <span className="font-medium">{check.homeState}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && canUpdate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit User Status</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={saving}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {editingUser.firstName?.[0]}{editingUser.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {editingUser.firstName} {editingUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{editingUser.emailId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingUser.isNegativeResponse || false}
                      onChange={(e) => setEditingUser({
                        ...editingUser,
                        isNegativeResponse: e.target.checked,
                        ...(e.target.checked && { isPositiveResponse: false })
                      })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Negative Response</span>
                  </label>
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingUser.isPositiveResponse || false}
                      onChange={(e) => setEditingUser({
                        ...editingUser,
                        isPositiveResponse: e.target.checked,
                        ...(e.target.checked && { isNegativeResponse: false })
                      })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Positive Response</span>
                  </label>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingUser.isDataExport || false}
                      onChange={(e) => setEditingUser({
                        ...editingUser,
                        isDataExport: e.target.checked
                      })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Data Export</span>
                  </label>
                  <FileDown className="h-5 w-5 text-purple-500" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingUser.isCheckData || false}
                      onChange={(e) => setEditingUser({
                        ...editingUser,
                        isCheckData: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Check Data</span>
                  </label>
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateUser(editingUser._id, {
                      isNegativeResponse: editingUser.isNegativeResponse || false,
                      isPositiveResponse: editingUser.isPositiveResponse || false,
                      isDataExport: editingUser.isDataExport || false,
                      isCheckData: editingUser.isCheckData || false
                    })}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserDataManagement;