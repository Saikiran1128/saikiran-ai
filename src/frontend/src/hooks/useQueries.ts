import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ActivityEntry,
  Chat,
  DocumentRecord,
  Folder,
  Message,
  Option,
  SearchRecord,
  ToolUsage,
} from "@/backend";
import { useBackend } from "@/lib/backend";

// React Query hooks wrapping every backend method. Each backend method takes
// a `SessionId` (Text) as its first argument — pair these hooks with
// `useSession()` at the call site and pass `sessionId` in. Queries are enabled
// only when both the actor is ready and a non-empty sessionId is present.
// Mutations invalidate the relevant query keys on success so the UI stays in
// sync with backend state.

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const qk = {
  chats: (sid: string) => ["chats", sid] as const,
  chat: (sid: string, id: bigint) => ["chat", sid, id.toString()] as const,
  folders: (sid: string) => ["folders", sid] as const,
  documents: (sid: string) => ["documents", sid] as const,
  document: (sid: string, id: bigint) =>
    ["document", sid, id.toString()] as const,
  activity: (sid: string) => ["activity", sid] as const,
  toolUsage: (sid: string) => ["toolUsage", sid] as const,
  searchHistory: (sid: string) => ["searchHistory", sid] as const,
};

// ---------------------------------------------------------------------------
// Chats
// ---------------------------------------------------------------------------

export function useChats(sessionId: string) {
  const { actor, ready } = useBackend();
  return useQuery<Chat[]>({
    queryKey: qk.chats(sessionId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChats(sessionId);
    },
    enabled: ready && !!actor && sessionId.length > 0,
  });
}

export function useChat(sessionId: string, chatId: bigint) {
  const { actor, ready } = useBackend();
  return useQuery<Chat | null>({
    queryKey: qk.chat(sessionId, chatId),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getChat(sessionId, chatId);
    },
    enabled: ready && !!actor && sessionId.length > 0,
  });
}

export function useCreateChat(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.createChat(sessionId, title);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.chats(sessionId) });
    },
  });
}

export function useUpdateChat(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      title: string | null;
      folder: Option<bigint | null>;
      pinned: boolean | null;
    }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.updateChat(
        sessionId,
        args.id,
        args.title,
        args.folder,
        args.pinned,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.chats(sessionId) });
    },
  });
}

export function useDeleteChat(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.deleteChat(sessionId, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.chats(sessionId) });
    },
  });
}

export function useAddMessage(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (args: { chatId: bigint; message: Message }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.addMessage(sessionId, args.chatId, args.message);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: qk.chats(sessionId) });
      if (data) {
        void queryClient.invalidateQueries({
          queryKey: qk.chat(sessionId, data.id),
        });
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export function useFolders(sessionId: string) {
  const { actor, ready } = useBackend();
  return useQuery<Folder[]>({
    queryKey: qk.folders(sessionId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFolders(sessionId);
    },
    enabled: ready && !!actor && sessionId.length > 0,
  });
}

export function useCreateFolder(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.createFolder(sessionId, name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.folders(sessionId) });
    },
  });
}

export function useRenameFolder(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (args: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.renameFolder(sessionId, args.id, args.name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.folders(sessionId) });
    },
  });
}

export function useDeleteFolder(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.deleteFolder(sessionId, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.folders(sessionId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export function useActivity(sessionId: string) {
  const { actor, ready } = useBackend();
  return useQuery<ActivityEntry[]>({
    queryKey: qk.activity(sessionId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActivity(sessionId);
    },
    enabled: ready && !!actor && sessionId.length > 0,
  });
}

export function useLogActivity(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (args: {
      activityType: string;
      summary: string;
      details: string;
    }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.logActivity(
        sessionId,
        args.activityType,
        args.summary,
        args.details,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.activity(sessionId) });
    },
  });
}

export function useClearActivity(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.clearActivity(sessionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.activity(sessionId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export function useDocuments(sessionId: string) {
  const { actor, ready } = useBackend();
  return useQuery<DocumentRecord[]>({
    queryKey: qk.documents(sessionId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDocuments(sessionId);
    },
    enabled: ready && !!actor && sessionId.length > 0,
  });
}

export function useDocument(sessionId: string, docId: bigint) {
  const { actor, ready } = useBackend();
  return useQuery<DocumentRecord | null>({
    queryKey: qk.document(sessionId, docId),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDocument(sessionId, docId);
    },
    enabled: ready && !!actor && sessionId.length > 0,
  });
}

export function useCreateDocument(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (args: { title: string; content: string }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.createDocument(sessionId, args.title, args.content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.documents(sessionId) });
    },
  });
}

export function useUpdateDocument(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (args: {
      docId: bigint;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.updateDocument(
        sessionId,
        args.docId,
        args.title,
        args.content,
      );
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: qk.documents(sessionId) });
      if (data) {
        void queryClient.invalidateQueries({
          queryKey: qk.document(sessionId, data.id),
        });
      }
    },
  });
}

export function useDeleteDocument(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (docId: bigint) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.deleteDocument(sessionId, docId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.documents(sessionId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Tool usage
// ---------------------------------------------------------------------------

export function useToolUsage(sessionId: string) {
  const { actor, ready } = useBackend();
  return useQuery<ToolUsage[]>({
    queryKey: qk.toolUsage(sessionId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listToolUsage(sessionId);
    },
    enabled: ready && !!actor && sessionId.length > 0,
  });
}

export function useLogToolUsage(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (args: {
      toolName: string;
      inputSummary: string;
      outputSummary: string;
    }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.logToolUsage(
        sessionId,
        args.toolName,
        args.inputSummary,
        args.outputSummary,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.toolUsage(sessionId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Search history
// ---------------------------------------------------------------------------

export function useSearchHistory(sessionId: string) {
  const { actor, ready } = useBackend();
  return useQuery<SearchRecord[]>({
    queryKey: qk.searchHistory(sessionId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSearchHistory(sessionId);
    },
    enabled: ready && !!actor && sessionId.length > 0,
  });
}

export function useLogSearch(sessionId: string) {
  const queryClient = useQueryClient();
  const { actor } = useBackend();
  return useMutation({
    mutationFn: async (args: { queryText: string; resultCount: bigint }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.logSearch(sessionId, args.queryText, args.resultCount);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: qk.searchHistory(sessionId),
      });
    },
  });
}
