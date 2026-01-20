import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import AdminLogin from "./pages/auth/AdminLogin";
import AssistantLogin from "./pages/auth/AssistantLogin";
import PrivateRoute from "./components/common/PrivateRoute";
import PublicRoute from "./components/common/PublicRoute";
import AdminLayout from "./components/adminManagement/AdminLayout";
import AdminDashboard from "./components/adminManagement/AdminDashboard";
import AdminUsers from "./components/adminManagement/AdminUsers";
import AssistantManagement from "./components/adminManagement/AssistantManagement";
import AdminUserData from "./components/adminManagement/AdminUserData";
import AssistantLayout from "./components/assistantManagement/AssistantLayout";
import AssistantDashboard from "./components/assistantManagement/AssistantDashboard";
import AssistantUserData from "./components/assistantManagement/AssistantUserData";
import useOnlineStatus from "./hooks/useOnlineStatus";
import AssistanceProfile from "./components/adminManagement/AssistanceProfile";
import CutoffUpload from "./components/adminManagement/CutoffUpload";
import PredictColleges from "./components/predictor/PredictColleges";

function App() {
  const isOnline = useOnlineStatus()
  return (
    <>
     {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-2 text-sm">
          ⚠️ You are offline. Please check your internet connection.
        </div>
      )}
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
         <Route path="/predict-colleges" element={<PredictColleges />} />
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
        <Route path="AllAdmin" element={<AdminUsers />} />
        <Route path="assistants" element={<AssistantManagement />} />
        <Route path="users" element={<AdminUserData  />} />
        UploadData
         <Route path="assistants/:id" element={<AssistanceProfile />} />
         <Route path="UploadData" element={<CutoffUpload />} />
        <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
      </Route>

      {/* Assistant login route */}
      <Route
        path="/assistant/login"
        element={
          <PublicRoute>
            <AssistantLogin />
          </PublicRoute>
        }
      />

      {/* Assistant routes */}
      <Route
        path="/assistant"
        element={
          <PrivateRoute requiredRole="ASSISTANCE">
            <AssistantLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AssistantDashboard />} />
        <Route path="users" element={<AssistantUserData />} />
        <Route path="assistants/:id" element={<AssistanceProfile />} />

      </Route>
    </Routes>
    </>
  );
}

export default App;
