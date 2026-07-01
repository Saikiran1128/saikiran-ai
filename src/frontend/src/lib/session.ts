import { useEffect, useState } from "react";

// useSession — generates and persists an anonymous per-browser session id.
//
// The backend keys every record (chats, folders, documents, activity, tool
// usage, search history) by a `SessionId` (Text). To honor the no-login,
// per-browser anonymous workspace requirement, we mint a UUID-like string on
// first load, persist it to localStorage under `nexus-session-id`, and return
// the same id across reloads. This keeps each browser's data isolated without
// requiring any account.

const STORAGE_KEY = "nexus-session-id";

function generateSessionId(): string {
  // crypto.randomUUID is available in all modern browsers and secure contexts.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through to manual generation
    }
  }
  // Manual RFC-4122 v4-ish fallback.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

function readSessionId(): string {
  if (typeof window === "undefined") return generateSessionId();
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.trim().length > 0) return existing;
  } catch {
    // localStorage unavailable — fall through to in-memory id.
  }
  const id = generateSessionId();
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore write failures (private mode etc.) — id still valid for session.
  }
  return id;
}

export interface UseSessionResult {
  /** Stable anonymous session id, persisted across reloads. */
  sessionId: string;
  /** True once the persisted id has been read (always true after first render). */
  ready: boolean;
}

export function useSession(): UseSessionResult {
  const [sessionId, setSessionId] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionId(readSessionId());
    setReady(true);
  }, []);

  return { sessionId, ready };
}

/** Synchronous accessor for non-hook call sites (e.g. query default args). */
export function getSessionId(): string {
  return readSessionId();
}
