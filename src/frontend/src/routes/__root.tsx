import { Outlet, createRootRoute } from "@tanstack/react-router";

// Root route — renders the matched child route via Outlet.
// Code-based routing: the router tree is assembled in App.tsx.
export const Route = createRootRoute({
  component: RootComponent,
});

// Alias for code-based routing consumers that import `rootRoute`.
export const rootRoute = Route;

function RootComponent() {
  return <Outlet />;
}
