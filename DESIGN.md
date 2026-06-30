# Design Brief

## Direction

Aurora Editorial — Apple-inspired minimal productivity platform with editorial serif display, warm-neutral surfaces, and a restrained indigo-violet accent system.

## Tone

Refined editorial minimalism with glassmorphism — calm, confident, premium; rejects the AI cliché of purple gradients everywhere in favor of one disciplined indigo accent on warm-neutral canvas.

## Differentiation

Editorial serif (Fraunces) display against clean sans body creates a literary-meets-technical tension that distinguishes this from generic SaaS blue dashboards.

## Color Palette

| Token      | OKLCH (light / dark)        | Role                              |
| ---------- | --------------------------- | --------------------------------- |
| background | 0.985 0.004 260 / 0.145 0.014 260 | app canvas, warm-neutral ink      |
| foreground | 0.16 0.012 265 / 0.95 0.008 260   | primary text                      |
| card       | 1.0 0 0 / 0.185 0.016 260         | elevated surfaces, glassmorphism   |
| primary    | 0.45 0.2 268 / 0.62 0.18 268      | deep indigo-violet, CTAs + active  |
| accent     | 0.68 0.16 25 / 0.7 0.16 25        | warm coral, highlights + badges    |
| muted      | 0.96 0.006 260 / 0.22 0.018 260   | secondary surfaces, chat bubbles   |

## Typography

- Display: Fraunces — hero headlines, section headings, logo wordmark
- Body: General Sans — UI labels, paragraphs, sidebar, buttons
- Mono: JetBrains Mono — code blocks, technical labels, timestamps
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Glassmorphism layering — translucent cards (backdrop-blur 12-20px) with 1px subtle borders; soft elevated shadows on cards/popovers, no shadows on flat surfaces; depth through layering not heavy drop-shadows.

## Structural Zones

| Zone    | Background                  | Border               | Notes                                    |
| ------- | --------------------------- | -------------------- | ---------------------------------------- |
| Header  | `glass-strong` translucent  | `border-b`           | sticky, logo + search + theme toggle     |
| Sidebar | `bg-sidebar` solid          | `border-r`           | collapsible, indigo active-state pill     |
| Content | `bg-background`             | —                    | alternate `bg-muted/30` every other section |
| Cards   | `glass` translucent          | `border` 1px subtle  | rounded-12px, soft elevated shadow        |
| Footer  | `bg-muted/40`               | `border-t`           | subtle, links + copyright                 |

## Spacing & Rhythm

Section gaps `py-20 md:py-28`, content grouping `gap-6`, micro-spacing `gap-2/gap-3`, card padding `p-6`, generous whitespace throughout for Apple-minimal feel.

## Component Patterns

- Buttons: pill `rounded-full`, primary `gradient-primary`, secondary `bg-secondary`, hover lift + shadow
- Cards: `rounded-xl` (12px), `glass` background, subtle border, `shadow-elevated` on hover
- Badges: pill `rounded-full`, `bg-accent/10 text-accent` for status, mono font for technical
- Chat bubbles: assistant `glass` left-aligned, user `gradient-primary` right-aligned pill

## Motion

- Entrance: Framer Motion fade+slide-up stagger (0.4s, ease-out) on hero and card grids
- Hover: lift `-translate-y-0.5` + shadow elevation, `transition-smooth` 0.3s
- Decorative: subtle floating gradient orbs on hero, token-by-token streaming reveal on chat
- Page transitions: fade 0.2s between routes

## Constraints

- No raw hex/rgb/oklch() wrappers in components — semantic tokens only
- No purple-gradient-everywhere; indigo is one disciplined accent, not a wash
- Max 5 colors in palette; coral accent used sparingly for highlights and active states
- Glassmorphism only on cards/popovers, never on full-page backgrounds
- Dark mode tuned intentionally — indigo primary lightened, surfaces layered, not just inverted

## Signature Detail

Editorial serif (Fraunces) hero headlines paired with mono code blocks inside glassmorphism chat cards — the literary-meets-technical contrast is the platform's signature, evoking a thinking tool rather than a generic dashboard.
