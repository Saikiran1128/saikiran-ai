import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ToolUsage {
    id: bigint;
    inputSummary: string;
    outputSummary: string;
    timestamp: bigint;
    toolName: string;
}
export interface DocumentRecord {
    id: bigint;
    title: string;
    content: string;
    createdAt: bigint;
    fileType: string;
    updatedAt: bigint;
}
export interface Chat {
    id: bigint;
    title: string;
    messages: Array<Message>;
    createdAt: bigint;
    updatedAt: bigint;
    pinned: boolean;
    folder?: bigint;
}
export interface SearchRecord {
    id: bigint;
    queryText: string;
    timestamp: bigint;
    resultCount: bigint;
}
export interface Message {
    model?: Model;
    content: string;
    mode?: Mode;
    role: Role;
    timestamp: bigint;
}
export interface Folder {
    id: bigint;
    name: string;
    createdAt: bigint;
}
export type SessionId = string;
export interface ActivityEntry {
    id: bigint;
    activityType: string;
    summary: string;
    timestamp: bigint;
    details: string;
}
export enum Mode {
    normal = "normal",
    research = "research",
    codingAssistant = "codingAssistant",
    documentAssistant = "documentAssistant",
    imageAnalysis = "imageAnalysis",
    internetSearch = "internetSearch",
    youtubeSearch = "youtubeSearch",
    emailAssistant = "emailAssistant",
    knowledgeBase = "knowledgeBase"
}
export enum Model {
    gpt = "gpt",
    claude = "claude",
    mistral = "mistral",
    qwen = "qwen",
    llama = "llama",
    gemini = "gemini",
    ollama = "ollama",
    deepseek = "deepseek"
}
export enum Role {
    systemMsg = "systemMsg",
    user = "user",
    assistant = "assistant"
}
export interface backendInterface {
    addMessage(sessionId: SessionId, chatId: bigint, message: Message): Promise<Chat | null>;
    /**
     * / Per-session tool-usage records, keyed by anonymous session id.
     */
    clearActivity(sessionId: SessionId): Promise<boolean>;
    createChat(sessionId: SessionId, title: string): Promise<Chat>;
    createDocument(sessionId: SessionId, title: string, content: string): Promise<DocumentRecord>;
    createFolder(sessionId: SessionId, name: string): Promise<Folder>;
    deleteChat(sessionId: SessionId, id: bigint): Promise<boolean>;
    /**
     * / Global next-activity-id counter (monotonic across all sessions).
     */
    deleteDocument(sessionId: SessionId, docId: bigint): Promise<boolean>;
    deleteFolder(sessionId: SessionId, id: bigint): Promise<boolean>;
    getChat(sessionId: SessionId, id: bigint): Promise<Chat | null>;
    getDocument(sessionId: SessionId, docId: bigint): Promise<DocumentRecord | null>;
    /**
     * / Per-session activity log, keyed by anonymous session id.
     */
    listActivity(sessionId: SessionId): Promise<Array<ActivityEntry>>;
    listChats(sessionId: SessionId): Promise<Array<Chat>>;
    listDocuments(sessionId: SessionId): Promise<Array<DocumentRecord>>;
    listFolders(sessionId: SessionId): Promise<Array<Folder>>;
    /**
     * / Per-session activity log, keyed by anonymous session id.
     */
    listSearchHistory(sessionId: SessionId): Promise<Array<SearchRecord>>;
    /**
     * / Per-session activity log, keyed by anonymous session id.
     */
    listToolUsage(sessionId: SessionId): Promise<Array<ToolUsage>>;
    logActivity(sessionId: SessionId, activityType: string, summary: string, details: string): Promise<ActivityEntry>;
    logSearch(sessionId: SessionId, queryText: string, resultCount: bigint): Promise<SearchRecord>;
    logToolUsage(sessionId: SessionId, toolName: string, inputSummary: string, outputSummary: string): Promise<ToolUsage>;
    renameFolder(sessionId: SessionId, id: bigint, name: string): Promise<Folder | null>;
    /**
     * / Global next-folder-id counter (monotonic across all sessions).
     */
    updateChat(sessionId: SessionId, id: bigint, title: string | null, folder: Some<bigint | null> | None, pinned: boolean | null): Promise<Chat | null>;
    /**
     * / Per-session activity log, keyed by anonymous session id.
     */
    updateDocument(sessionId: SessionId, docId: bigint, title: string, content: string): Promise<DocumentRecord | null>;
}
