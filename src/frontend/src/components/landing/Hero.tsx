import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Hero section — large display headline, decorative search bar, dual CTAs.
 * Search bar is decorative: submit routes to /login.
 * "Learn More" smooth-scrolls to the feature cards section.
 */
export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/login" });
  };

  const scrollToFeatures = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6 lg:px-8"
    >
      {/* Ambient gradient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl gradient-primary"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl gradient-accent"
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-7"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Badge
            variant="outline"
            className="glass gap-1.5 border-primary/20 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            Introducing Nexus AI 2.0
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        >
          One AI Platform for{" "}
          <span className="text-gradient-primary">Everything.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Search documents, chat with AI, browse the internet, search YouTube,
          convert files, generate code, and manage knowledge—all from one place.
        </motion.p>

        {/* Decorative search bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="glass-strong w-full max-w-2xl rounded-2xl border border-border/60 p-1.5 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Search
              className="ml-3 size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything, search everything…"
              aria-label="Search the platform"
              data-ocid="landing.search_input"
              className="h-12 flex-1 border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="lg"
              data-ocid="landing.search_submit"
              className="h-12 rounded-xl px-5"
            >
              Search
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 pt-1"
        >
          <Button
            size="lg"
            data-ocid="landing.get_started_button"
            onClick={() => navigate({ to: "/login" })}
            className="h-12 rounded-xl px-6 text-base"
          >
            Get Started
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button
            size="lg"
            variant="outline"
            data-ocid="landing.learn_more_button"
            onClick={scrollToFeatures}
            className="h-12 rounded-xl px-6 text-base"
          >
            Learn More
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
