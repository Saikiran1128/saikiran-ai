import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  Bot,
  FileText,
  FolderOpen,
  Globe,
  Settings,
  Sparkles,
  Wrench,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { dashboardLayoutRoute } from "./dashboard";

// Dashboard home — welcome card + quick action grid.
export const dashboardHomeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/",
  component: DashboardHome,
});

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  ocid: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "AI Chat",
    description: "Converse with multiple AI models in one place.",
    icon: Bot,
    to: "/dashboard/ai-chat",
    ocid: "dashboard.home.card.ai_chat",
  },
  {
    title: "Tools",
    description: "A curated suite of AI-powered utilities.",
    icon: Wrench,
    to: "/dashboard/tools",
    ocid: "dashboard.home.card.tools",
  },
  {
    title: "Documents",
    description: "Organize and analyze your documents.",
    icon: FileText,
    to: "/dashboard/documents",
    ocid: "dashboard.home.card.documents",
  },
  {
    title: "Workspace",
    description: "Your projects, notes, and bookmarks.",
    icon: FolderOpen,
    to: "/dashboard/workspace",
    ocid: "dashboard.home.card.workspace",
  },
  {
    title: "Internet Search",
    description: "Search the web with AI summaries.",
    icon: Globe,
    to: "/dashboard/internet-search",
    ocid: "dashboard.home.card.internet_search",
  },
  {
    title: "YouTube Search",
    description: "Find videos with AI-curated results.",
    icon: Youtube,
    to: "/dashboard/youtube",
    ocid: "dashboard.home.card.youtube",
  },
  {
    title: "Knowledge Base",
    description: "Your private, queryable knowledge layer.",
    icon: Sparkles,
    to: "/dashboard/knowledge-base",
    ocid: "dashboard.home.card.knowledge_base",
  },
  {
    title: "Settings",
    description: "Manage your account and preferences.",
    icon: Settings,
    to: "/dashboard/settings",
    ocid: "dashboard.home.card.settings",
  },
];

function DashboardHome() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        data-ocid="dashboard.home.welcome.section"
      >
        <Card className="glass-strong relative overflow-hidden border-border/60 p-8 shadow-lg sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-10 h-48 w-48 rounded-full opacity-25 blur-3xl gradient-primary"
          />
          <div className="relative flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dashboard
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Your unified AI workspace is ready. Pick a quick action below to
              get started.
            </p>
          </div>
        </Card>
      </motion.section>

      <section
        className="mt-8"
        data-ocid="dashboard.home.quick_actions.section"
      >
        <h2 className="mb-4 font-display text-lg font-medium text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action, index) => (
            <motion.button
              key={action.title}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.05 * index,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -3 }}
              className="text-left"
              onClick={() => navigate({ to: action.to })}
              data-ocid={action.ocid}
            >
              <Card className="group h-full border-border/60 bg-card p-5 shadow-sm transition-smooth hover:border-primary/40 hover:shadow-md">
                <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-smooth group-hover:scale-105">
                  <action.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-base font-medium text-foreground">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {action.description}
                </p>
              </Card>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
