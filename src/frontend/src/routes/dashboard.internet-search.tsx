import { createRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";

import { ComingSoonPage } from "@/components/layout/ComingSoonPage";
import { dashboardLayoutRoute } from "./dashboard";

export const internetSearchRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/internet-search",
  component: InternetSearchPage,
});

function InternetSearchPage() {
  return (
    <ComingSoonPage
      title="Internet Search"
      description="Search the web and get AI-summarized answers with cited sources."
      icon={Globe}
    />
  );
}
