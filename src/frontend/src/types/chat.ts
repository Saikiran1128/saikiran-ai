// Shared chat types — mirror backend.d.ts (Role, Model, Mode, Message, Chat, Folder)

export type Role = "user" | "assistant" | "systemMsg";

export type Model =
  | "gpt"
  | "gemini"
  | "claude"
  | "deepseek"
  | "llama"
  | "qwen"
  | "mistral"
  | "ollama";

export type Mode =
  | "normal"
  | "knowledgeBase"
  | "internetSearch"
  | "youtubeSearch"
  | "codingAssistant"
  | "emailAssistant"
  | "documentAssistant"
  | "imageAnalysis"
  | "research";

export interface Message {
  id: string;
  role: Role;
  content: string;
  model: Model | null;
  mode: Mode;
  createdAt: number; // epoch millis
}

export interface Chat {
  id: string;
  title: string;
  mode: Mode;
  model: Model;
  folderId: string | null;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

// Display metadata for UI selectors
export const MODEL_LABELS: Record<Model, string> = {
  gpt: "GPT-4o",
  gemini: "Gemini 1.5 Pro",
  claude: "Claude 3.5 Sonnet",
  deepseek: "DeepSeek V3",
  llama: "Llama 3.1 70B",
  qwen: "Qwen 2.5 72B",
  mistral: "Mistral Large",
  ollama: "Ollama (local)",
};

export const MODE_LABELS: Record<Mode, string> = {
  normal: "Normal Chat",
  knowledgeBase: "Knowledge Base",
  internetSearch: "Internet Search",
  youtubeSearch: "YouTube Search",
  codingAssistant: "Coding Assistant",
  emailAssistant: "Email Assistant",
  documentAssistant: "Document Assistant",
  imageAnalysis: "Image Analysis",
  research: "Research",
};
