import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
}: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
        data-ocid="coming_soon.section"
      >
        <Card className="glass-strong relative overflow-hidden border-border/60 p-10 text-center shadow-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-30 blur-3xl gradient-primary"
          />
          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.15,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex size-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg"
            >
              <Icon className="size-9" aria-hidden />
            </motion.div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            <Badge
              variant="secondary"
              className="gap-1.5 border-primary/20 bg-primary/10 px-3 py-1 text-primary"
              data-ocid="coming_soon.badge"
            >
              <Sparkles className="size-3" aria-hidden />
              Coming Soon
            </Badge>

            <p className="text-xs text-muted-foreground">
              We&apos;re crafting this experience with care. Stay tuned.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
