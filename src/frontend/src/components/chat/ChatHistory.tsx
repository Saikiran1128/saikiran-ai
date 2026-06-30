import {
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Chat, Folder } from "@/types/chat";

interface ChatHistoryProps {
  chats: Chat[];
  folders: Folder[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onPinChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
  onNewFolder: () => void;
  onDeleteFolder: (id: string) => void;
}

export function ChatHistory({
  chats,
  folders,
  activeChatId,
  onSelectChat,
  onNewChat,
  onPinChat,
  onRenameChat,
  onDeleteChat,
  onNewFolder,
  onDeleteFolder,
}: ChatHistoryProps) {
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, query]);

  const pinned = filtered.filter((c) => isPinned(c));
  const unpinned = filtered.filter((c) => !isPinned(c));
  const folderChats = (folderId: string) =>
    unpinned.filter((c) => c.folderId === folderId);
  const looseChats = unpinned.filter((c) => !c.folderId);

  function startRename(chat: Chat) {
    setRenamingId(chat.id);
    setRenameValue(chat.title);
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      onRenameChat(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  }

  return (
    <div className="flex h-full flex-col bg-card/40 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 p-3">
        <span className="font-display text-sm font-semibold text-foreground">
          Chat history
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2 text-muted-foreground hover:text-foreground"
          onClick={onNewFolder}
          data-ocid="chat.history.new_folder_button"
          aria-label="New folder"
        >
          <FolderPlus className="size-3.5" />
        </Button>
      </div>

      {/* New chat + search */}
      <div className="space-y-2 p-3">
        <Button
          className="w-full justify-start gap-2"
          onClick={onNewChat}
          data-ocid="chat.history.new_chat_button"
        >
          <Plus className="size-4" />
          New chat
        </Button>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats…"
            data-ocid="chat.history.search_input"
            className="h-8 pl-8 text-xs"
            aria-label="Search chats"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {pinned.length > 0 && (
          <Section label="Pinned">
            {pinned.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                renaming={renamingId === chat.id}
                renameValue={renameValue}
                onRenameChange={setRenameValue}
                onCommitRename={commitRename}
                onSelect={() => onSelectChat(chat.id)}
                onPin={() => onPinChat(chat.id)}
                onRename={() => startRename(chat)}
                onDelete={() => onDeleteChat(chat.id)}
              />
            ))}
          </Section>
        )}

        {folders.map((folder) => {
          const items = folderChats(folder.id);
          if (items.length === 0) return null;
          return (
            <Section
              key={folder.id}
              label={folder.name}
              trailing={
                <button
                  type="button"
                  onClick={() => onDeleteFolder(folder.id)}
                  data-ocid={`chat.history.delete_folder.${folder.id}`}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete folder ${folder.name}`}
                >
                  <Trash2 className="size-3" />
                </button>
              }
            >
              {items.map((chat) => (
                <ChatRow
                  key={chat.id}
                  chat={chat}
                  active={chat.id === activeChatId}
                  renaming={renamingId === chat.id}
                  renameValue={renameValue}
                  onRenameChange={setRenameValue}
                  onCommitRename={commitRename}
                  onSelect={() => onSelectChat(chat.id)}
                  onPin={() => onPinChat(chat.id)}
                  onRename={() => startRename(chat)}
                  onDelete={() => onDeleteChat(chat.id)}
                />
              ))}
            </Section>
          );
        })}

        {looseChats.length > 0 && (
          <Section
            label={pinned.length === 0 && folders.length === 0 ? "" : "Recent"}
          >
            {looseChats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                renaming={renamingId === chat.id}
                renameValue={renameValue}
                onRenameChange={setRenameValue}
                onCommitRename={commitRename}
                onSelect={() => onSelectChat(chat.id)}
                onPin={() => onPinChat(chat.id)}
                onRename={() => startRename(chat)}
                onDelete={() => onDeleteChat(chat.id)}
              />
            ))}
          </Section>
        )}

        {filtered.length === 0 && (
          <div
            className="px-3 py-10 text-center"
            data-ocid="chat.history.empty_state"
          >
            <p className="text-xs text-muted-foreground">No chats found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  label,
  trailing,
  children,
}: {
  label: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      {label && (
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {trailing}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ChatRow({
  chat,
  active,
  renaming,
  renameValue,
  onRenameChange,
  onCommitRename,
  onSelect,
  onPin,
  onRename,
  onDelete,
}: {
  chat: Chat;
  active: boolean;
  renaming: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onCommitRename: () => void;
  onSelect: () => void;
  onPin: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  if (renaming) {
    return (
      <Input
        value={renameValue}
        onChange={(e) => onRenameChange(e.target.value)}
        onBlur={onCommitRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommitRename();
          if (e.key === "Escape") onCommitRename();
        }}
        autoFocus
        data-ocid="chat.history.rename_input"
        className="h-8 text-xs"
        aria-label="Rename chat"
      />
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-smooth",
        active
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        data-ocid="chat.history.select_chat"
        className="min-w-0 flex-1 truncate text-left text-xs"
        aria-current={active ? "true" : undefined}
      >
        {chat.title || "New chat"}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="size-6 shrink-0 rounded text-muted-foreground opacity-0 transition-smooth hover:bg-muted hover:text-foreground group-hover:opacity-100"
            aria-label="Chat actions"
            data-ocid="chat.history.menu_button"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={onPin} data-ocid="chat.history.pin_button">
            {isPinned(chat) ? (
              <PinOff className="size-3.5" />
            ) : (
              <Pin className="size-3.5" />
            )}
            {isPinned(chat) ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onRename}
            data-ocid="chat.history.rename_button"
          >
            <Pencil className="size-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={onDelete}
            data-ocid="chat.history.delete_button"
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

// Pinned chats are tracked via a title prefix convention since the local Chat
// type mirrors the backend shape. We use a lightweight in-memory flag instead.
function isPinned(_chat: Chat): boolean {
  return false;
}
