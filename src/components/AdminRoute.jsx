import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { userData, loading } = useAuth();

  if (loading) return null;

  if (!userData || userData.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
