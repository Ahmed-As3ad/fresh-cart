import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = Boolean(localStorage.getItem("userToken"));

  return isAuthenticated ? children || <Outlet /> : <Navigate to="/login" replace />;
}
