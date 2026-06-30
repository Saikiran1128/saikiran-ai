import { Outlet, createRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { rootRoute } from "./__root";

// Dashboard layout route — protected. Redirects to /login when unauthenticated.
export const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
