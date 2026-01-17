import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Download,
  LayoutDashboard,
  CheckCircle,
  XCircle,
} from "lucide-react";

const AssistantDashboard = () => {
  const { permissions } = useOutletContext() || {};

  const permissionItems = [
    { key: "canViewDashboard", label: "View Dashboard", icon: LayoutDashboard },
    { key: "canViewUsers", label: "View Users", icon: Eye },
    { key: "canEditUsers", label: "Edit Users", icon: Edit },
    { key: "canDeleteUsers", label: "Delete Users", icon: Trash2 },
    { key: "canViewPredictions", label: "View Predictions", icon: BarChart3 },
    { key: "canExportData", label: "Export Data", icon: Download },
    { key: "canViewStats", label: "View Statistics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Assistant</h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your permissions and access
        </p>
      </div>

      {/* Permissions Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Permissions
        </h2>

        {permissions ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissionItems.map(({ key, label, icon: Icon }) => {
              const hasPermission = permissions[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    hasPermission
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      hasPermission ? "bg-green-100" : "bg-gray-200"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        hasPermission ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        hasPermission ? "text-green-900" : "text-gray-500"
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                  {hasPermission ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Loading permissions...
          </div>
        )}
      </motion.div>

      {/* Quick Stats (if permission granted) */}
      {permissions?.canViewStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Predictions Today</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-2">Need More Access?</h3>
        <p className="text-emerald-100">
          Contact your administrator to request additional permissions for your
          account.
        </p>
      </motion.div>
    </div>
  );
};

export default AssistantDashboard;
