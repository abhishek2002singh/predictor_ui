import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import { Login, Signup, AdminLogin } from "./pages/auth";
import { PrivateRoute, PublicRoute } from "./components/common";
import {
  AdminLayout,
  AdminDashboard,
  AdminUsers,
} from "./components/admin";

function App() {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Auth routes (no layout) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
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
