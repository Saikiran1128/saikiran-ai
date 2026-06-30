import { Copy, Minimize2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE = `{"name":"Aurora","version":1,"features":["chat","tools","docs"],"meta":{"author":"team","private":false}}`;

export function JSONFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const format = (minify: boolean) => {
    if (!input.trim()) {
      setError("Input is empty.");
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(
        minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2),
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON.");
      setOutput("");
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard.");
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label data-ocid="json.input.label">JSON input</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste JSON here..."
          rows={6}
          className="font-mono text-sm"
          data-ocid="json.input.textarea"
        />
        {error && (
          <p className="text-xs text-destructive" data-ocid="json.input.error">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => format(false)} data-ocid="json.pretty_button">
          <Sparkles className="size-4" aria-hidden />
          Pretty print
        </Button>
        <Button
          variant="outline"
          onClick={() => format(true)}
          data-ocid="json.minify_button"
        >
          <Minimize2 className="size-4" aria-hidden />
          Minify
        </Button>
        <Button
          variant="ghost"
          onClick={copy}
          disabled={!output}
          data-ocid="json.copy_button"
        >
          <Copy className="size-4" aria-hidden />
          Copy
        </Button>
      </div>

      <div className="space-y-2">
        <Label data-ocid="json.output.label">Formatted output</Label>
        <Textarea
          value={output}
          readOnly
          rows={8}
          className="font-mono text-sm bg-muted/30"
          placeholder="Formatted JSON will appear here..."
          data-ocid="json.output.textarea"
        />
      </div>
    </div>
  );
}
