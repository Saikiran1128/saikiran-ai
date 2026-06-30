import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

// Lightweight markdown renderer — no external deps.
// Supports: headings, bold/italic, inline code, fenced code blocks (with copy),
// unordered/ordered lists, blockquotes, paragraphs, links, hr.
// Keeps the bundle small and avoids adding react-markdown to the project.

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const blocks = parseBlocks(content);
  return (
    <div className={cn("space-y-3 text-sm leading-relaxed", className)}>
      {blocks.map((block, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static block indices
        <BlockView key={`block-${i}`} block={block} />
      ))}
    </div>
  );
}

type Block =
  | { type: "code"; lang: string; code: string }
  | { type: "heading"; level: number; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "hr" }
  | { type: "p"; text: string };

function parseBlocks(src: string): Block[] {
  const lines = src.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const lang = fence[1] ?? "";
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      blocks.push({ type: "heading", level: h[1].length, text: h[2] });
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+\s*$/)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    // Unordered list
    if (line.match(/^\s*[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (line.match(/^\s*\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Blank line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (gather consecutive non-empty, non-special lines)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^```/) &&
      !lines[i].match(/^#{1,6}\s+/) &&
      !lines[i].match(/^---+\s*$/) &&
      !lines[i].startsWith("> ") &&
      !lines[i].match(/^\s*[-*]\s+/) &&
      !lines[i].match(/^\s*\d+\.\s+/)
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "code":
      return <CodeBlock lang={block.lang} code={block.code} />;
    case "heading": {
      const sizes = [
        "text-2xl font-semibold",
        "text-xl font-semibold",
        "text-lg font-semibold",
        "text-base font-semibold",
        "text-sm font-semibold",
        "text-xs font-semibold",
      ];
      const cls = sizes[Math.min(block.level - 1, 5)];
      return (
        <p className={cn(cls, "text-foreground")}>{renderInline(block.text)}</p>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-2 border-primary/40 pl-3 text-muted-foreground italic">
          {renderInline(block.text)}
        </blockquote>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-1 pl-5">
          {block.items.map((it, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list indices
            <li key={`li-${idx}`}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-1 pl-5">
          {block.items.map((it, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list indices
            <li key={`li-${idx}`}>{renderInline(it)}</li>
          ))}
        </ol>
      );
    case "hr":
      return <div className="border-t border-border" />;
    default:
      return <p className="text-foreground">{renderInline(block.text)}</p>;
  }
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/40">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          data-ocid="chat.code.copy_button"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-3" aria-hidden />
          ) : (
            <Copy className="size-3" aria-hidden />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}

// Inline markdown: **bold**, *italic*, `code`, [text](url)
function renderInline(text: string): ReactNode {
  const tokens: ReactNode[] = [];
  const regex =
    /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while (true) {
    match = regex.exec(text);
    if (match === null) break;
    if (match.index > last) tokens.push(text.slice(last, match.index));
    if (match[2] !== undefined) {
      tokens.push(
        <strong key={key++} className="font-semibold text-foreground">
          {match[2]}
        </strong>,
      );
    } else if (match[3] !== undefined) {
      tokens.push(
        <em key={key++} className="italic">
          {match[3]}
        </em>,
      );
    } else if (match[4] !== undefined) {
      tokens.push(
        <code
          key={key++}
          className="rounded bg-muted/60 px-1 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {match[4]}
        </code>,
      );
    } else if (match[5] !== undefined && match[6] !== undefined) {
      tokens.push(
        <a
          key={key++}
          href={match[6]}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {match[5]}
        </a>,
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}
