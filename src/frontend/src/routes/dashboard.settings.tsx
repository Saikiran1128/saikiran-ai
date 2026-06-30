import { createRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { ComingSoonPage } from "@/components/layout/ComingSoonPage";
import { dashboardLayoutRoute } from "./dashboard";

export const settingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      description="Manage your theme, language, notifications, security, and account preferences."
      icon={Settings}
    />
  );
}
