import { createRoute } from "@tanstack/react-router";
import { Youtube } from "lucide-react";

import { ComingSoonPage } from "@/components/layout/ComingSoonPage";
import { dashboardLayoutRoute } from "./dashboard";

export const youtubeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/youtube",
  component: YoutubePage,
});

function YoutubePage() {
  return (
    <ComingSoonPage
      title="YouTube Search"
      description="Discover videos with AI-curated results, metadata, and quick playback."
      icon={Youtube}
    />
  );
}
