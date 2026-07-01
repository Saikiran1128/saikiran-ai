import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function uuidV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

export interface ToolUseProps {
  onUse?: (inputSummary: string, outputSummary: string) => void;
}

export function UUIDGenerator({ onUse }: ToolUseProps) {
  const [version, setVersion] = useState("v4");
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() =>
    Array.from({ length: 5 }, uuidV4),
  );

  const generate = () => {
    const n = Math.max(1, Math.min(100, count));
    const result = Array.from({ length: n }, uuidV4);
    setUuids(result);
    if (onUse) {
      onUse(`${version} × ${n}`, result[0] ?? "");
    }
  };

  const copyOne = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("UUID copied.");
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    toast.success("All UUIDs copied.");
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label data-ocid="uuid.version.label">Version</Label>
          <Select value={version} onValueChange={setVersion}>
            <SelectTrigger className="w-full" data-ocid="uuid.version.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="v4" data-ocid="uuid.version.item.v4">
                v4 (Random)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label data-ocid="uuid.count.label">Count</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
            data-ocid="uuid.count.input"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={generate}
          className="flex-1"
          data-ocid="uuid.generate_button"
        >
          Generate
        </Button>
        <Button
          variant="outline"
          onClick={copyAll}
          data-ocid="uuid.copy_all_button"
        >
          <Copy className="size-4" aria-hidden />
          Copy all
        </Button>
      </div>

      <div className="space-y-2">
        <Label data-ocid="uuid.output.label">Generated UUIDs</Label>
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-border/60 bg-muted/30 p-3">
          {uuids.map((id, i) => (
            <div
              key={id}
              className="flex items-center gap-2 rounded-md border border-border/40 bg-card px-3 py-2"
              data-ocid={`uuid.item.${i + 1}`}
            >
              <code className="flex-1 truncate font-mono text-xs">{id}</code>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => copyOne(id)}
                aria-label={`Copy UUID ${i + 1}`}
                data-ocid={`uuid.copy_button.${i + 1}`}
              >
                <Copy className="size-3.5" aria-hidden />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
