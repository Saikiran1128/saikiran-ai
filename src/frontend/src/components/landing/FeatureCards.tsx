import {
  BarChart3,
  BookOpen,
  FileCog,
  FileText,
  Globe,
  type LucideIcon,
  MessageSquare,
  ShieldCheck,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    description:
      "Converse with a capable assistant that drafts, summarizes, and reasons across your work.",
  },
  {
    icon: FileText,
    title: "Document AI",
    description:
      "Upload documents and ask questions in plain language with grounded, cited answers.",
  },
  {
    icon: Globe,
    title: "Internet Search",
    description:
      "Browse the live web and get concise, source-backed answers to any question.",
  },
  {
    icon: Youtube,
    title: "YouTube Search",
    description:
      "Find videos by topic, surface key moments, and pull transcripts straight into your chat.",
  },
  {
    icon: FileCog,
    title: "File Converter",
    description:
      "Convert between formats—PDFs, images, documents—in a single click, right in your browser.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "Organize notes, docs, and references into a searchable library your AI can read.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track usage, costs, and engagement with clear dashboards built for decision-making.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Dashboard",
    description:
      "Manage users, roles, and permissions with enterprise-grade controls and audit logs.",
  },
];

/**
 * Responsive grid of 8 feature cards with staggered entrance animations.
 * Each card uses glassmorphism and a hover lift + icon glow.
 */
export function FeatureCards() {
  return (
    <section
      id="features"
      className="relative scroll-mt-20 border-t border-border/40 bg-muted/30 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
            Everything in one place
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Eight tools. One workspace.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Stop juggling tabs. Nexus AI brings the tools you use every day into
            a single, beautifully unified experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      data-ocid={`landing.feature_card.${index + 1}`}
    >
      <Card className="glass group h-full gap-0 py-6 transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
        <CardHeader className="gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm transition-smooth group-hover:scale-110 group-hover:border-primary/40 group-hover:bg-primary/15">
            <Icon className="size-6" aria-hidden />
          </span>
          <CardTitle className="font-display text-lg font-semibold tracking-tight">
            {feature.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
