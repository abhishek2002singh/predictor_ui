import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { isTokenValid } from "../../utils/auth";

const PrivateRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { valid, user } = isTokenValid();
  const currentUser = useSelector((store) => store.auth.user);

  // Not authenticated
  if (!valid) {
    localStorage.removeItem("token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    switch (user?.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "USER":
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
