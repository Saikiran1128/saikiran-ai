import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type CaseKey =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "snake"
  | "kebab";

const SAMPLE = "The quick brown fox jumps over the lazy dog";

const CASES: { key: CaseKey; label: string; fn: (s: string) => string }[] = [
  { key: "upper", label: "UPPER CASE", fn: (s) => s.toUpperCase() },
  { key: "lower", label: "lower case", fn: (s) => s.toLowerCase() },
  {
    key: "title",
    label: "Title Case",
    fn: (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    key: "sentence",
    label: "Sentence case",
    fn: (s) =>
      s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()),
  },
  {
    key: "camel",
    label: "camelCase",
    fn: (s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase())
        .replace(/^[A-Z]/, (c) => c.toLowerCase()),
  },
  {
    key: "snake",
    label: "snake_case",
    fn: (s) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, ""),
  },
  {
    key: "kebab",
    label: "kebab-case",
    fn: (s) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
  },
];

export default function TextCaseConverter() {
  const [input, setInput] = useState(SAMPLE);
  const [active, setActive] = useState<CaseKey>("title");
  const [copied, setCopied] = useState(false);

  const activeCase = CASES.find((c) => c.key === active)!;
  const output = activeCase.fn(input);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success("Output copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="glass p-5 sm:p-6 border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Text Case Converter
            </h3>
            <p className="text-sm text-muted-foreground">
              Transform text between common casing styles.
            </p>
          </div>
          <Badge variant="secondary" className="glass-strong">
            {activeCase.label}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label
            htmlFor="textcase-input"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Input
          </label>
          <Textarea
            id="textcase-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-ocid="textcase.input"
            className="glass-strong min-h-[120px] resize-y"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {CASES.map((c) => (
            <Button
              key={c.key}
              variant={active === c.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActive(c.key)}
              data-ocid={`textcase.${c.key}.button`}
              className={active === c.key ? "" : "glass-strong"}
            >
              {c.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="textcase-output"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Output
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              data-ocid="textcase.copy_button"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1.5">Copy</span>
            </Button>
          </div>
          <Textarea
            id="textcase-output"
            value={output}
            readOnly
            data-ocid="textcase.output"
            className="glass-strong min-h-[120px] resize-y font-mono text-sm"
          />
        </div>
      </Card>
    </motion.div>
  );
}
