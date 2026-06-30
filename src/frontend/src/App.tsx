import { RouterProvider, createRouter } from "@tanstack/react-router";

import { rootRoute } from "./routes/__root";
import { dashboardLayoutRoute } from "./routes/dashboard";
import { adminRoute } from "./routes/dashboard.admin";
import { aiChatRoute } from "./routes/dashboard.ai-chat";
import { documentsRoute } from "./routes/dashboard.documents";
import { dashboardHomeRoute } from "./routes/dashboard.home";
import { internetSearchRoute } from "./routes/dashboard.internet-search";
import { knowledgeBaseRoute } from "./routes/dashboard.knowledge-base";
import { settingsRoute } from "./routes/dashboard.settings";
import { toolsRoute } from "./routes/dashboard.tools";
import { workspaceRoute } from "./routes/dashboard.workspace";
import { youtubeRoute } from "./routes/dashboard.youtube";
import { landingRoute } from "./routes/index";
import { loginRoute } from "./routes/login";

// Build the route tree. Dashboard is a layout route with nested children.
const dashboardTree = dashboardLayoutRoute.addChildren([
  dashboardHomeRoute,
  aiChatRoute,
  toolsRoute,
  documentsRoute,
  workspaceRoute,
  internetSearchRoute,
  youtubeRoute,
  knowledgeBaseRoute,
  settingsRoute,
  adminRoute,
]);

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  dashboardTree,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
