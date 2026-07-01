import { Role, type backendInterface } from "@/backend";

// Visual-QA mock backend. Implements the session-keyed backendInterface with
// realistic sample data so the workspace renders populated panels without a
// running canister. State is held in-memory per mock instance.

type SessionId = string;

const now = () => BigInt(Date.now());

const sampleChats: Array<import("@/backend").Chat> = [
  {
    id: 1n,
    title: "Brainstorming productivity app ideas",
    messages: [
      {
        role: Role.user,
        content: "Brainstorm five product ideas for a productivity app.",
        model: "gpt" as any,
        mode: "normal" as any,
        timestamp: now() - 1000n * 60n * 30n,
      },
      {
        role: Role.assistant,
        content:
          "Here are five productivity app ideas:\n\n1. **FocusFlow** — a time-boxing assistant that schedules deep-work blocks around your calendar.\n2. **InboxZero AI** — auto-triages email and drafts one-line replies.\n3. **Standup Bot** — collects async standups and summarizes blockers.\n4. **Habit Loom** — weaves tiny habits into existing routines.\n5. **Meeting Miner** — turns transcripts into action items and follow-ups.",
        model: "gpt" as any,
        mode: "normal" as any,
        timestamp: now() - 1000n * 60n * 29n,
      },
    ],
    createdAt: now() - 1000n * 60n * 30n,
    updatedAt: now() - 1000n * 60n * 29n,
    pinned: true,
  },
  {
    id: 2n,
    title: "Debounce function in TypeScript",
    messages: [
      {
        role: Role.user,
        content: "Write a TypeScript function to debounce another function.",
        model: "claude" as any,
        mode: "codingAssistant" as any,
        timestamp: now() - 1000n * 60n * 60n * 2n,
      },
      {
        role: Role.assistant,
        content:
          "```ts\nfunction debounce<T extends (...args: any[]) => void>(\n  fn: T,\n  wait = 300,\n): (...args: Parameters<T>) => void {\n  let timer: ReturnType<typeof setTimeout> | null = null;\n  return (...args) => {\n    if (timer) clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), wait);\n  };\n}\n```",
        model: "claude" as any,
        mode: "codingAssistant" as any,
        timestamp: now() - 1000n * 60n * 60n * 2n + 5n,
      },
    ],
    createdAt: now() - 1000n * 60n * 60n * 2n,
    updatedAt: now() - 1000n * 60n * 60n * 2n + 5n,
    pinned: false,
  },
];

const sampleFolders: Array<import("@/backend").Folder> = [
  { id: 1n, name: "Work", createdAt: now() - 1000n * 60n * 60n * 24n },
  { id: 2n, name: "Personal", createdAt: now() - 1000n * 60n * 60n * 48n },
];

const sampleDocuments: Array<import("@/backend").DocumentRecord> = [
  {
    id: 1n,
    title: "Product Brief — FocusFlow",
    content:
      "# FocusFlow\n\nFocusFlow is a time-boxing assistant that schedules deep-work blocks around your calendar.\n\n## Goals\n- Reduce context switching\n- Protect focus time\n- Surface when you're most productive",
    createdAt: now() - 1000n * 60n * 60n * 3n,
    updatedAt: now() - 1000n * 60n * 60n * 2n,
    fileType: "markdown",
  },
  {
    id: 2n,
    title: "Meeting Notes — Q3 Kickoff",
    content:
      "## Q3 Kickoff\n\nAttendees: eng, design, pm\n\n- Ship v2 of the chat workspace\n- Launch tools marketplace\n- Improve search relevance",
    createdAt: now() - 1000n * 60n * 60n * 26n,
    updatedAt: now() - 1000n * 60n * 60n * 25n,
    fileType: "markdown",
  },
];

const sampleActivity: Array<import("@/backend").ActivityEntry> = [
  {
    id: 1n,
    activityType: "chat",
    summary: 'Sent message in "Brainstorming productivity app ideas"',
    details: "Brainstorm five product ideas for a productivity app.",
    timestamp: now() - 1000n * 60n * 30n,
  },
  {
    id: 2n,
    activityType: "tool",
    summary: "Used Summarizer tool",
    details: "Summarized a 2,400-word article into 5 bullet points.",
    timestamp: now() - 1000n * 60n * 60n,
  },
  {
    id: 3n,
    activityType: "search",
    summary: 'Searched the web for "oklch color system"',
    details: "Returned 8 results.",
    timestamp: now() - 1000n * 60n * 60n * 2n,
  },
  {
    id: 4n,
    activityType: "document",
    summary: "Created document \"Product Brief — FocusFlow\"",
    details: "New markdown document.",
    timestamp: now() - 1000n * 60n * 60n * 3n,
  },
];

const sampleToolUsage: Array<import("@/backend").ToolUsage> = [
  {
    id: 1n,
    toolName: "Summarizer",
    inputSummary: "2,400-word article on focus techniques",
    outputSummary: "5 bullet points",
    timestamp: now() - 1000n * 60n * 60n,
  },
  {
    id: 2n,
    toolName: "Translator",
    inputSummary: "English → French",
    outputSummary: "Translated 3 paragraphs",
    timestamp: now() - 1000n * 60n * 60n * 5n,
  },
];

const sampleSearchHistory: Array<import("@/backend").SearchRecord> = [
  {
    id: 1n,
    queryText: "oklch color system",
    timestamp: now() - 1000n * 60n * 60n * 2n,
    resultCount: 8n,
  },
  {
    id: 2n,
    queryText: "tanstack router code-based routing",
    timestamp: now() - 1000n * 60n * 60n * 6n,
    resultCount: 5n,
  },
];

// In-memory per-session stores so mutations reflect in subsequent reads.
const store = new Map<
  SessionId,
  {
    chats: import("@/backend").Chat[];
    folders: import("@/backend").Folder[];
    documents: import("@/backend").DocumentRecord[];
    activity: import("@/backend").ActivityEntry[];
    toolUsage: import("@/backend").ToolUsage[];
    search: import("@/backend").SearchRecord[];
  }
>();

function bucket(sid: SessionId) {
  let b = store.get(sid);
  if (!b) {
    b = {
      chats: sampleChats.map((c) => ({ ...c, messages: [...c.messages] })),
      folders: [...sampleFolders],
      documents: [...sampleDocuments],
      activity: [...sampleActivity],
      toolUsage: [...sampleToolUsage],
      search: [...sampleSearchHistory],
    };
    store.set(sid, b);
  }
  return b;
}

export const mockBackend: backendInterface = {
  __activity: async () => [],
  __chats: async () => [],
  __documents: async () => [],
  __folders: async () => [],
  __nextActivityId: async () => 0n,
  __nextChatId: async () => 0n,
  __nextDocumentId: async () => 0n,
  __nextFolderId: async () => 0n,
  __nextSearchId: async () => 0n,
  __nextToolUsageId: async () => 0n,
  __searchHistory: async () => [],
  __toolUsage: async () => [],

  async listChats(sid) {
    return bucket(sid).chats;
  },
  async getChat(sid, id) {
    return bucket(sid).chats.find((c) => c.id === id) ?? null;
  },
  async createChat(sid, title) {
    const b = bucket(sid);
    const chat: import("@/backend").Chat = {
      id: BigInt(b.chats.length + 1),
      title,
      messages: [],
      createdAt: now(),
      updatedAt: now(),
      pinned: false,
    };
    b.chats = [chat, ...b.chats];
    return chat;
  },
  async addMessage(sid, chatId, message) {
    const b = bucket(sid);
    const chat = b.chats.find((c) => c.id === chatId);
    if (!chat) return null;
    chat.messages = [...chat.messages, { ...message }];
    chat.updatedAt = now();
    return chat;
  },
  async updateChat(sid, id, title, _folder, pinned) {
    const b = bucket(sid);
    const chat = b.chats.find((c) => c.id === id);
    if (!chat) return null;
    if (title !== null) chat.title = title;
    if (pinned !== null) chat.pinned = pinned;
    chat.updatedAt = now();
    return chat;
  },
  async deleteChat(sid, id) {
    const b = bucket(sid);
    b.chats = b.chats.filter((c) => c.id !== id);
    return true;
  },

  async listFolders(sid) {
    return bucket(sid).folders;
  },
  async createFolder(sid, name) {
    const b = bucket(sid);
    const folder: import("@/backend").Folder = {
      id: BigInt(b.folders.length + 1),
      name,
      createdAt: now(),
    };
    b.folders = [...b.folders, folder];
    return folder;
  },
  async renameFolder(sid, id, name) {
    const b = bucket(sid);
    const f = b.folders.find((x) => x.id === id);
    if (!f) return null;
    f.name = name;
    return f;
  },
  async deleteFolder(sid, id) {
    const b = bucket(sid);
    b.folders = b.folders.filter((f) => f.id !== id);
    return true;
  },

  async listDocuments(sid) {
    return bucket(sid).documents;
  },
  async getDocument(sid, id) {
    return bucket(sid).documents.find((d) => d.id === id) ?? null;
  },
  async createDocument(sid, title, content) {
    const b = bucket(sid);
    const doc: import("@/backend").DocumentRecord = {
      id: BigInt(b.documents.length + 1),
      title,
      content,
      createdAt: now(),
      updatedAt: now(),
      fileType: "markdown",
    };
    b.documents = [doc, ...b.documents];
    return doc;
  },
  async updateDocument(sid, id, title, content) {
    const b = bucket(sid);
    const doc = b.documents.find((d) => d.id === id);
    if (!doc) return null;
    doc.title = title;
    doc.content = content;
    doc.updatedAt = now();
    return doc;
  },
  async deleteDocument(sid, id) {
    const b = bucket(sid);
    b.documents = b.documents.filter((d) => d.id !== id);
    return true;
  },

  async listActivity(sid) {
    return bucket(sid).activity;
  },
  async logActivity(sid, activityType, summary, details) {
    const b = bucket(sid);
    const entry: import("@/backend").ActivityEntry = {
      id: BigInt(b.activity.length + 1),
      activityType,
      summary,
      details,
      timestamp: now(),
    };
    b.activity = [entry, ...b.activity];
    return entry;
  },
  async clearActivity(sid) {
    const b = bucket(sid);
    b.activity = [];
    return true;
  },

  async listToolUsage(sid) {
    return bucket(sid).toolUsage;
  },
  async logToolUsage(sid, toolName, inputSummary, outputSummary) {
    const b = bucket(sid);
    const entry: import("@/backend").ToolUsage = {
      id: BigInt(b.toolUsage.length + 1),
      toolName,
      inputSummary,
      outputSummary,
      timestamp: now(),
    };
    b.toolUsage = [entry, ...b.toolUsage];
    return entry;
  },

  async listSearchHistory(sid) {
    return bucket(sid).search;
  },
  async logSearch(sid, queryText, resultCount) {
    const b = bucket(sid);
    const entry: import("@/backend").SearchRecord = {
      id: BigInt(b.search.length + 1),
      queryText,
      timestamp: now(),
      resultCount,
    };
    b.search = [entry, ...b.search];
    return entry;
  },
};
