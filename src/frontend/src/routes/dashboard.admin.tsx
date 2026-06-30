import { createRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { ComingSoonPage } from "@/components/layout/ComingSoonPage";
import { dashboardLayoutRoute } from "./dashboard";

export const adminRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/admin",
  component: AdminPage,
});

function AdminPage() {
  return (
    <ComingSoonPage
      title="Admin"
      description="Manage users, roles, permissions, analytics, storage, and platform logs."
      icon={ShieldCheck}
    />
  );
}
