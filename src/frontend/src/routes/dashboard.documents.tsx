import { createRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileType2,
  FileUp,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { DocumentRecord } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateDocument,
  useDeleteDocument,
  useDocuments,
  useLogActivity,
  useUpdateDocument,
} from "@/hooks/useQueries";
import { useSession } from "@/lib/session";
import { dashboardLayoutRoute } from "./dashboard";

export const documentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/documents",
  component: DocumentsPage,
});

// ─────────────────────────────────────────────────────────────────────────
// Documents panel — single-page workspace for notes and uploaded text files.
//
// Two-column layout: a searchable document list on the left and an inline
// rich-text editor panel on the right. Everything happens in this route — no
// navigation, no modals, no new routes. Per-browser anonymous session keeps
// each browser's documents isolated (see useSession).
// ─────────────────────────────────────────────────────────────────────────

function DocumentsPage() {
  const { sessionId, ready } = useSession();
  const { data: documents = [], isLoading } = useDocuments(sessionId);
  const createDoc = useCreateDocument(sessionId);
  const updateDoc = useUpdateDocument(sessionId);
  const deleteDoc = useDeleteDocument(sessionId);
  const logActivity = useLogActivity(sessionId);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditingDoc | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter documents by search query (title match).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => d.title.toLowerCase().includes(q));
  }, [documents, query]);

  // Sort by most recently updated first.
  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt)),
    [filtered],
  );

  // ── Editor handlers ──────────────────────────────────────────────────
  const startNew = useCallback(() => {
    setEditing({ id: null, title: "", content: "", fileType: "txt" });
  }, []);

  const openExisting = useCallback((doc: DocumentRecord) => {
    setEditing({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      fileType: doc.fileType || "txt",
    });
  }, []);

  const closeEditor = useCallback(() => setEditing(null), []);

  const handleSave = useCallback(async () => {
    if (!editing || !ready || sessionId.length === 0) return;
    const title = editing.title.trim() || "Untitled document";
    const content = editing.content;
    try {
      if (editing.id === null) {
        const created = await createDoc.mutateAsync({ title, content });
        await logActivity.mutateAsync({
          activityType: "document",
          summary: `Created "${title}"`,
          details: `New ${editing.fileType} document, ${content.length} characters.`,
        });
        toast.success(`Created "${title}"`);
        if (created) openExisting(created);
      } else {
        await updateDoc.mutateAsync({
          docId: editing.id,
          title,
          content,
        });
        await logActivity.mutateAsync({
          activityType: "document",
          summary: `Updated "${title}"`,
          details: `Edited ${editing.fileType} document, ${content.length} characters.`,
        });
        toast.success(`Saved "${title}"`);
        setEditing((prev) => (prev ? { ...prev, title, content } : prev));
      }
    } catch {
      toast.error("Couldn't save document. Please try again.");
    }
  }, [
    editing,
    ready,
    sessionId,
    createDoc,
    updateDoc,
    logActivity,
    openExisting,
  ]);

  const handleDelete = useCallback(
    async (doc: DocumentRecord) => {
      try {
        await deleteDoc.mutateAsync(doc.id);
        await logActivity.mutateAsync({
          activityType: "document",
          summary: `Deleted "${doc.title}"`,
          details: `Removed ${doc.fileType || "txt"} document.`,
        });
        if (editing?.id === doc.id) closeEditor();
        toast.success(`Deleted "${doc.title}"`);
      } catch {
        toast.error("Couldn't delete document.");
      }
    },
    [deleteDoc, logActivity, editing, closeEditor],
  );

  // ── File upload (text-readable files only) ───────────────────────────
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // Always reset the input so the same file can be re-selected.
      e.target.value = "";
      if (!file || !ready || sessionId.length === 0) return;

      // Reject non-text files early — object storage is not set up.
      if (!isTextLike(file)) {
        toast.error("Only text-readable files are supported right now.");
        return;
      }

      setUploadProgress(0);
      try {
        // Read in chunks to surface progress feedback.
        const content = await readFileWithProgress(file, (p) =>
          setUploadProgress(p),
        );
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "txt";
        const title = file.name.replace(/\.[^.]+$/, "");
        const created = await createDoc.mutateAsync({
          title: title || "Uploaded file",
          content,
        });
        await logActivity.mutateAsync({
          activityType: "document",
          summary: `Uploaded "${file.name}"`,
          details: `Imported ${ext} file, ${content.length} characters.`,
        });
        toast.success(`Uploaded "${file.name}"`);
        if (created) openExisting({ ...created, fileType: ext });
      } catch {
        toast.error("Couldn't read that file. Try a different format.");
      } finally {
        setUploadProgress(null);
      }
    },
    [ready, sessionId, createDoc, logActivity, openExisting],
  );

  // ── Export current document ──────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!editing) return;
    const ext = editing.fileType || "txt";
    const blob = new Blob([editing.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(editing.title || "document").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document exported");
  }, [editing]);

  const saving = createDoc.isPending || updateDoc.isPending;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Document list column */}
      <section
        className="flex w-full flex-col border-r border-border bg-card/40 md:w-80 lg:w-96"
        aria-label="Document list"
      >
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Documents
            </h2>
            <span className="text-xs text-muted-foreground">
              {sorted.length} {sorted.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title…"
              className="pl-9"
              aria-label="Search documents"
              data-ocid="documents.search_input"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={startNew}
              disabled={!ready}
              data-ocid="documents.new_button"
            >
              <Plus className="size-4" />
              New
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleUploadClick}
              disabled={!ready || uploadProgress !== null}
              data-ocid="documents.upload_button"
            >
              <FileUp className="size-4" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown,.json,.csv,.tsv,.log,.js,.ts,.tsx,.jsx,.py,.rs,.go,.java,.c,.cpp,.h,.css,.html,.xml,.yml,.yaml,.toml,.ini,.sh,.sql,.text"
              className="hidden"
              onChange={handleFileSelected}
              data-ocid="documents.file_input"
            />
          </div>

          {uploadProgress !== null && (
            <div className="space-y-1" data-ocid="documents.upload_progress">
              <Progress value={uploadProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                Reading file… {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <ul className="space-y-1 p-2" data-ocid="documents.list">
            {isLoading ? (
              <ListSkeleton />
            ) : sorted.length === 0 ? (
              <EmptyList hasQuery={query.trim().length > 0} onNew={startNew} />
            ) : (
              sorted.map((doc, idx) => (
                <DocumentListItem
                  key={doc.id.toString()}
                  doc={doc}
                  index={idx}
                  active={editing?.id === doc.id}
                  onOpen={() => openExisting(doc)}
                  onDelete={() => handleDelete(doc)}
                />
              ))
            )}
          </ul>
        </ScrollArea>
      </section>

      {/* Editor panel */}
      <section
        className="hidden min-w-0 flex-1 flex-col md:flex"
        aria-label="Document editor"
      >
        {editing ? (
          <EditorPanel
            editing={editing}
            onChange={setEditing}
            onSave={handleSave}
            onClose={closeEditor}
            onExport={handleExport}
            saving={saving}
          />
        ) : (
          <EditorEmptyState onNew={startNew} />
        )}
      </section>

      {/* Mobile editor sheet */}
      {editing && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-40 flex flex-col bg-background md:hidden"
          data-ocid="documents.editor.mobile"
        >
          <EditorPanel
            editing={editing}
            onChange={setEditing}
            onSave={handleSave}
            onClose={closeEditor}
            onExport={handleExport}
            saving={saving}
          />
        </motion.div>
      )}
    </div>
  );
}

// ── Document list item ───────────────────────────────────────────────────

interface DocumentListItemProps {
  doc: DocumentRecord;
  index: number;
  active: boolean;
  onOpen: () => void;
  onDelete: () => void;
}

function DocumentListItem({
  doc,
  index,
  active,
  onOpen,
  onDelete,
}: DocumentListItemProps) {
  const Icon = fileTypeIcon(doc.fileType);
  return (
    <li data-ocid={`documents.item.${index + 1}`} className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-smooth ${
          active
            ? "border-primary/40 bg-primary/10"
            : "border-transparent hover:border-border hover:bg-muted/50"
        }`}
        aria-current={active ? "true" : undefined}
      >
        <div
          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border ${
            active
              ? "border-primary/30 bg-primary/15 text-primary"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-medium ${
              active ? "text-primary" : "text-foreground"
            }`}
          >
            {doc.title || "Untitled"}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" aria-hidden />
            <time dateTime={new Date(Number(doc.updatedAt)).toISOString()}>
              {formatRelative(Number(doc.updatedAt))}
            </time>
            <span aria-hidden>·</span>
            <span className="uppercase">{doc.fileType || "txt"}</span>
          </div>
        </div>
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${doc.title || "document"}`}
            data-ocid={`documents.delete_button.${index + 1}`}
            className="absolute right-2 top-2 hidden size-7 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive group-hover:flex focus-visible:flex"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent>Delete document</TooltipContent>
      </Tooltip>
    </li>
  );
}

// ── Editor panel ─────────────────────────────────────────────────────────

interface EditorPanelProps {
  editing: EditingDoc;
  onChange: (next: EditingDoc | null) => void;
  onSave: () => void;
  onClose: () => void;
  onExport: () => void;
  saving: boolean;
}

function EditorPanel({
  editing,
  onChange,
  onSave,
  onClose,
  onExport,
  saving,
}: EditorPanelProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(editing.title);
  const [content, setContent] = useState(editing.content);

  // Sync local state when the editing target changes.
  useEffect(() => {
    setTitle(editing.title);
    setContent(editing.content);
  }, [editing.title, editing.content]);

  // Initialize contentEditable once per editing target.
  // biome-ignore lint/correctness/useExhaustiveDependencies: initialize DOM only when switching documents; content is reflected into innerText
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerText !== content) el.innerText = content;
  }, [editing.id]);

  const commit = useCallback(() => {
    onChange({
      id: editing.id,
      title,
      content: editorRef.current?.innerText ?? content,
      fileType: editing.fileType,
    });
  }, [editing.id, editing.fileType, title, content, onChange]);

  const handleTitleBlur = useCallback(() => {
    commit();
  }, [commit]);

  const handleEditorBlur = useCallback(() => {
    setContent(editorRef.current?.innerText ?? "");
    commit();
  }, [commit]);

  const handleEditorInput = useCallback(() => {
    setContent(editorRef.current?.innerText ?? "");
  }, []);

  const Icon = fileTypeIcon(editing.fileType);
  const isNew = editing.id === null;

  return (
    <div className="flex h-full flex-col" data-ocid="documents.editor">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card/60 px-4 py-2.5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            aria-label="Close editor"
            data-ocid="documents.editor.close_button"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <Icon className="size-3.5" aria-hidden />
          </div>
          <Badge>{isNew ? "New" : editing.fileType || "txt"}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={onExport}
                data-ocid="documents.export_button"
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as file</TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={onClose}
            aria-label="Close editor"
            data-ocid="documents.editor.close_button.desktop"
          >
            <X className="size-4" aria-hidden />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            onClick={onSave}
            disabled={saving}
            data-ocid="documents.save_button"
          >
            <Save className="size-3.5" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="border-b border-border px-4 pt-4 sm:px-6">
        <Label htmlFor="doc-title" className="sr-only">
          Document title
        </Label>
        <input
          id="doc-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Untitled document"
          className="w-full bg-transparent font-display text-2xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/60"
          data-ocid="documents.title_input"
        />
      </div>

      {/* Rich text editor — contentEditable, lightweight, no library */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 sm:px-6">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            tabIndex={0}
            onInput={handleEditorInput}
            onBlur={handleEditorBlur}
            className="prose-doc min-h-[40vh] w-full whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-foreground outline-none focus:outline-none"
            data-ocid="documents.content_editor"
            aria-label="Document content"
            role="textbox"
            aria-multiline="true"
          />
        </div>
      </ScrollArea>

      {/* Footer status */}
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Pencil className="size-3" aria-hidden />
          {content.length} characters
        </span>
        <span className="font-mono">
          {isNew ? "unsaved" : editing.fileType || "txt"}
        </span>
      </div>
    </div>
  );
}

// ── Empty / loading states ───────────────────────────────────────────────

function EditorEmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center px-6 text-center"
      data-ocid="documents.editor.empty_state"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex max-w-sm flex-col items-center gap-5"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg">
          <FileText className="size-8" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Pick a document to read
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a document from the list, or start a fresh note to write
            something new.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={onNew}
          data-ocid="documents.editor.empty_state.new_button"
        >
          <Plus className="size-4" />
          Start a new document
        </Button>
      </motion.div>
    </div>
  );
}

function EmptyList({
  hasQuery,
  onNew,
}: {
  hasQuery: boolean;
  onNew: () => void;
}) {
  return (
    <li
      className="flex flex-col items-center gap-3 px-4 py-12 text-center"
      data-ocid="documents.empty_state"
    >
      <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
        <FileText className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {hasQuery ? "No matching documents" : "No documents yet"}
        </p>
        <p className="text-xs text-muted-foreground">
          {hasQuery
            ? "Try a different search term."
            : "Create a note or upload a text file to get started."}
        </p>
      </div>
      {!hasQuery && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onNew}
          data-ocid="documents.empty_state.new_button"
        >
          <Plus className="size-4" />
          New document
        </Button>
      )}
    </li>
  );
}

function ListSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-lg px-3 py-2.5"
          data-ocid={`documents.loading_state.${i + 1}`}
        >
          <div className="mt-0.5 size-8 shrink-0 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </>
  );
}

// ── Badge (inline, lightweight) ─────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

interface EditingDoc {
  id: bigint | null;
  title: string;
  content: string;
  fileType: string;
}

function fileTypeIcon(fileType: string) {
  const ext = (fileType || "").toLowerCase();
  if (["csv", "tsv"].includes(ext)) return FileSpreadsheet;
  if (
    [
      "json",
      "js",
      "ts",
      "tsx",
      "jsx",
      "py",
      "rs",
      "go",
      "java",
      "c",
      "cpp",
      "h",
      "sh",
      "sql",
    ].includes(ext)
  )
    return FileCode;
  if (["md", "markdown", "txt", "text", "log"].includes(ext)) return Type;
  if (ext) return FileType2;
  return FileText;
}

function isTextLike(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const textExts = [
    "txt",
    "text",
    "md",
    "markdown",
    "json",
    "csv",
    "tsv",
    "log",
    "js",
    "ts",
    "tsx",
    "jsx",
    "py",
    "rs",
    "go",
    "java",
    "c",
    "cpp",
    "h",
    "hpp",
    "css",
    "html",
    "xml",
    "yml",
    "yaml",
    "toml",
    "ini",
    "sh",
    "bash",
    "sql",
    "env",
    "gitignore",
    "dockerfile",
  ];
  if (textExts.includes(ext)) return true;
  return file.type.startsWith("text/");
}

function readFileWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const size = file.size || 1;
    reader.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / size) * 100));
    };
    reader.onload = () => {
      onProgress(100);
      resolve(String(reader.result ?? ""));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsText(file);
  });
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
