import { createRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  Bot,
  Code,
  FileText,
  Globe,
  Lightbulb,
  PenLine,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type {
  Chat as BackendChat,
  Folder as BackendFolder,
  Mode as BackendMode,
  Model as BackendModel,
  Role as BackendRole,
} from "@/backend";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ModeSelector } from "@/components/chat/ModeSelector";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAddMessage,
  useChats,
  useCreateChat,
  useCreateFolder,
  useDeleteChat,
  useDeleteFolder,
  useFolders,
  useLogActivity,
  useUpdateChat,
} from "@/hooks/useQueries";
import { streamMockResponse } from "@/lib/ai-simulate";
import { useBackend } from "@/lib/backend";
import { useSession } from "@/lib/session";
import type { Chat, Folder, Message, Mode, Model } from "@/types/chat";
import { dashboardLayoutRoute } from "./dashboard";

export const aiChatRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/",
  component: AiChatPage,
});

// ─────────────────────────────────────────────────────────────────────────
// Suggested prompts shown in the empty state.
// ─────────────────────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  {
    icon: Lightbulb,
    title: "Brainstorm ideas",
    prompt: "Brainstorm five product ideas for a productivity app.",
  },
  {
    icon: Code,
    title: "Write code",
    prompt: "Write a TypeScript function to debounce another function.",
  },
  {
    icon: PenLine,
    title: "Draft an email",
    prompt: "Draft a friendly follow-up email after a product demo.",
  },
  {
    icon: Globe,
    title: "Explain a concept",
    prompt: "Explain how Internet Identity authentication works.",
  },
  {
    icon: FileText,
    title: "Summarize text",
    prompt: "Summarize the key principles of clean architecture.",
  },
  {
    icon: Sparkles,
    title: "Creative writing",
    prompt: "Write a short poem about the aurora borealis.",
  },
];

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function AiChatPage() {
  const { sessionId } = useSession();
  const { actor } = useBackend();

  // Backend is the source of truth. We mirror chats/folders into local UI
  // state keyed by backend ids (as strings) for snappy optimistic updates.
  const [chats, setChats] = useState<Chat[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [model, setModel] = useState<Model>("gpt");
  const [mode, setMode] = useState<Mode>("normal");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // React Query hooks — each takes sessionId as first arg per the new
  // no-login session-based backend contract.
  const chatsQuery = useChats(sessionId);
  const foldersQuery = useFolders(sessionId);
  const createChatMut = useCreateChat(sessionId);
  const updateChatMut = useUpdateChat(sessionId);
  const deleteChatMut = useDeleteChat(sessionId);
  const addMessageMut = useAddMessage(sessionId);
  const createFolderMut = useCreateFolder(sessionId);
  const deleteFolderMut = useDeleteFolder(sessionId);
  const logActivityMut = useLogActivity(sessionId);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  // Sync backend query data into local UI state. The backend is the source of
  // truth; local state mirrors it for optimistic streaming updates.
  useEffect(() => {
    if (chatsQuery.data) {
      setChats((prev) => {
        // Preserve in-flight streaming assistant messages that the backend
        // hasn't seen yet by merging them onto the backend snapshot.
        const streamingByChatId = new Map<string, Message[]>();
        for (const c of prev) {
          const streaming = c.messages.filter(
            (m) => m.id.startsWith("msg-") && m.role === "assistant",
          );
          if (streaming.length > 0) {
            streamingByChatId.set(c.id, streaming);
          }
        }
        const next = chatsQuery.data.map(adaptChat);
        for (const c of next) {
          const extra = streamingByChatId.get(c.id);
          if (extra && extra.length > 0) {
            // Append streaming messages not yet persisted.
            const existingIds = new Set(c.messages.map((m) => m.id));
            c.messages = [
              ...c.messages,
              ...extra.filter((m) => !existingIds.has(m.id)),
            ];
          }
        }
        return next;
      });
    }
  }, [chatsQuery.data]);

  useEffect(() => {
    if (foldersQuery.data) {
      setFolders(foldersQuery.data.map(adaptFolder));
    }
  }, [foldersQuery.data]);

  // Auto-scroll to bottom on new messages / streaming.
  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToBottom]);

  useEffect(() => {
    if (activeChat) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat, scrollToBottom]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollButton(!nearBottom);
  }

  // ── Chat mutations ────────────────────────────────────────────────────
  function persistMessage(chatId: string, message: Message) {
    if (!actor || !sessionId) return;
    addMessageMut.mutate(
      {
        chatId: BigInt(chatId),
        message: {
          role: message.role as BackendRole,
          content: message.content,
          model: (message.model ?? undefined) as unknown as BackendModel,
          mode: message.mode as BackendMode,
          timestamp: BigInt(message.createdAt),
        },
      },
      { onError: () => {} },
    );
  }

  function recordActivity(summary: string, details: string) {
    if (!sessionId) return;
    logActivityMut.mutate(
      { activityType: "chat", summary, details },
      { onError: () => {} },
    );
  }

  async function newChat(): Promise<Chat> {
    // Optimistic local chat with a temporary id; we replace it with the
    // backend-returned id once createChat resolves.
    const tempId = uid("chat");
    const optimistic: Chat = {
      id: tempId,
      title: "New chat",
      mode,
      model,
      folderId: null,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [optimistic, ...prev]);
    setActiveChatId(tempId);

    if (actor && sessionId) {
      try {
        const created = await createChatMut.mutateAsync(optimistic.title);
        const realId = created.id.toString();
        // Replace temp id with backend id, preserving any messages added
        // in the meantime (e.g. the first user message).
        setChats((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: realId } : c)),
        );
        setActiveChatId((cur) => (cur === tempId ? realId : cur));
        return { ...optimistic, id: realId };
      } catch {
        // Keep optimistic chat; backend sync will retry on next refetch.
      }
    }
    return optimistic;
  }

  function handleNewChat() {
    if (isStreaming) stopGeneration();
    void newChat();
  }

  function selectChat(id: string) {
    if (isStreaming) stopGeneration();
    setActiveChatId(id);
  }

  function deleteChat(id: string) {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
    if (actor && sessionId) {
      deleteChatMut.mutate(BigInt(id), { onError: () => {} });
    }
    toast.success("Chat deleted");
  }

  function renameChat(id: string, title: string) {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
      ),
    );
    if (actor && sessionId) {
      updateChatMut.mutate(
        { id: BigInt(id), title, folder: { __kind__: "None" }, pinned: null },
        { onError: () => {} },
      );
    }
  }

  function pinChat(id: string) {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, updatedAt: Date.now() } : c)),
    );
    if (actor && sessionId) {
      updateChatMut.mutate(
        {
          id: BigInt(id),
          title: null,
          folder: { __kind__: "None" },
          pinned: true,
        },
        { onError: () => {} },
      );
    }
    toast.success("Chat pinned");
  }

  function newFolder() {
    const name = `Folder ${folders.length + 1}`;
    if (actor && sessionId) {
      createFolderMut.mutate(name, {
        onError: () => toast.error("Couldn't create folder"),
      });
    } else {
      // Fallback for when actor isn't ready yet.
      const folder: Folder = { id: uid("folder"), name, createdAt: Date.now() };
      setFolders((prev) => [...prev, folder]);
    }
    toast.success("Folder created");
  }

  function deleteFolder(id: string) {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (actor && sessionId) {
      deleteFolderMut.mutate(BigInt(id), { onError: () => {} });
    }
  }

  // ── Streaming ─────────────────────────────────────────────────────────
  async function runStream(
    chatId: string,
    prompt: string,
    useMode: Mode,
    useModel: Model,
  ) {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);

    // Append an empty assistant message we fill token-by-token.
    const assistantId = uid("msg");
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      model: useModel,
      mode: useMode,
      createdAt: Date.now(),
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, assistantMsg],
              updatedAt: Date.now(),
            }
          : c,
      ),
    );

    try {
      await streamMockResponse(
        prompt,
        useMode,
        useModel,
        (chunk) => {
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: m.content + chunk }
                        : m,
                    ),
                  }
                : c,
            ),
          );
        },
        controller.signal,
      );
      // Persist final assistant message + record activity.
      const finalChat = chatsRef.current.find((c) => c.id === chatId);
      const finalMsg = finalChat?.messages.find((m) => m.id === assistantId);
      if (finalMsg) {
        persistMessage(chatId, finalMsg);
        recordActivity(
          `Assistant reply in "${finalChat?.title ?? "chat"}"`,
          prompt.slice(0, 200),
        );
      }
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") {
        toast.info("Generation stopped");
        // Persist partial assistant message if any content was generated.
        const finalChat = chatsRef.current.find((c) => c.id === chatId);
        const partial = finalChat?.messages.find((m) => m.id === assistantId);
        if (partial && partial.content.length > 0) {
          persistMessage(chatId, partial);
        }
      } else {
        toast.error("Something went wrong while generating.");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  // Keep a ref to chats so the stream callback can read the latest snapshot.
  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  function stopGeneration() {
    abortRef.current?.abort();
  }

  async function handleSend(text: string) {
    let chat = activeChat;
    if (!chat) chat = await newChat();
    const chatId = chat.id;

    const userMsg: Message = {
      id: uid("msg"),
      role: "user",
      content: text,
      model: null,
      mode,
      createdAt: Date.now(),
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              title: c.messages.length === 0 ? text.slice(0, 60) : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: Date.now(),
            }
          : c,
      ),
    );
    persistMessage(chatId, userMsg);
    recordActivity(`Sent message in "${chat.title}"`, text.slice(0, 200));
    void runStream(chatId, text, mode, model);
  }

  function handleRegenerate() {
    if (!activeChat || isStreaming) return;
    const msgs = activeChat.messages;
    let lastUser: Message | undefined;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUser = msgs[i];
        break;
      }
    }
    if (!lastUser) return;
    const lastUserIdx = msgs.lastIndexOf(lastUser);
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              messages: c.messages.slice(0, lastUserIdx + 1),
              updatedAt: Date.now(),
            }
          : c,
      ),
    );
    void runStream(activeChat.id, lastUser.content, mode, model);
  }

  function handleContinue() {
    if (!activeChat || isStreaming) return;
    const lastMsg = activeChat.messages[activeChat.messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    void runStream(
      activeChat.id,
      "Continue your previous response.",
      mode,
      model,
    );
  }

  // ── Export / Share ─────────────────────────────────────────────────────
  function exportChat() {
    if (!activeChat) return;
    const md = [
      `# ${activeChat.title}`,
      "",
      `*Model: ${activeChat.model} · Mode: ${activeChat.mode}*`,
      "",
      ...activeChat.messages.map(
        (m) =>
          `## ${m.role === "user" ? "You" : "Assistant"}\n\n${m.content}\n`,
      ),
    ].join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeChat.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported as Markdown");
  }

  function shareChat() {
    if (!activeChat) return;
    const url = `${window.location.origin}/dashboard/ai-chat?chat=${activeChat.id}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Chat link copied to clipboard"),
      () => toast.error("Couldn't copy link"),
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  const hasMessages = (activeChat?.messages.length ?? 0) > 0;
  const lastMsg = activeChat?.messages[(activeChat?.messages.length ?? 0) - 1];
  const canRegenerate =
    hasMessages && lastMsg?.role === "assistant" && !isStreaming;
  const canContinue =
    hasMessages && lastMsg?.role === "assistant" && !isStreaming;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* History panel — desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-border lg:block">
        <ChatHistory
          chats={chats}
          folders={folders}
          activeChatId={activeChatId}
          onSelectChat={selectChat}
          onNewChat={handleNewChat}
          onPinChat={pinChat}
          onRenameChat={renameChat}
          onDeleteChat={deleteChat}
          onNewFolder={newFolder}
          onDeleteFolder={deleteFolder}
        />
      </aside>

      {/* Main chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 border-b border-border bg-card/60 px-3 py-2 backdrop-blur sm:px-4">
          <div className="flex items-center gap-2">
            <ModeSelector value={mode} onChange={setMode} />
            <ModelSelector value={model} onChange={setModel} />
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={exportChat}
                  disabled={!hasMessages}
                  data-ocid="chat.export_button"
                >
                  <FileText className="size-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export as Markdown</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={shareChat}
                  disabled={!hasMessages}
                  data-ocid="chat.share_button"
                >
                  <Sparkles className="size-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy share link</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative flex-1 overflow-y-auto"
          data-ocid="chat.message_list"
        >
          {!hasMessages ? (
            <EmptyState
              onPick={(p) => void handleSend(p)}
              onNewChat={handleNewChat}
            />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
              {activeChat?.messages.map((m, idx) => {
                const lastIdx = (activeChat?.messages.length ?? 0) - 1;
                return (
                  <ChatMessage
                    key={m.id}
                    message={m}
                    isStreaming={
                      isStreaming && idx === lastIdx && m.role === "assistant"
                    }
                    onRegenerate={handleRegenerate}
                    canRegenerate={canRegenerate && idx === lastIdx}
                  />
                );
              })}
              {/* Continue button */}
              {canContinue && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleContinue}
                    data-ocid="chat.continue_button"
                  >
                    <Sparkles className="size-3.5" />
                    Continue response
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Scroll-to-bottom button */}
          {showScrollButton && hasMessages && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              type="button"
              onClick={() => scrollToBottom()}
              data-ocid="chat.scroll_bottom_button"
              className="absolute bottom-4 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-lg backdrop-blur transition-smooth hover:bg-card"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="size-4" />
            </motion.button>
          )}
        </div>

        {/* Composer */}
        <ChatComposer
          onSend={(t) => void handleSend(t)}
          onStop={stopGeneration}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────
function EmptyState({
  onPick,
  onNewChat,
}: {
  onPick: (prompt: string) => void;
  onNewChat: () => void;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-5"
        data-ocid="chat.empty_state"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg">
          <Bot className="size-8" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            How can I help you today?
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick a prompt to get started, or start a fresh conversation.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((s, idx) => (
            <button
              type="button"
              key={s.title}
              data-ocid={`chat.suggested_prompt.item.${idx + 1}`}
              onClick={() => onPick(s.prompt)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(s.prompt);
                }
              }}
              className="glass cursor-pointer gap-0 border-border/60 p-3 text-left transition-smooth hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <Card className="glass gap-0 border-border/60 p-0 text-left transition-smooth hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                    <s.icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {s.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {s.prompt}
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          className="mt-2 gap-2"
          onClick={onNewChat}
          data-ocid="chat.empty_state.new_chat_button"
        >
          <Sparkles className="size-4" />
          Start a new chat
        </Button>
      </motion.div>
    </div>
  );
}

// ── Backend adapters ─────────────────────────────────────────────────────
function adaptChat(c: BackendChat): Chat {
  return {
    id: c.id.toString(),
    title: c.title,
    mode: c.messages[0]?.mode ?? "normal",
    model: c.messages[0]?.model ?? "gpt",
    folderId:
      c.folder !== undefined && c.folder !== null ? String(c.folder) : null,
    messages: c.messages.map((m, i) => ({
      id: `b-${c.id}-${i}`,
      role: m.role,
      content: m.content,
      model: m.model ?? null,
      mode: m.mode ?? "normal",
      createdAt: Number(m.timestamp),
    })),
    createdAt: Number(c.createdAt),
    updatedAt: Number(c.updatedAt),
  };
}

function adaptFolder(f: BackendFolder): Folder {
  return {
    id: f.id.toString(),
    name: f.name,
    createdAt: Number(f.createdAt),
  };
}
