import { useEffect, useState } from "react";
import { createActor } from "@/backend";
import { useAuth } from "@/lib/auth";

// useBackend — returns a ready-to-use actor instance for chat methods.
// The actor is created once per session and reused across renders.
// Real backend calls go through this actor (see hooks/useQueries.ts).

type Actor = ReturnType<typeof createActor>;

export function useBackend(): { actor: Actor | null; ready: boolean } {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const [actor, setActor] = useState<Actor | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setActor(null);
      return;
    }
    try {
      // createActor requires (canisterId, uploadFile, downloadFile, options?).
      // We don't have a deployed canister in this version, so pass safe
      // placeholders; if anything throws, fall back to null (chat route has
      // an in-memory store).
      setActor(
        createActor(
          "rrkah-fqaaa-aaaaa-aaaaq-cai",
          (async () => new Uint8Array()) as never,
          (async () => ({})) as never,
        ),
      );
    } catch {
      setActor(null);
    }
  }, [isAuthenticated]);

  return { actor, ready: actor !== null };
}
