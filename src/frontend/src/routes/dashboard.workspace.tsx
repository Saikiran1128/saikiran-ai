import { createRoute } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";

import { ComingSoonPage } from "@/components/layout/ComingSoonPage";
import { dashboardLayoutRoute } from "./dashboard";

export const workspaceRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/workspace",
  component: WorkspacePage,
});

function WorkspacePage() {
  return (
    <ComingSoonPage
      title="Workspace"
      description="Manage your projects, notes, tasks, and bookmarks in one organized place."
      icon={FolderOpen}
    />
  );
}
