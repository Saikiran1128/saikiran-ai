import { Bot, Check, Copy, RefreshCw, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MODEL_LABELS, MODE_LABELS, type Message } from "@/types/chat";

import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

export function ChatMessage({
  message,
  isStreaming = false,
  onRegenerate,
  canRegenerate = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  function copyMessage() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
      data-ocid="chat.message"
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
          isUser
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-accent/30 bg-accent/10 text-accent",
        )}
        aria-hidden
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex min-w-0 max-w-[85%] flex-col gap-1.5",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 shadow-sm",
            isUser
              ? "rounded-tr-sm border-primary/30 bg-primary/10 text-foreground"
              : "rounded-tl-sm border-border/60 bg-card/70 backdrop-blur",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          ) : (
            <>
              <MarkdownRenderer
                content={message.content || (isStreaming ? "" : "")}
              />
              {isStreaming && (
                <span
                  className="ml-0.5 inline-block size-2 animate-pulse rounded-full bg-primary align-middle"
                  aria-hidden
                />
              )}
            </>
          )}
        </div>

        {/* Meta row */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-1",
            isUser ? "flex-row-reverse" : "flex-row",
          )}
        >
          {!isUser && message.model && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              {MODEL_LABELS[message.model]}
            </Badge>
          )}
          {!isUser && (
            <Badge
              variant="outline"
              className="text-[10px] font-normal text-muted-foreground"
            >
              {MODE_LABELS[message.mode]}
            </Badge>
          )}
          {!isUser && !isStreaming && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-foreground"
                onClick={copyMessage}
                data-ocid="chat.message.copy_button"
                aria-label="Copy message"
              >
                {copied ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
              {canRegenerate && onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                  onClick={onRegenerate}
                  data-ocid="chat.message.regenerate_button"
                  aria-label="Regenerate response"
                >
                  <RefreshCw className="size-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
