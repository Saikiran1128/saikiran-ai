import { Moon, Sparkles, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * Premium landing header — glassmorphic, sticky, with logo + theme toggle.
 * Uses .glass-strong utility from the Aurora Editorial design system.
 */
export function LandingHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong sticky top-0 z-50 w-full border-b border-border/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          data-ocid="landing.logo_link"
          className="group flex items-center gap-2.5"
          aria-label="Nexus AI home"
        >
          <span className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-sm transition-smooth group-hover:scale-105 group-hover:border-primary/50">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Nexus AI
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "Tools", href: "#tools" },
            { label: "Pricing", href: "#pricing" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              data-ocid={`landing.nav_link.${item.label.toLowerCase()}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            data-ocid="landing.theme_toggle"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun className="size-5" aria-hidden />
            ) : (
              <Moon className="size-5" aria-hidden />
            )}
          </Button>
          <Button
            size="sm"
            data-ocid="landing.sign_in_button"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Sign In
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
