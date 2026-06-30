import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  FileText,
  FolderKanban,
  Globe,
  Home,
  type LucideIcon,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Shield,
  Wrench,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface NavEntry {
  label: string;
  to: string;
  icon: LucideIcon;
  marker: string;
}

const NAV_ENTRIES: NavEntry[] = [
  { label: "Home", to: "/", icon: Home, marker: "home" },
  { label: "AI Chat", to: "/chat", icon: MessageSquare, marker: "ai_chat" },
  { label: "Documents", to: "/documents", icon: FileText, marker: "documents" },
  {
    label: "Workspace",
    to: "/workspace",
    icon: FolderKanban,
    marker: "workspace",
  },
  {
    label: "Internet Search",
    to: "/search",
    icon: Globe,
    marker: "internet_search",
  },
  { label: "YouTube", to: "/youtube", icon: Youtube, marker: "youtube" },
  {
    label: "Knowledge Base",
    to: "/knowledge",
    icon: BookOpen,
    marker: "knowledge_base",
  },
  { label: "Tools", to: "/tools", icon: Wrench, marker: "tools" },
  { label: "Settings", to: "/settings", icon: Settings, marker: "settings" },
  { label: "Admin", to: "/admin", icon: Shield, marker: "admin" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
      data-ocid="sidebar.panel"
    >
      <div className="flex items-center gap-2 px-3 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="size-9 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          data-ocid="sidebar.toggle"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <div className="px-3 pb-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="w-full gradient-primary text-primary-foreground shadow-md hover:opacity-90"
                aria-label="New Chat"
                data-ocid="sidebar.new_chat_button"
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New Chat</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            className="w-full justify-start gap-2 gradient-primary text-primary-foreground shadow-md hover:opacity-90"
            data-ocid="sidebar.new_chat_button"
          >
            <Plus className="size-4" />
            New Chat
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Primary">
        <ul className="flex flex-col gap-1">
          {NAV_ENTRIES.map((entry) => {
            const isActive =
              currentPath === entry.to ||
              (entry.to !== "/" && currentPath.startsWith(entry.to));
            const Icon = entry.icon;

            const link = (
              <Link
                to={entry.to}
                onClick={onNavigate}
                aria-label={entry.label}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-smooth outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0",
                )}
                data-ocid={`sidebar.${entry.marker}.link`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full gradient-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                  )}
                />
                {!collapsed && <span className="truncate">{entry.label}</span>}
              </Link>
            );

            return (
              <li key={entry.to}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{entry.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        {!collapsed && (
          <p className="px-2 text-[11px] leading-relaxed text-sidebar-foreground/40">
            © {new Date().getFullYear()} · Built with caffeine.ai
          </p>
        )}
      </div>
    </aside>
  );
}
