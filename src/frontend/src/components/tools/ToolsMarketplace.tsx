import { Search, Sparkles, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Base64Tool } from "./Base64Tool";
import { JSONFormatter } from "./JSONFormatter";
import MarkdownPreview from "./MarkdownPreview";
import { PasswordGenerator } from "./PasswordGenerator";
import { QRGenerator } from "./QRGenerator";
import TextCaseConverter from "./TextCaseConverter";
import TimestampConverter from "./TimestampConverter";
import { UUIDGenerator } from "./UUIDGenerator";

type Category =
  | "All"
  | "PDF"
  | "Images"
  | "Generators"
  | "Converters"
  | "Text"
  | "Developers";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, "All">;
  icon: LucideIcon;
  available: boolean;
  component?: React.ComponentType;
}

const TOOLS: Tool[] = [
  {
    id: "qr-generator",
    name: "QR Generator",
    description: "Create QR codes from text with adjustable size.",
    category: "Generators",
    icon: Wrench,
    available: true,
    component: QRGenerator,
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Strong passwords with strength meter.",
    category: "Generators",
    icon: Wrench,
    available: true,
    component: PasswordGenerator,
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate v4 UUIDs in bulk.",
    category: "Generators",
    icon: Wrench,
    available: true,
    component: UUIDGenerator,
  },
  {
    id: "base64",
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings.",
    category: "Converters",
    icon: Wrench,
    available: true,
    component: Base64Tool,
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Pretty-print, minify, and validate JSON.",
    category: "Developers",
    icon: Wrench,
    available: true,
    component: JSONFormatter,
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    description: "Live split-view markdown editor.",
    category: "Text",
    icon: Wrench,
    available: true,
    component: MarkdownPreview,
  },
  {
    id: "text-case",
    name: "Text Case Converter",
    description: "Convert text between cases instantly.",
    category: "Text",
    icon: Wrench,
    available: true,
    component: TextCaseConverter,
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    description: "Convert between Unix and human dates.",
    category: "Converters",
    icon: Wrench,
    available: true,
    component: TimestampConverter,
  },
  // Coming soon — PDF
  {
    id: "pdf-merge",
    name: "PDF Merge",
    description: "Combine multiple PDFs into one.",
    category: "PDF",
    icon: Wrench,
    available: false,
  },
  {
    id: "pdf-split",
    name: "PDF Split",
    description: "Split a PDF into pages or ranges.",
    category: "PDF",
    icon: Wrench,
    available: false,
  },
  {
    id: "pdf-compress",
    name: "PDF Compress",
    description: "Reduce PDF file size.",
    category: "PDF",
    icon: Wrench,
    available: false,
  },
  {
    id: "pdf-convert",
    name: "PDF Convert",
    description: "Convert PDF to other formats.",
    category: "PDF",
    icon: Wrench,
    available: false,
  },
  // Coming soon — Images
  {
    id: "img-bg-remover",
    name: "Background Remover",
    description: "Remove image backgrounds.",
    category: "Images",
    icon: Wrench,
    available: false,
  },
  {
    id: "img-compressor",
    name: "Image Compressor",
    description: "Compress images losslessly.",
    category: "Images",
    icon: Wrench,
    available: false,
  },
  {
    id: "img-upscaler",
    name: "Image Upscaler",
    description: "Upscale images with AI.",
    category: "Images",
    icon: Wrench,
    available: false,
  },
  {
    id: "img-to-pdf",
    name: "Image to PDF",
    description: "Convert images to a PDF.",
    category: "Images",
    icon: Wrench,
    available: false,
  },
  {
    id: "ocr",
    name: "OCR",
    description: "Extract text from images.",
    category: "Images",
    icon: Wrench,
    available: false,
  },
  // Coming soon — Generators
  {
    id: "barcode",
    name: "Barcode Generator",
    description: "Generate barcodes of many formats.",
    category: "Generators",
    icon: Wrench,
    available: false,
  },
  {
    id: "sql-generator",
    name: "SQL Generator",
    description: "Build SQL from natural language.",
    category: "Generators",
    icon: Wrench,
    available: false,
  },
  {
    id: "regex-generator",
    name: "Regex Generator",
    description: "Create regex from examples.",
    category: "Generators",
    icon: Wrench,
    available: false,
  },
  {
    id: "flowchart",
    name: "Flowchart Generator",
    description: "Diagram flows from text.",
    category: "Generators",
    icon: Wrench,
    available: false,
  },
  {
    id: "mindmap",
    name: "Mindmap Generator",
    description: "Generate mindmaps from topics.",
    category: "Generators",
    icon: Wrench,
    available: false,
  },
  // Coming soon — Converters
  {
    id: "csv-converter",
    name: "CSV Converter",
    description: "Convert CSV to JSON and back.",
    category: "Converters",
    icon: Wrench,
    available: false,
  },
  {
    id: "excel-converter",
    name: "Excel Converter",
    description: "Convert spreadsheets formats.",
    category: "Converters",
    icon: Wrench,
    available: false,
  },
  // Coming soon — Text
  {
    id: "grammar-checker",
    name: "Grammar Checker",
    description: "Check grammar and style.",
    category: "Text",
    icon: Wrench,
    available: false,
  },
  {
    id: "email-generator",
    name: "Email Generator",
    description: "Draft emails from prompts.",
    category: "Text",
    icon: Wrench,
    available: false,
  },
];

const CATEGORIES: Category[] = [
  "All",
  "PDF",
  "Images",
  "Generators",
  "Converters",
  "Text",
  "Developers",
];

export function ToolsMarketplace() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [openTool, setOpenTool] = useState<Tool | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const matchesCategory =
        activeCategory === "All" || t.category === activeCategory;
      const matchesQuery =
        q === "" ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<Category, Tool[]>();
    for (const t of filtered) {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, [filtered]);

  const ActiveComponent = openTool?.component;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        data-ocid="tools.header.section"
      >
        <Card className="glass-strong relative overflow-hidden border-border/60 p-8 shadow-lg sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-10 h-48 w-48 rounded-full opacity-25 blur-3xl gradient-primary"
          />
          <div className="relative flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tools Marketplace
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Curated utilities for every workflow
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Eight fully functional tools, ready to use. More are on the way —
              explore the catalog and pick what you need.
            </p>
          </div>
        </Card>
      </motion.section>

      <section
        className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        data-ocid="tools.filter.section"
      >
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="pl-9"
            aria-label="Search tools"
            data-ocid="tools.search_input"
          />
        </div>
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as Category)}
          className="w-full sm:w-auto"
        >
          <TabsList
            className="flex w-full flex-wrap sm:w-auto"
            data-ocid="tools.category.tabs"
          >
            {CATEGORIES.map((c) => (
              <TabsTrigger
                key={c}
                value={c}
                data-ocid={`tools.category.tab.${c.toLowerCase()}`}
              >
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </section>

      {filtered.length === 0 ? (
        <div
          className="mt-12 flex flex-col items-center justify-center gap-3 text-center"
          data-ocid="tools.empty_state"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 text-muted-foreground">
            <Search className="size-5" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">
            No tools match your search. Try a different keyword or category.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {Array.from(grouped.entries()).map(
            ([category, tools], groupIndex) => (
              <section
                key={category}
                data-ocid={`tools.group.${category.toLowerCase()}.section`}
              >
                <h2 className="mb-4 font-display text-lg font-medium text-foreground">
                  {category}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool, index) => (
                    <motion.button
                      key={tool.id}
                      type="button"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.04 * (groupIndex * 3 + index),
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={tool.available ? { y: -3 } : undefined}
                      className="text-left"
                      onClick={() => {
                        if (tool.available && tool.component) {
                          setOpenTool(tool);
                        } else {
                          toast.info(`${tool.name} is coming soon.`);
                        }
                      }}
                      data-ocid={`tools.item.${index + 1}`}
                      aria-label={`Open ${tool.name}`}
                    >
                      <Card
                        className={`group h-full border-border/60 bg-card p-5 shadow-sm transition-smooth ${
                          tool.available
                            ? "hover:border-primary/40 hover:shadow-md"
                            : "opacity-80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-smooth group-hover:scale-105">
                            <tool.icon className="size-5" aria-hidden />
                          </div>
                          {tool.available ? (
                            <Badge variant="secondary" className="gap-1">
                              <Sparkles className="size-3" aria-hidden />
                              Ready
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <h3 className="mt-4 font-display text-base font-medium text-foreground">
                          {tool.name}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {tool.description}
                        </p>
                      </Card>
                    </motion.button>
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}

      <Dialog
        open={openTool !== null}
        onOpenChange={(open) => !open && setOpenTool(null)}
      >
        <DialogContent className="sm:max-w-2xl" data-ocid="tools.dialog">
          {openTool && ActiveComponent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {openTool.name}
                </DialogTitle>
                <DialogDescription>{openTool.description}</DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-1">
                <ActiveComponent />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
