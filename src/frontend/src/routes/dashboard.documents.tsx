import { createRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { ComingSoonPage } from "@/components/layout/ComingSoonPage";
import { dashboardLayoutRoute } from "./dashboard";

export const documentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/documents",
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <ComingSoonPage
      title="Documents"
      description="Upload, organize, and analyze your documents with AI-powered extraction and insights."
      icon={FileText}
    />
  );
}
