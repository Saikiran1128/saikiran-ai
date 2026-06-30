import { createRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { ComingSoonPage } from "@/components/layout/ComingSoonPage";
import { dashboardLayoutRoute } from "./dashboard";

export const knowledgeBaseRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/knowledge-base",
  component: KnowledgeBasePage,
});

function KnowledgeBasePage() {
  return (
    <ComingSoonPage
      title="Knowledge Base"
      description="Build a private, queryable knowledge layer with folders, tags, and AI answers."
      icon={BookOpen}
    />
  );
}
