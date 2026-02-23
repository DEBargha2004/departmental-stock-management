import { useAuth } from "@/providers/auth-provider";
import { Navigate, Outlet, useLocation } from "react-router";

const authRoute = /^\/auth\//;

export default function MainLayout() {
  const { token } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  if (!token && !authRoute.test(pathname)) {
    return <Navigate to="/auth/sign-in" />;
  }

  return <Outlet />;
}
