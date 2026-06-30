import { ArrowUp, ImagePlus, Mic, Paperclip, Square, X } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Attachment {
  id: string;
  name: string;
  size: number;
}

interface ChatComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSend,
  onStop,
  isStreaming,
  disabled = false,
  placeholder = "Message Nexus AI…",
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setText("");
    setAttachments([]);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next: Attachment[] = Array.from(files).map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      size: f.size,
    }));
    setAttachments((prev) => [...prev, ...next].slice(0, 6));
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function toggleRecording() {
    setRecording((r) => !r);
    if (!recording) {
      setTimeout(() => setRecording(false), 2500);
    }
  }

  return (
    <div className="border-t border-border bg-card/60 backdrop-blur px-3 py-3 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((a) => (
              <span
                key={a.id}
                className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground"
              >
                <Paperclip className="size-3" aria-hidden />
                <span className="max-w-[140px] truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  data-ocid="chat.composer.remove_attachment"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${a.name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="glass-strong flex items-end gap-2 rounded-2xl border border-border/60 p-2 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
          {/* Image upload */}
          <input
            ref={imgRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                onClick={() => imgRef.current?.click()}
                data-ocid="chat.composer.image_button"
                aria-label="Upload image"
              >
                <ImagePlus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload image</TooltipContent>
          </Tooltip>

          {/* File upload */}
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                onClick={() => fileRef.current?.click()}
                data-ocid="chat.composer.attach_button"
                aria-label="Attach file"
              >
                <Paperclip className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach file</TooltipContent>
          </Tooltip>

          {/* Textarea */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            data-ocid="chat.composer.input"
            className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1 py-2 shadow-none focus-visible:ring-0"
            rows={1}
          />

          {/* Voice input (decorative) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground",
                  recording &&
                    "bg-destructive/10 text-destructive hover:text-destructive",
                )}
                onClick={toggleRecording}
                data-ocid="chat.composer.voice_button"
                aria-label={recording ? "Stop recording" : "Start voice input"}
              >
                <Mic className={cn("size-4", recording && "animate-pulse")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {recording ? "Recording…" : "Voice input"}
            </TooltipContent>
          </Tooltip>

          {/* Send / Stop */}
          {isStreaming ? (
            <Button
              size="icon"
              variant="destructive"
              className="size-9 shrink-0 rounded-xl"
              onClick={onStop}
              data-ocid="chat.composer.stop_button"
              aria-label="Stop generating"
            >
              <Square className="size-4" fill="currentColor" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="size-9 shrink-0 rounded-xl"
              onClick={handleSend}
              disabled={disabled || text.trim().length === 0}
              data-ocid="chat.composer.send_button"
              aria-label="Send message"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
          Nexus AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
