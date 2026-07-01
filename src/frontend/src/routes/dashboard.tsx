import { Outlet, createRoute } from "@tanstack/react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { rootRoute } from "./__root";

// Workspace layout route — the single-page app shell.
//
// No auth gate: the layout renders its children unconditionally. The app opens
// directly into the AI chat workspace at `/` with no login wall, no landing
// page, and no redirects. Sidebar nav, top bar, and the active panel all live
// in this one view; switching between chat / tools / search / documents /
// activity is a client-side route change inside the same shell.
export const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_workspace",
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
