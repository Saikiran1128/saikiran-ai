import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const SAMPLE = `# Markdown Preview

Type on the **left**, see the **rendered** result on the right.

## Features
- Headings, **bold**, *italic*, \`inline code\`
- Code blocks
- Lists, links, blockquotes
- Horizontal rules

> A blockquote example.

\`\`\`
const hello = "world";
console.log(hello);
\`\`\`

[Visit caffeine.ai](https://caffeine.ai)

---

End of sample.`;

type Token =
  | { type: "h"; level: number; text: string }
  | { type: "p"; text: string }
  | { type: "code"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "hr" };

function parseInline(text: string): string {
  let out = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  out = out.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded-md bg-muted text-foreground font-mono text-[0.85em]">$1</code>',
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-primary underline underline-offset-2 hover:opacity-80">$1</a>',
  );
  return out;
}

function parseMarkdown(src: string): Token[] {
  const lines = src.split("\n");
  const tokens: Token[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      tokens.push({ type: "h", level: h[1].length, text: h[2] });
      i++;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      tokens.push({ type: "code", text: buf.join("\n") });
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      tokens.push({ type: "quote", text: buf.join(" ") });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      tokens.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      tokens.push({ type: "ol", items });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      tokens.push({ type: "hr" });
      i++;
      continue;
    }

    tokens.push({ type: "p", text: line });
    i++;
  }
  return tokens;
}

function renderTokens(tokens: Token[]): string {
  return tokens
    .map((t) => {
      switch (t.type) {
        case "h":
          return `<h${t.level} class="font-display font-semibold text-foreground mt-4 mb-2" style="font-size:${1.5 - (t.level - 1) * 0.15}rem">${parseInline(t.text)}</h${t.level}>`;
        case "p":
          return `<p class="text-foreground leading-relaxed my-2">${parseInline(t.text)}</p>`;
        case "code":
          return `<pre class="my-3 p-4 rounded-xl bg-muted/60 border border-border overflow-x-auto"><code class="font-mono text-sm text-foreground">${t.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
        case "ul":
          return `<ul class="list-disc pl-6 my-2 space-y-1">${t.items.map((it) => `<li class="text-foreground leading-relaxed">${parseInline(it)}</li>`).join("")}</ul>`;
        case "ol":
          return `<ol class="list-decimal pl-6 my-2 space-y-1">${t.items.map((it) => `<li class="text-foreground leading-relaxed">${parseInline(it)}</li>`).join("")}</ol>`;
        case "quote":
          return `<blockquote class="my-3 pl-4 border-l-2 border-primary/60 italic text-muted-foreground">${parseInline(t.text)}</blockquote>`;
        case "hr":
          return `<hr class="my-4 border-border" />`;
      }
    })
    .join("");
}

function MarkdownPreviewPane({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);
  return (
    <div
      ref={ref}
      id="markdown-preview"
      className="glass-strong rounded-xl border border-border/60 p-4 min-h-[420px] overflow-y-auto prose-invert max-w-none"
    />
  );
}

export default function MarkdownPreview() {
  const [value, setValue] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => renderTokens(parseMarkdown(value)), [value]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Markdown copied to clipboard");
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
              Markdown Preview
            </h3>
            <p className="text-sm text-muted-foreground">
              Write on the left, preview on the right.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            data-ocid="markdown.copy_button"
            className="glass-strong"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-1.5">Copy</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="markdown-editor"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Editor
            </label>
            <Textarea
              id="markdown-editor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-ocid="markdown.input"
              spellCheck={false}
              className="glass-strong font-mono text-sm min-h-[420px] resize-y leading-relaxed"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="markdown-preview"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Preview
            </label>
            <MarkdownPreviewPane html={html} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
