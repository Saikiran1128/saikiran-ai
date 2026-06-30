import type { Mode, Model } from "@/types/chat";

// AI simulation utility — streams a context-aware mock response token-by-token.
//
// ─────────────────────────────────────────────────────────────────────────
// WIRING REAL AI PROVIDERS (future version)
// ─────────────────────────────────────────────────────────────────────────
// Replace the body of `streamMockResponse` with an HTTP outcall to the chosen
// provider (OpenAI / Anthropic / Google / DeepSeek / Ollama, etc.). The
// recommended path is a backend canister HTTP outcall (see
// extension-http-outcalls / extension-openai skills) so API keys never touch
// the browser. The streaming contract stays identical:
//
//   while (chunk = await stream.next()) onToken(chunk);
//
// Keep the AbortSignal handling so the UI can cancel in-flight streams.

const TOKEN_DELAY_MS = 18;
const CHUNK_SIZE = 3; // characters per tick — feels like real streaming

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const t = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    const cleanup = () => {
      clearTimeout(t);
      signal?.removeEventListener("abort", onAbort);
    };
    signal?.addEventListener("abort", onAbort);
  });
}

function buildResponse(prompt: string, mode: Mode, model: Model): string {
  const p = prompt.trim();
  const modelTag = `*via ${model}*`;

  switch (mode) {
    case "codingAssistant":
      return [
        `Here's a clean implementation for \`${p.slice(0, 60) || "your request"}\`:`,
        "",
        "```typescript",
        "export function solve(input: string): string {",
        "  // 1. Normalize input",
        "  const normalized = input.trim().toLowerCase();",
        "  // 2. Apply core logic",
        "  const result = normalized.split('').reverse().join('');",
        "  // 3. Return transformed output",
        "  return result;",
        "}",
        "```",
        "",
        "**How it works:**",
        "1. Normalizes the input string.",
        "2. Applies the core transformation.",
        "3. Returns the result with predictable types.",
        "",
        `Want me to add tests or error handling? ${modelTag}`,
      ].join("\n");

    case "research":
      return [
        `## Research summary: ${p.slice(0, 80) || "your topic"}`,
        "",
        "**Key findings:**",
        "- The subject shows measurable impact across multiple dimensions.",
        "- Recent literature converges on three primary mechanisms.",
        "- Adoption trends indicate steady growth over the last 24 months.",
        "",
        "**Notable sources:**",
        "- Peer-reviewed studies in the field (2023–2025).",
        "- Industry reports from established analyst firms.",
        "",
        "**Open questions:**",
        "- Long-term effects remain under longitudinal review.",
        "- Reproducibility varies across smaller sample sets.",
        "",
        `Let me know if you'd like a deeper dive into any point. ${modelTag}`,
      ].join("\n");

    case "emailAssistant":
      return [
        `**Subject:** ${p.slice(0, 70) || "Following up"}`,
        "",
        "Hi there,",
        "",
        `Thanks for reaching out about ${p.slice(0, 80) || "this"}. I wanted to follow up with a clear, concise response and outline the next steps.`,
        "",
        "1. **Context** — a brief recap of the request.",
        "2. **Action** — what I'm proposing we do next.",
        "3. **Timeline** — when to expect progress.",
        "",
        "Happy to jump on a quick call if that's easier.",
        "",
        "Best regards,",
        `${modelTag}`,
      ].join("\n");

    case "internetSearch":
      return [
        `**Search results for:** ${p.slice(0, 80) || "your query"}`,
        "",
        "1. **Top result** — a relevant, authoritative page on the topic.",
        "2. **Secondary source** — supporting context and background.",
        "3. **Recent update** — the latest development in this area.",
        "",
        "_Live browsing and source citations are coming soon._",
        "",
        ` ${modelTag}`,
      ].join("\n");

    case "youtubeSearch":
      return [
        `**YouTube results for:** ${p.slice(0, 80) || "your query"}`,
        "",
        "- 🎬 Relevant video — matching title and channel.",
        "- 🎬 Tutorial walkthrough — step-by-step coverage.",
        "- 🎬 Recent upload — fresh perspective on the topic.",
        "",
        "_Thumbnails and play buttons are coming soon._",
        "",
        ` ${modelTag}`,
      ].join("\n");

    case "knowledgeBase":
      return [
        `From your knowledge base: ${p.slice(0, 80) || "your question"}`,
        "",
        "Based on the indexed documents, here's a synthesized answer:",
        "",
        "- The relevant section confirms the core premise.",
        "- Supporting notes elaborate on the specifics.",
        "- A related entry provides additional context.",
        "",
        "_Mode-gated answers and citations are coming soon._",
        "",
        ` ${modelTag}`,
      ].join("\n");

    case "documentAssistant":
      return [
        `**Document analysis:** ${p.slice(0, 80) || "your document"}`,
        "",
        "- **Summary:** a concise overview of the document's purpose.",
        "- **Key points:** the three most important takeaways.",
        "- **Suggested edits:** clarity and tone improvements.",
        "",
        "_Full document upload and extraction are coming soon._",
        "",
        ` ${modelTag}`,
      ].join("\n");

    case "imageAnalysis":
      return [
        `**Image analysis:** ${p.slice(0, 80) || "your image"}`,
        "",
        "- **Subjects detected:** primary visual elements.",
        "- **Composition:** layout and framing observations.",
        "- **Text (OCR):** any visible text would appear here.",
        "",
        "_Image upload and OCR are coming soon._",
        "",
        ` ${modelTag}`,
      ].join("\n");

    default:
      return [
        `Great question about ${p.slice(0, 80) || "that"}. Here's my take:`,
        "",
        "I'd approach this by breaking it into clear, manageable steps. First, clarify the goal; then identify the constraints; finally, iterate toward the best outcome.",
        "",
        "A few things worth keeping in mind:",
        "- Keep the scope focused to avoid over-engineering.",
        "- Validate assumptions early with a small test.",
        "- Document the decision so future-you understands it.",
        "",
        `Want me to go deeper on any of these? ${modelTag}`,
      ].join("\n");
  }
}

export async function streamMockResponse(
  prompt: string,
  mode: Mode,
  model: Model,
  onToken: (chunk: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const full = buildResponse(prompt, mode, model);

  // Simulate a brief "thinking" delay before the first token.
  await sleep(220, signal);

  let i = 0;
  while (i < full.length) {
    if (signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const chunk = full.slice(i, i + CHUNK_SIZE);
    onToken(chunk);
    i += CHUNK_SIZE;
    await sleep(TOKEN_DELAY_MS, signal);
  }
}
