import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";

export const RequireAuth = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "admin";
}) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};
