import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { loading } = useAuth();
  if (loading) return null;
  return <Outlet />;
};

export const GuestRoute = () => {
  const { loading } = useAuth();
  if (loading) return null;
  return <Outlet />;
};
