import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, role: requiredRole, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/menu" replace />;
  }

  return children;
}

export default ProtectedRoute;
