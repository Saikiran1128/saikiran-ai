import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface ToolUseProps {
  onUse?: (inputSummary: string, outputSummary: string) => void;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatHuman(d: Date) {
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function TimestampConverter({ onUse }: ToolUseProps) {
  const now = Math.floor(Date.now() / 1000);
  const [unix, setUnix] = useState<string>(String(now));
  const [date, setDate] = useState<string>(formatLocal(new Date()));
  const [copiedUnix, setCopiedUnix] = useState(false);
  const [copiedDate, setCopiedDate] = useState(false);

  const unixNum = Number(unix);
  const unixValid = !Number.isNaN(unixNum) && unix.trim() !== "";
  const unixDate = unixValid ? new Date(unixNum * 1000) : null;

  const dateMs = Date.parse(date);
  const dateValid = !Number.isNaN(dateMs);
  const dateNum = dateValid ? Math.floor(dateMs / 1000) : null;

  useEffect(() => {
    // keep inputs in sync on mount only — no auto-sync to avoid clobbering user edits
  }, []);

  const swapToUnix = () => {
    if (dateValid && dateNum !== null) {
      setUnix(String(dateNum));
      toast.success("Pulled date into timestamp");
      if (onUse) {
        onUse(`date → ${date}`, `unix ${dateNum}`);
      }
    }
  };

  const swapToDate = () => {
    if (unixValid && unixDate) {
      const local = formatLocal(unixDate);
      setDate(local);
      toast.success("Pulled timestamp into date");
      if (onUse) {
        onUse(`unix → ${unix}`, formatHuman(unixDate));
      }
    }
  };

  const copy = async (text: string, which: "unix" | "date") => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "unix") {
        setCopiedUnix(true);
        setTimeout(() => setCopiedUnix(false), 1500);
        if (onUse) onUse(`unix ${unix}`, "Copied unix timestamp");
      } else {
        setCopiedDate(true);
        setTimeout(() => setCopiedDate(false), 1500);
        if (onUse) onUse(`date ${date}`, "Copied date string");
      }
      toast.success("Copied to clipboard");
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Timestamp Converter
            </h3>
            <p className="text-sm text-muted-foreground">
              Two-way Unix ↔ human date conversion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              {tz}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Unix → Human */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="ts-unix"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Unix Timestamp (seconds)
            </Label>
            <Input
              id="ts-unix"
              value={unix}
              onChange={(e) => setUnix(e.target.value)}
              data-ocid="timestamp.unix_input"
              inputMode="numeric"
              className="glass-strong font-mono"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={swapToDate}
                data-ocid="timestamp.to_date_button"
                className="glass-strong"
                disabled={!unixValid}
              >
                Use as date
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(unix, "unix")}
                data-ocid="timestamp.copy_unix_button"
                disabled={!unixValid}
              >
                {copiedUnix ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-1.5">Copy</span>
              </Button>
            </div>
            <div className="glass-strong rounded-xl border border-border/60 p-3 min-h-[64px]">
              {unixValid && unixDate ? (
                <p className="text-sm text-foreground font-mono break-words">
                  {formatHuman(unixDate)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Enter a valid unix timestamp
                </p>
              )}
            </div>
          </div>

          {/* Human → Unix */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="ts-date"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              Local Date &amp; Time
            </Label>
            <Input
              id="ts-date"
              type="datetime-local"
              step={1}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-ocid="timestamp.date_input"
              className="glass-strong font-mono"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={swapToUnix}
                data-ocid="timestamp.to_unix_button"
                className="glass-strong"
                disabled={!dateValid}
              >
                Use as timestamp
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copy(dateNum !== null ? String(dateNum) : "", "date")
                }
                data-ocid="timestamp.copy_date_button"
                disabled={!dateValid}
              >
                {copiedDate ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-1.5">Copy</span>
              </Button>
            </div>
            <div className="glass-strong rounded-xl border border-border/60 p-3 min-h-[64px]">
              {dateValid && dateNum !== null ? (
                <p className="text-sm text-foreground font-mono break-words">
                  {dateNum}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Enter a valid date
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
