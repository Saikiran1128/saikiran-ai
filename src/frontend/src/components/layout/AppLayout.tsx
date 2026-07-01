import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  FileText,
  Globe,
  Menu,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
  ocid: string;
}

// Single-page workspace nav — exactly five panels, flat root-level paths.
// AI Chat is the index route (`/`); the rest are siblings. No auth, no
// Knowledge Base, no YouTube, no Admin, no Settings, no Workspace.
const NAV_ITEMS: NavItem[] = [
  { label: "AI Chat", icon: Bot, to: "/", ocid: "nav.ai_chat.link" },
  { label: "Tools", icon: Wrench, to: "/tools", ocid: "nav.tools.link" },
  {
    label: "Internet Search",
    icon: Globe,
    to: "/search",
    ocid: "nav.internet_search.link",
  },
  {
    label: "Documents",
    icon: FileText,
    to: "/documents",
    ocid: "nav.documents.link",
  },
  {
    label: "Activity Log",
    icon: Activity,
    to: "/activity",
    ocid: "nav.activity.link",
  },
];

export interface AppLayoutProps {
  children?: React.ReactNode;
}

// Workspace shell — sidebar nav + top bar + content area.
// Uses glassmorphism, semantic tokens, and Framer Motion transitions.
// No auth dependencies: the app opens directly into the workspace.
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, ready } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flat-path active logic: the index route ("/") is active only when the
  // pathname is exactly "/"; every other item is active on a startsWith match.
  function isActive(to: string): boolean {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  }

  // Truncated session id for the anonymous-session indicator.
  const sessionLabel = ready && sessionId ? `${sessionId.slice(0, 8)}…` : "—";

  const SidebarContent = (
    <nav className="flex h-full flex-col gap-1 p-3" aria-label="Primary">
      <div className="flex items-center gap-2 px-3 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="size-4" aria-hidden />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Nexus AI
        </span>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to);
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate({ to: item.to })}
              aria-current={active ? "page" : undefined}
              data-ocid={item.ocid}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth ${
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <item.icon
                className={`size-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                aria-hidden
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Anonymous session indicator — per-browser workspace isolation. */}
      <div className="mt-2 border-t border-border p-3">
        <div
          className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2"
          data-ocid="nav.session.panel"
        >
          <span className="relative flex size-2 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              Session active
            </p>
            <p
              className="truncate font-mono text-[11px] text-muted-foreground"
              data-ocid="nav.session.id"
            >
              {sessionLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Caffeine attribution — subtle, unobtrusive footer. */}
      <div className="px-4 pb-4 pt-1">
        <a
          href="https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=nexus-ai"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] leading-relaxed text-muted-foreground/60 transition-smooth hover:text-muted-foreground"
          data-ocid="nav.attribution.link"
        >
          Built with caffeine.ai
        </a>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/60 backdrop-blur md:block">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileOpen(false);
            }}
            role="button"
            tabIndex={-1}
            aria-label="Close navigation"
            aria-hidden
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card shadow-xl"
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              data-ocid="nav.close_button"
            >
              <X className="size-4" aria-hidden />
            </button>
            {SidebarContent}
          </motion.aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/70 px-4 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            data-ocid="nav.open_button"
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-medium text-foreground">
              {currentSectionLabel(location.pathname)}
            </p>
          </div>
        </header>

        <main className="flex-1 bg-background">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}

function currentSectionLabel(pathname: string): string {
  const match = NAV_ITEMS.find((item) =>
    item.to === "/"
      ? pathname === "/"
      : pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
  return match?.label ?? "Workspace";
}
