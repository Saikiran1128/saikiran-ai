import { createRoute } from "@tanstack/react-router";

import { ToolsMarketplace } from "@/components/tools/ToolsMarketplace";
import { dashboardLayoutRoute } from "./dashboard";

// Tools — full marketplace of curated client-side utilities.
export const toolsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/tools",
  component: ToolsPage,
});

function ToolsPage() {
  return <ToolsMarketplace />;
}
