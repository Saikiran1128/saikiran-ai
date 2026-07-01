import { createRoute } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  ChevronDown,
  ChevronRight,
  FileText,
  Globe,
  History,
  Search,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useActivity,
  useClearActivity,
  useSearchHistory,
  useToolUsage,
} from "@/hooks/useQueries";
import { useSession } from "@/lib/session";
import { dashboardLayoutRoute } from "./dashboard";

export const activityRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/activity",
  component: ActivityPage,
});

// ─────────────────────────────────────────────────────────────────────────
// Activity Log — every chat, tool run, search, and document edit in the
// anonymous per-browser session, saved and browsable. No login, no shared
// global workspace: data is scoped to this browser's session id.
// ─────────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "chat" | "tool" | "search" | "document";

interface TypeMeta {
  label: string;
  icon: LucideIcon;
  // Tailwind classes for the icon chip + badge — semantic, no raw palette.
  chip: string;
  badge: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  chat: {
    label: "Chat",
    icon: Bot,
    chip: "border-primary/30 bg-primary/10 text-primary",
    badge: "border-primary/20 bg-primary/10 text-primary",
  },
  tool: {
    label: "Tool",
    icon: Wrench,
    chip: "border-success/30 bg-success/10 text-success",
    badge: "border-success/20 bg-success/10 text-success",
  },
  search: {
    label: "Search",
    icon: Search,
    chip: "border-warning/30 bg-warning/15 text-warning",
    badge: "border-warning/30 bg-warning/15 text-warning",
  },
  document: {
    label: "Document",
    icon: FileText,
    chip: "border-accent/30 bg-accent/10 text-accent",
    badge: "border-accent/30 bg-accent/10 text-accent",
  },
};

function metaFor(type: string): TypeMeta {
  return (
    TYPE_META[type.toLowerCase()] ?? {
      label: type || "Activity",
      icon: Activity,
      chip: "border-border bg-muted/60 text-muted-foreground",
      badge: "border-border bg-muted/60 text-muted-foreground",
    }
  );
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "—";
  const now = Date.now();
  const diff = now - ts;
  const sameDay = date.toDateString() === new Date(now).toDateString();
  if (sameDay) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityPage() {
  const { sessionId, ready: sessionReady } = useSession();
  const activity = useActivity(sessionId);
  const toolUsage = useToolUsage(sessionId);
  const searchHistory = useSearchHistory(sessionId);
  const clearActivity = useClearActivity(sessionId);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const loading =
    !sessionReady ||
    activity.isLoading ||
    toolUsage.isLoading ||
    searchHistory.isLoading;

  const entries = activity.data ?? [];
  const tools = toolUsage.data ?? [];
  const searches = searchHistory.data ?? [];

  // Most recent first.
  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedEntries.filter((e) => {
      if (filter !== "all" && e.activityType.toLowerCase() !== filter) {
        return false;
      }
      if (!q) return true;
      return (
        e.summary.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.activityType.toLowerCase().includes(q)
      );
    });
  }, [sortedEntries, filter, query]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: sortedEntries.length,
      chat: 0,
      tool: 0,
      search: 0,
      document: 0,
    };
    for (const e of sortedEntries) {
      const k = e.activityType.toLowerCase() as FilterKey;
      if (k in c) c[k] += 1;
    }
    return c;
  }, [sortedEntries]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleClear() {
    clearActivity.mutate(undefined, {
      onSuccess: () => {
        toast.success("Activity history cleared");
        setExpanded(new Set());
      },
      onError: () => toast.error("Couldn't clear activity history"),
    });
  }

  const sessionLabel =
    sessionReady && sessionId
      ? `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`
      : "—";
  const hasAny =
    sortedEntries.length > 0 || tools.length > 0 || searches.length > 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex flex-col gap-1"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Activity className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Activity Log
            </h1>
            <p className="text-sm text-muted-foreground">
              Every chat, tool run, search, and document edit in your session.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Session info card */}
      <Card
        className="glass mb-5 border-border/60 p-4"
        data-ocid="activity.session.card"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success">
              <ShieldCheck className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Anonymous session
              </p>
              <p
                className="truncate font-mono text-xs text-muted-foreground"
                data-ocid="activity.session.id"
              >
                {sessionLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-display text-2xl font-semibold text-foreground">
                {sortedEntries.length}
              </p>
              <p className="text-xs text-muted-foreground">activities</p>
            </div>
            <div className="hidden h-10 w-px bg-border sm:block" />
            <div className="hidden text-right sm:block">
              <p className="font-display text-2xl font-semibold text-foreground">
                {tools.length + searches.length}
              </p>
              <p className="text-xs text-muted-foreground">
                tools &amp; searches
              </p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Data is scoped to this browser only — no account, no shared workspace.
        </p>
      </Card>

      {/* Controls: filter tabs + search + clear */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterKey)}
          className="w-full sm:w-auto"
        >
          <TabsList
            className="flex w-full flex-wrap sm:w-auto"
            data-ocid="activity.filter.tabs"
          >
            <TabsTrigger value="all" data-ocid="activity.filter.tab.all">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="chat" data-ocid="activity.filter.tab.chat">
              Chat ({counts.chat})
            </TabsTrigger>
            <TabsTrigger value="tool" data-ocid="activity.filter.tab.tool">
              Tool ({counts.tool})
            </TabsTrigger>
            <TabsTrigger value="search" data-ocid="activity.filter.tab.search">
              Search ({counts.search})
            </TabsTrigger>
            <TabsTrigger
              value="document"
              data-ocid="activity.filter.tab.document"
            >
              Document ({counts.document})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity…"
              className="pl-8"
              aria-label="Search activity"
              data-ocid="activity.search_input"
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={!hasAny || clearActivity.isPending}
                data-ocid="activity.clear_button"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Clear all</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="activity.clear_dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all activity?</AlertDialogTitle>
                <AlertDialogDescription>
                  This wipes every chat, tool, search, and document entry from
                  this browser&apos;s session. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="activity.clear.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClear}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-ocid="activity.clear.confirm_button"
                >
                  Clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <ActivitySkeleton />
      ) : filtered.length === 0 &&
        tools.length === 0 &&
        searches.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Unified activity feed */}
          <section data-ocid="activity.feed.section">
            <SectionLabel icon={Activity} text="Activity feed" />
            {filtered.length === 0 ? (
              <p
                className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground"
                data-ocid="activity.feed.empty_state"
              >
                No entries match your filter or search.
              </p>
            ) : (
              <ul className="space-y-2" data-ocid="activity.feed.list">
                {filtered.map((entry, idx) => {
                  const meta = metaFor(entry.activityType);
                  const id = `a-${entry.id.toString()}`;
                  const isOpen = expanded.has(id);
                  const hasDetails = entry.details.trim().length > 0;
                  return (
                    <li key={id} data-ocid={`activity.item.${idx + 1}`}>
                      <Card className="glass border-border/60 p-0 transition-smooth hover:border-primary/30">
                        <button
                          type="button"
                          onClick={() => hasDetails && toggleExpand(id)}
                          disabled={!hasDetails}
                          aria-expanded={isOpen}
                          className="flex w-full items-start gap-3 p-3 text-left disabled:cursor-default"
                          data-ocid={`activity.row.${idx + 1}`}
                        >
                          <div
                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border ${meta.chip}`}
                          >
                            <meta.icon className="size-4" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={meta.badge}
                                data-ocid={`activity.type_badge.${idx + 1}`}
                              >
                                {meta.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(Number(entry.timestamp))}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-foreground break-words">
                              {entry.summary}
                            </p>
                          </div>
                          {hasDetails && (
                            <ChevronDown
                              className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              aria-hidden
                            />
                          )}
                        </button>
                        {hasDetails && isOpen && (
                          <div className="border-t border-border/60 px-3 py-2.5 pl-14">
                            <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground break-words">
                              {entry.details}
                            </p>
                          </div>
                        )}
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Tool usage history */}
          {tools.length > 0 && (
            <CollapsibleSection
              title="Tool usage history"
              icon={Wrench}
              count={tools.length}
              ocid="activity.tools"
            >
              <ul className="space-y-2">
                {[...tools]
                  .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                  .map((t, idx) => (
                    <li
                      key={`t-${t.id.toString()}`}
                      data-ocid={`activity.tools.item.${idx + 1}`}
                    >
                      <Card className="glass border-border/60 p-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success">
                            <Wrench className="size-4" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-success/20 bg-success/10 text-success"
                              >
                                {t.toolName}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(Number(t.timestamp))}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-foreground break-words">
                              {t.inputSummary}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground break-words">
                              {t.outputSummary}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </li>
                  ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* Search history */}
          {searches.length > 0 && (
            <CollapsibleSection
              title="Search history"
              icon={Globe}
              count={searches.length}
              ocid="activity.searches"
            >
              <ul className="space-y-2">
                {[...searches]
                  .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                  .map((s, idx) => (
                    <li
                      key={`s-${s.id.toString()}`}
                      data-ocid={`activity.searches.item.${idx + 1}`}
                    >
                      <Card className="glass border-border/60 p-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-warning/30 bg-warning/15 text-warning">
                            <Search className="size-4" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-warning/30 bg-warning/15 text-warning"
                              >
                                {s.resultCount.toString()} results
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(Number(s.timestamp))}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-foreground break-words">
                              {s.queryText}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </li>
                  ))}
              </ul>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  text,
}: { icon: LucideIcon; text: string }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      <Icon className="size-3.5" aria-hidden />
      {text}
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  count,
  ocid,
  children,
}: {
  title: string;
  icon: LucideIcon;
  count: number;
  ocid: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2.5 text-left transition-smooth hover:bg-card"
          data-ocid={`${ocid}.toggle`}
        >
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          <span className="flex-1 text-sm font-medium text-foreground">
            {title}
          </span>
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {count}
          </Badge>
          {open ? (
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronRight
              className="size-4 text-muted-foreground"
              aria-hidden
            />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2" data-ocid={`${ocid}.panel`}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center"
      data-ocid="activity.empty_state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
        <History className="size-7" aria-hidden />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
        No activity yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Start chatting, using tools, or searching to see your history here.
        Everything is saved to this browser&apos;s anonymous session.
      </p>
    </motion.div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-2" data-ocid="activity.loading_state">
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
        <Card key={i} className="glass border-border/60 p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
