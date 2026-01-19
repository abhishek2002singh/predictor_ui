import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import { adminService } from "../../services/adminService";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-600"
          trend="+12% this week"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={UserCheck}
          color="bg-green-600"
        />
        <StatCard
          title="Inactive Users"
          value={stats?.inactiveUsers || 0}
          icon={UserX}
          color="bg-red-500"
        />
        <StatCard
          title="New This Week"
          value={stats?.newUsersThisWeek || 0}
          icon={TrendingUp}
          color="bg-violet-600"
        />
         <StatCard
          title="Total Assistances"
          value={stats?.totalAssistance || 0}
          icon={TrendingUp}
          color="bg-violet-600"
        />
        <StatCard
          title="Active Assistance"
          value={stats?.activeAssistance || 0}
          icon={UserCheck}
          color="bg-green-600"
        />
        <StatCard
          title="Inactive Assistance"
          value={stats?.inactiveAssistance || 0}
          icon={UserX}
          color="bg-red-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Users by Category
            </h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats?.usersByCategory?.map((item) => (
              <div key={item._id} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-600">
                  {item._id || "N/A"}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-linear-to-r from-blue-600 to-violet-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (item.count / (stats?.totalUsers || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="w-12 text-sm font-semibold text-gray-900 text-right">
                  {item.count}
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Stats
            </h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Total Admins</p>
                  <p className="text-sm text-gray-500">System administrators</p>
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {stats?.totalAdmins || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Growth Rate</p>
                  <p className="text-sm text-gray-500">This week</p>
                </div>
              </div>
              <span className="text-xl font-bold text-green-600">
                {stats?.totalUsers > 0
                  ? `+${Math.round(
                      (stats.newUsersThisWeek / stats.totalUsers) * 100
                    )}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Active Rate</p>
                  <p className="text-sm text-gray-500">Users online</p>
                </div>
              </div>
              <span className="text-xl font-bold text-violet-600">
                {stats?.totalUsers > 0
                  ? `${Math.round(
                      (stats.activeUsers / stats.totalUsers) * 100
                    )}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
