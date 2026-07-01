import { createRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Clock,
  Globe,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useLogActivity,
  useLogSearch,
  useSearchHistory,
} from "@/hooks/useQueries";
import { useSession } from "@/lib/session";
import { dashboardLayoutRoute } from "./dashboard";

export const internetSearchRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/search",
  component: InternetSearchPage,
});

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

type ResultSource = "duckduckgo" | "simulated";

// ─────────────────────────────────────────────────────────────────────────
// Internet Search page
// ─────────────────────────────────────────────────────────────────────────

function InternetSearchPage() {
  const { sessionId } = useSession();
  const searchHistory = useSearchHistory(sessionId);
  const logSearch = useLogSearch(sessionId);
  const logActivity = useLogActivity(sessionId);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeQuery, setActiveQuery] = useState<string>("");
  const [resultSource, setResultSource] = useState<ResultSource | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (trimmed.length === 0) return;

      setIsSearching(true);
      setError(null);
      setHasSearched(true);
      setActiveQuery(trimmed);
      setResults([]);
      setResultSource(null);

      try {
        const { results: fetched, source } = await performSearch(trimmed);
        setResults(fetched);
        setResultSource(source);

        // Persist search history + activity log to the backend (best-effort).
        const count = BigInt(fetched.length);
        logSearch.mutate(
          { queryText: trimmed, resultCount: count },
          {
            onError: () => {
              /* non-fatal — history is best-effort */
            },
          },
        );
        logActivity.mutate(
          {
            activityType: "search",
            summary: `Searched the web for "${trimmed}"`,
            details: `Returned ${fetched.length} result${fetched.length === 1 ? "" : "s"} via ${source === "duckduckgo" ? "DuckDuckGo" : "simulated fallback"}.`,
          },
          {
            onError: () => {
              /* non-fatal */
            },
          },
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Search failed. Please try again.",
        );
        toast.error("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    },
    [logActivity, logSearch],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void runSearch(query);
    },
    [query, runSearch],
  );

  const handleHistoryClick = useCallback(
    (q: string) => {
      setQuery(q);
      void runSearch(q);
    },
    [runSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setActiveQuery("");
    setResultSource(null);
    setHasSearched(false);
    setError(null);
    inputRef.current?.focus();
  }, []);

  // Recent search history — dedupe + most recent first (backend returns
  // newest-first already, but we guard against ordering changes).
  const recentSearches = useMemo(() => {
    const records = searchHistory.data ?? [];
    const seen = new Set<string>();
    const out: { id: string; queryText: string }[] = [];
    for (const r of records) {
      const q = r.queryText;
      if (seen.has(q)) continue;
      seen.add(q);
      out.push({ id: r.id.toString(), queryText: q });
      if (out.length >= 8) break;
    }
    return out;
  }, [searchHistory.data]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        data-ocid="search.header.section"
      >
        <Card className="glass-strong relative overflow-hidden border-border/60 p-8 shadow-lg sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-10 h-48 w-48 rounded-full opacity-25 blur-3xl gradient-primary"
          />
          <div className="relative flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Internet Search
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Search the open web
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Query the web and get instant answers with cited sources. Every
              search is saved to your anonymous session history.
            </p>
          </div>
        </Card>
      </motion.section>

      {/* Search bar */}
      <section className="mt-8" data-ocid="search.input.section">
        <form onSubmit={handleSubmit} className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web…"
            className="h-12 rounded-xl border-border/70 bg-card pl-11 pr-24 text-base shadow-sm transition-smooth focus-visible:border-primary/50 focus-visible:ring-primary/30"
            aria-label="Search query"
            data-ocid="search.input"
            autoFocus
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            {query.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                aria-label="Clear search"
                data-ocid="search.clear_button"
              >
                <X className="size-4" aria-hidden />
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-9 gap-1.5"
              disabled={isSearching || query.trim().length === 0}
              data-ocid="search.submit_button"
            >
              {isSearching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Search className="size-4" aria-hidden />
              )}
              <span className="hidden sm:inline">
                {isSearching ? "Searching" : "Search"}
              </span>
            </Button>
          </div>
        </form>

        {/* Recent search history chips */}
        {recentSearches.length > 0 && (
          <div
            className="mt-4 flex flex-wrap items-center gap-2"
            data-ocid="search.history.section"
          >
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              Recent
            </span>
            {recentSearches.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleHistoryClick(item.queryText)}
                data-ocid={`search.history.item.${idx + 1}`}
                className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-foreground transition-smooth hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {item.queryText}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Results */}
      <section className="mt-8" data-ocid="search.results.section">
        {/* Source indicator */}
        {hasSearched && !isSearching && resultSource && results.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={
                resultSource === "simulated"
                  ? "gap-1 border-warning/30 bg-warning/10 text-warning-foreground"
                  : "gap-1 border-primary/20 bg-primary/10 text-primary"
              }
              data-ocid="search.source.badge"
            >
              {resultSource === "simulated" ? (
                <Sparkles className="size-3" aria-hidden />
              ) : (
                <Globe className="size-3" aria-hidden />
              )}
              {resultSource === "simulated"
                ? "Simulated results"
                : "DuckDuckGo Instant Answers"}
            </Badge>
            {resultSource === "simulated" && (
              <p className="text-xs text-muted-foreground">
                Live web results unavailable — showing curated fallback results.
              </p>
            )}
          </div>
        )}

        {/* Loading state */}
        {isSearching && (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16"
            data-ocid="search.loading_state"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Loader2 className="size-6 animate-spin" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">
              Searching the web for “{activeQuery}”…
            </p>
          </div>
        )}

        {/* Error state */}
        {!isSearching && error && (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 text-center"
            data-ocid="search.error_state"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
              <X className="size-6" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void runSearch(activeQuery)}
              data-ocid="search.retry_button"
            >
              Try again
            </Button>
          </div>
        )}

        {/* Empty results */}
        {!isSearching && !error && hasSearched && results.length === 0 && (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 text-center"
            data-ocid="search.empty_state"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 text-muted-foreground">
              <Search className="size-5" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">
              No results found for “{activeQuery}”. Try a different query.
            </p>
          </div>
        )}

        {/* Result list */}
        {!isSearching && !error && results.length > 0 && (
          <div className="space-y-3">
            {results.map((r, idx) => (
              <motion.div
                key={`${r.url}-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.06,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                data-ocid={`search.result.item.${idx + 1}`}
              >
                <Card className="group border-border/60 bg-card p-5 shadow-sm transition-smooth hover:border-primary/40 hover:shadow-md">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    data-ocid={`search.result.link.${idx + 1}`}
                    aria-label={`Open ${r.title} in a new tab`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Globe className="size-3 shrink-0" aria-hidden />
                          <span className="truncate">{r.source}</span>
                        </div>
                        <h3 className="mt-1.5 font-display text-base font-medium text-foreground transition-smooth group-hover:text-primary">
                          {r.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {r.snippet}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground transition-smooth group-hover:text-primary"
                        aria-hidden
                      />
                    </div>
                  </a>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Initial empty state — before any search */}
        {!hasSearched && !isSearching && (
          <div
            className="flex flex-col items-center justify-center gap-4 py-16 text-center"
            data-ocid="search.initial.empty_state"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg">
              <Globe className="size-8" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                Start searching
              </h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Enter a query above to search the web. Results appear here with
                titles, snippets, and source links.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Search execution
// ─────────────────────────────────────────────────────────────────────────

interface SearchOutcome {
  results: SearchResult[];
  source: ResultSource;
}

async function performSearch(query: string): Promise<SearchOutcome> {
  // Try the DuckDuckGo Instant Answer API first — it supports CORS from the
  // browser and returns structured abstract + related topics.
  try {
    const ddgResults = await searchDuckDuckGo(query);
    if (ddgResults.length > 0) {
      return { results: ddgResults, source: "duckduckgo" };
    }
  } catch {
    // Fall through to simulated results.
  }

  // Fallback: simulated results that look relevant to the query.
  const simulated = simulateResults(query);
  return { results: simulated, source: "simulated" };
}

interface DDGResponse {
  Heading?: string;
  AbstractText?: string;
  AbstractURL?: string;
  AbstractSource?: string;
  RelatedTopics?: Array<
    | { FirstURL?: string; Text?: string }
    | { Topics?: Array<{ FirstURL?: string; Text?: string }> }
  >;
  Results?: Array<{ FirstURL?: string; Text?: string }>;
}

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`DuckDuckGo API returned ${res.status}`);
  }
  const data = (await res.json()) as DDGResponse;
  const out: SearchResult[] = [];

  // Primary abstract answer.
  if (data.Heading && data.AbstractText && data.AbstractURL) {
    out.push({
      title: data.Heading,
      snippet: data.AbstractText,
      url: data.AbstractURL,
      source: data.AbstractSource ?? hostOf(data.AbstractURL),
    });
  }

  // Related topics (flattening nested groups).
  const topics = data.RelatedTopics ?? [];
  for (const topic of topics) {
    if (out.length >= 8) break;
    if ("Topics" in topic && Array.isArray(topic.Topics)) {
      for (const sub of topic.Topics) {
        if (out.length >= 8) break;
        const r = topicToResult(sub);
        if (r) out.push(r);
      }
    } else if ("FirstURL" in topic) {
      const r = topicToResult(topic);
      if (r) out.push(r);
    }
  }

  // Direct results section.
  for (const item of data.Results ?? []) {
    if (out.length >= 8) break;
    const r = topicToResult(item);
    if (r) out.push(r);
  }

  return out;
}

function topicToResult(topic: {
  FirstURL?: string;
  Text?: string;
}): SearchResult | null {
  if (!topic.FirstURL || !topic.Text) return null;
  // DDG "Text" is typically "Title — Snippet" or just a snippet.
  const text = topic.Text;
  const dashIdx = text.indexOf(" - ");
  let title: string;
  let snippet: string;
  if (dashIdx > 0 && dashIdx < 80) {
    title = text.slice(0, dashIdx).trim();
    snippet = text.slice(dashIdx + 3).trim();
  } else {
    title = text.split(".")[0].slice(0, 100).trim() || text.slice(0, 100);
    snippet = text;
  }
  return {
    title: title || hostOf(topic.FirstURL),
    snippet: snippet || title,
    url: topic.FirstURL,
    source: hostOf(topic.FirstURL),
  };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Simulated fallback — generates relevant-looking results when live web
// search is unavailable (CORS, network, or empty DDG response).
// ─────────────────────────────────────────────────────────────────────────

function simulateResults(query: string): SearchResult[] {
  const q = query.trim();
  const host = "example.com";
  const base: SearchResult[] = [
    {
      title: `${capitalize(q)} — Overview & Key Facts`,
      snippet: `A comprehensive overview of ${q}, covering the core concepts, history, and practical applications. This reference page summarizes the most cited information on the topic.`,
      url: `https://${host}/${slugify(q)}/overview`,
      source: host,
    },
    {
      title: `Everything you need to know about ${q}`,
      snippet: `An in-depth guide to ${q} with examples, common pitfalls, and best practices. Frequently updated and reviewed by community contributors.`,
      url: `https://guide.${host}/${slugify(q)}`,
      source: `guide.${host}`,
    },
    {
      title: `${capitalize(q)} explained simply`,
      snippet: `A beginner-friendly explanation of ${q}. Breaks down the essentials into clear, approachable language with helpful diagrams and analogies.`,
      url: `https://wiki.${host}/wiki/${slugify(q)}`,
      source: `wiki.${host}`,
    },
    {
      title: `Latest discussions on ${q}`,
      snippet: `Community threads and Q&A about ${q}. See how practitioners approach real-world problems, share tips, and answer common questions.`,
      url: `https://news.${host}/topic/${slugify(q)}`,
      source: `news.${host}`,
    },
    {
      title: `${capitalize(q)}: research and references`,
      snippet: `Curated academic and technical references on ${q}, including papers, specifications, and authoritative documentation.`,
      url: `https://docs.${host}/reference/${slugify(q)}`,
      source: `docs.${host}`,
    },
  ];
  return base;
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
