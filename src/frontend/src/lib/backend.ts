import { useActor } from "@caffeineai/core-infrastructure";

import { createActor } from "@/backend";

// useBackend — returns a ready-to-use backend actor instance, unconditionally.
//
// The actor is created via the core-infrastructure `useActor(createActor)`
// hook, which mints an agent-backed actor whether or not an Internet Identity
// is present. In no-login mode the actor is created with an anonymous identity,
// so chat / tools / search / documents all work immediately on load with no
// auth gate.
//
// Real backend calls go through this actor (see hooks/useQueries.ts). Every
// backend method takes a `SessionId` as its first argument — pair this hook
// with `useSession()` from `@/lib/session` at the call site.

type Actor = ReturnType<typeof createActor>;

export interface UseBackendResult {
  actor: Actor | null;
  /** True when the actor has resolved and is not currently (re)fetching. */
  ready: boolean;
  /** Mirrors core-infrastructure isFetching for finer-grained UI. */
  isFetching: boolean;
}

export function useBackend(): UseBackendResult {
  const { actor, isFetching } = useActor(createActor);
  return {
    actor: actor as Actor | null,
    ready: !!actor && !isFetching,
    isFetching,
  };
}

export type { Actor };
