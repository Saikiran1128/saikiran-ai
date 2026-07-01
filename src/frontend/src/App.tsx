import { RouterProvider, createRouter } from "@tanstack/react-router";

import { rootRoute } from "./routes/__root";
import { dashboardLayoutRoute } from "./routes/dashboard";
import { activityRoute } from "./routes/dashboard.activity";
import { aiChatRoute } from "./routes/dashboard.ai-chat";
import { documentsRoute } from "./routes/dashboard.documents";
import { internetSearchRoute } from "./routes/dashboard.internet-search";
import { toolsRoute } from "./routes/dashboard.tools";

// Route tree — single-page workspace shell with flat root-level routes.
//
// The workspace layout (`_workspace`) is the only top-level route group. It
// renders the sidebar + top bar + active panel. AI chat is the index route
// (`/`), so the app opens directly into the chat workspace. There is no
// landing page, no /login route, and no auth redirect — everything works on
// load. Knowledge base and YouTube routes are intentionally absent (deferred).
const workspaceTree = dashboardLayoutRoute.addChildren([
  aiChatRoute,
  toolsRoute,
  internetSearchRoute,
  documentsRoute,
  activityRoute,
]);

const routeTree = rootRoute.addChildren([workspaceTree]);

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

export { router };
