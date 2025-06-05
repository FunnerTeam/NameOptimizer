import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // אם עדיין טוען, הצג loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // אם לא מחובר, הפנה לאימות
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
