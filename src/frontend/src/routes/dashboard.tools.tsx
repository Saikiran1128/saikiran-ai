import { createRoute } from "@tanstack/react-router";

import { ToolsMarketplace } from "@/components/tools/ToolsMarketplace";
import { dashboardLayoutRoute } from "./dashboard";

// Tools — full marketplace of curated client-side utilities.
export const toolsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/tools",
  component: ToolsPage,
});
// Note: route path is "/tools" (flat, root-level under the workspace layout).

function ToolsPage() {
  return <ToolsMarketplace />;
}
