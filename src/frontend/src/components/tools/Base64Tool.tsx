import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Mode = "encode" | "decode";

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const output = (() => {
    if (!input) return "";
    try {
      if (mode === "encode") {
        // Handle UTF-8 properly
        const bytes = new TextEncoder().encode(input);
        let bin = "";
        for (const b of bytes) bin += String.fromCharCode(b);
        return btoa(bin);
      }
      // decode
      const bin = atob(input.trim());
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  })();

  const handleInput = (v: string) => {
    setInput(v);
    if (!v) {
      setError(null);
      return;
    }
    try {
      if (mode === "decode") atob(v.trim());
      setError(null);
    } catch {
      setError("Invalid Base64 input.");
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard.");
  };

  return (
    <div className="space-y-5">
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as Mode);
          setError(null);
        }}
      >
        <TabsList className="w-full" data-ocid="base64.mode.tabs">
          <TabsTrigger
            value="encode"
            className="flex-1"
            data-ocid="base64.mode.encode"
          >
            Encode
          </TabsTrigger>
          <TabsTrigger
            value="decode"
            className="flex-1"
            data-ocid="base64.mode.decode"
          >
            Decode
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label data-ocid="base64.input.label">
          {mode === "encode" ? "Text to encode" : "Base64 to decode"}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={mode === "encode" ? "Enter text..." : "Enter Base64..."}
          rows={4}
          className="font-mono text-sm"
          data-ocid="base64.input.textarea"
        />
        {error && (
          <p
            className="text-xs text-destructive"
            data-ocid="base64.input.error"
          >
            {error}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label data-ocid="base64.output.label">Output</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={copy}
            disabled={!output}
            data-ocid="base64.copy_button"
          >
            <Copy className="size-3.5" aria-hidden />
            Copy
          </Button>
        </div>
        <Textarea
          value={output ?? ""}
          readOnly
          rows={4}
          className="font-mono text-sm bg-muted/30"
          placeholder="Output will appear here..."
          data-ocid="base64.output.textarea"
        />
      </div>
    </div>
  );
}
