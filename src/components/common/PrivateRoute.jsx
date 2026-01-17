import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid, removeToken } from "../../utils/auth";

const PrivateRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { valid, user } = isTokenValid();

  // Not authenticated
  if (!valid) {
    removeToken();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    switch (user?.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "ASSISTANCE":
        return <Navigate to="/assistant" replace />;
      case "USER":
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
