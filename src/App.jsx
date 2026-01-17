import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import AdminLogin from "./pages/auth/AdminLogin";
import PrivateRoute from "./components/common/PrivateRoute";
import PublicRoute from "./components/common/PublicRoute";
import AdminLayout from "./components/adminManagement/AdminLayout";
import AdminDashboard from "./components/adminManagement/AdminDashboard";
import AdminUsers from "./components/adminManagement/AdminUsers";

function App() {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Auth routes (no layout) */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute requiredRole="ADMIN">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
