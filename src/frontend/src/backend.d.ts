import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface Chat {
    id: bigint;
    title: string;
    messages: Array<Message>;
    createdAt: bigint;
    updatedAt: bigint;
    pinned: boolean;
    folder?: bigint;
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
    addMessage(chatId: bigint, message: Message): Promise<Chat | null>;
    createChat(title: string): Promise<Chat>;
    createFolder(name: string): Promise<Folder>;
    deleteChat(id: bigint): Promise<boolean>;
    deleteFolder(id: bigint): Promise<boolean>;
    getChat(id: bigint): Promise<Chat | null>;
    listChats(): Promise<Array<Chat>>;
    listFolders(): Promise<Array<Folder>>;
    renameFolder(id: bigint, name: string): Promise<Folder | null>;
    updateChat(id: bigint, title: string | null, folder: Some<bigint | null> | None, pinned: boolean | null): Promise<Chat | null>;
}
