import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid } from "../../utils/auth";

// Redirect authenticated users away from login/signup pages
const PublicRoute = ({ children }) => {
  const location = useLocation();
  const { valid, user } = isTokenValid();

  if (valid) {
    // Redirect based on role
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
