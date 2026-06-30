import { Sparkles } from "lucide-react";

const FOOTER_LINKS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Guides", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

/**
 * Landing footer — glassmorphic, four-column link grid, branding line.
 */
export function LandingFooter() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "nexus.ai",
  )}`;

  return (
    <footer className="glass-strong border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <a
              href="#top"
              className="flex items-center gap-2.5"
              aria-label="Nexus AI home"
            >
              <span className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-sm">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                Nexus AI
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              One AI platform for chat, documents, search, knowledge, and
              tools—beautifully unified.
            </p>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      data-ocid={`landing.footer_link.${column.title.toLowerCase()}.${link.label.toLowerCase()}`}
                      className="text-sm text-muted-foreground transition-smooth hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with love using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground transition-smooth hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with care for thinkers, builders, and doers.
          </p>
        </div>
      </div>
    </footer>
  );
}
