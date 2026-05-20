import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { token, isLoading } = useAuth();

  if (isLoading) return <></>;

  if (token) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
