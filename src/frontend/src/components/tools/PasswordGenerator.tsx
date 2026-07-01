import { Copy, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface Options {
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface ToolUseProps {
  onUse?: (inputSummary: string, outputSummary: string) => void;
}

const STRENGTH_BARS = ["bar-0", "bar-1", "bar-2", "bar-3", "bar-4"] as const;

const SETS: Record<keyof Options, string> = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/",
};

function generate(length: number, opts: Options): string {
  let pool = "";
  const required: string[] = [];
  for (const key of Object.keys(SETS) as (keyof Options)[]) {
    if (opts[key]) {
      pool += SETS[key];
      required.push(SETS[key][Math.floor(Math.random() * SETS[key].length)]);
    }
  }
  if (!pool) return "";
  const chars: string[] = [...required];
  while (chars.length < length) {
    chars.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, length).join("");
}

function strength(pwd: string): { score: number; label: string } {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 20) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
  return { score, label: labels[score] };
}

export function PasswordGenerator({ onUse }: ToolUseProps) {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState<Options>({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: regenerate only when length/opts change; onUse is a stable callback
  const regenerate = useCallback(() => {
    const pwd = generate(length, opts);
    setPassword(pwd);
    if (onUse && pwd) {
      const sets = Object.keys(SETS)
        .filter((k) => opts[k as keyof Options])
        .join(", ");
      onUse(`len=${length}; sets=${sets}`, `${pwd.length}-char password`);
    }
  }, [length, opts]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const copy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard.");
  };

  const { score, label } = strength(password);
  const barColor =
    score <= 1
      ? "bg-destructive"
      : score <= 2
        ? "bg-warning"
        : score <= 3
          ? "bg-primary"
          : "bg-success";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label data-ocid="password.output.label">Generated password</Label>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md border border-border/60 bg-muted/40 px-3 py-2 font-mono text-sm">
            {password || "—"}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={copy}
            aria-label="Copy password"
            data-ocid="password.copy_button"
          >
            <Copy className="size-4" aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={regenerate}
            aria-label="Regenerate"
            data-ocid="password.regenerate_button"
          >
            <RefreshCw className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Strength</span>
          <span className="text-xs font-medium text-foreground">{label}</span>
        </div>
        <div className="flex gap-1" data-ocid="password.strength_meter">
          {STRENGTH_BARS.map((bar, i) => (
            <div
              key={bar}
              className={`h-1.5 flex-1 rounded-full transition-smooth ${i < score ? barColor : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label data-ocid="password.length.label">Length</Label>
          <span className="font-mono text-xs text-muted-foreground">
            {length}
          </span>
        </div>
        <Slider
          value={[length]}
          min={8}
          max={64}
          step={1}
          onValueChange={(v) => setLength(v[0] ?? 20)}
          data-ocid="password.length.slider"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(SETS) as (keyof Options)[]).map((key) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
          >
            <Label
              className="capitalize text-sm"
              data-ocid={`password.${key}.label`}
            >
              {key === "upper"
                ? "Uppercase"
                : key === "lower"
                  ? "Lowercase"
                  : key === "numbers"
                    ? "Numbers"
                    : "Symbols"}
            </Label>
            <Switch
              checked={opts[key]}
              onCheckedChange={(v) => setOpts((o) => ({ ...o, [key]: v }))}
              aria-label={`Toggle ${key}`}
              data-ocid={`password.${key}.switch`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
