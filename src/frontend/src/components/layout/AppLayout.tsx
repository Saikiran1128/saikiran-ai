import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  FileText,
  FolderOpen,
  Globe,
  Home,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: Home, to: "/dashboard", ocid: "nav.home.link" },
  {
    label: "AI Chat",
    icon: Bot,
    to: "/dashboard/ai-chat",
    ocid: "nav.ai_chat.link",
  },
  {
    label: "Documents",
    icon: FileText,
    to: "/dashboard/documents",
    ocid: "nav.documents.link",
  },
  {
    label: "Workspace",
    icon: FolderOpen,
    to: "/dashboard/workspace",
    ocid: "nav.workspace.link",
  },
  {
    label: "Internet Search",
    icon: Globe,
    to: "/dashboard/internet-search",
    ocid: "nav.internet_search.link",
  },
  {
    label: "YouTube",
    icon: Youtube,
    to: "/dashboard/youtube",
    ocid: "nav.youtube.link",
  },
  {
    label: "Knowledge Base",
    icon: BookOpen,
    to: "/dashboard/knowledge-base",
    ocid: "nav.knowledge_base.link",
  },
  {
    label: "Tools",
    icon: Wrench,
    to: "/dashboard/tools",
    ocid: "nav.tools.link",
  },
  {
    label: "Settings",
    icon: Settings,
    to: "/dashboard/settings",
    ocid: "nav.settings.link",
  },
  {
    label: "Admin",
    icon: ShieldCheck,
    to: "/dashboard/admin",
    ocid: "nav.admin.link",
  },
];

export interface AppLayoutProps {
  children?: React.ReactNode;
}

// Dashboard layout wrapper — sidebar nav + top bar + content area.
// Uses glassmorphism, semantic tokens, and Framer Motion transitions.
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isActive(to: string): boolean {
    if (to === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(to);
  }

  function handleLogout() {
    logout();
    navigate({ to: "/login", replace: true });
  }

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

      <div className="mt-2 border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {(user?.name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {user?.name ?? "User"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.email || "Signed in"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
          data-ocid="nav.logout.button"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
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
    item.to === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.to),
  );
  return match?.label ?? "Dashboard";
}
