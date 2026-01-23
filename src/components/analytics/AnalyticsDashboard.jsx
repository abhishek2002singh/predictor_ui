// components/analytics/AnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Upload,
  BarChart3,
  TrendingUp,
  Users2,
  RefreshCw,
} from "lucide-react";

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    user: { total: 0, active: 0 },
    admin: { total: 0, active: 0 },
    assistance: { total: 0, active: 0 },
    upload: { total: 0, years: 0 },
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        user: { total: 20, active: 5 },
        admin: { total: 2, active: 2 },
        assistance: { total: 4, active: 3 },
        upload: { total: 50, years: 2025 },
      });
      setLoading(false);
    }, 500);
  };

  const cards = [
    {
      id: "user",
      label: "User Analytics",
      icon: Users,
      color: "blue",
      link: "/admin/analytics/user",
      data: stats.user,
    },
    {
      id: "admin",
      label: "Admin Analytics",
      icon: Shield,
      color: "purple",
      link: "/admin/analytics/admin",
      data: stats.admin,
    },
    {
      id: "assistance",
      label: "Assistance Analytics",
      icon: Users2,
      color: "green",
      link: "/admin/analytics/assistance",
      data: stats.assistance,
    },
    {
      id: "upload",
      label: "Upload Data Analytics",
      icon: Upload,
      color: "orange",
      link: "/admin/analytics/upload",
      data: stats.upload,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform performance overview</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg"
        >
          <RefreshCw className={`h-4 w-4 ${loading && "animate-spin"}`} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ id, label, icon: Icon, color, link, data }) => (
          <Link key={id} to={link}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="p-4 bg-white border rounded-xl cursor-pointer"
            >
              <div className={`p-2 w-fit rounded-lg bg-${color}-100`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>

              <h3 className="mt-4 text-lg font-semibold">{label}</h3>

              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-bold">{data.total}</span>
                </div>

                {"active" in data && (
                  <div className="flex justify-between">
                    <span>Active</span>
                    <span className="font-bold text-green-600">
                      {data.active}
                    </span>
                  </div>
                )}

                {"years" in data && (
                  <div className="flex justify-between">
                    <span>Years</span>
                    <span className="font-bold">{data.years}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={TrendingUp}
          label="Total Users"
          value={stats.user.total}
          color="blue"
        />
        <SummaryCard
          icon={Users}
          label="Active Assistants"
          value={stats.assistance.active}
          color="green"
        />
        <SummaryCard
          icon={BarChart3}
          label="Total Data Entries"
          value={stats.upload.total}
          color="purple"
        />
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className={`p-4 rounded-xl bg-${color}-50 border`}>
    <div className="flex items-center gap-3">
      <Icon className={`h-6 w-6 text-${color}-600`} />
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export default AnalyticsDashboard;
