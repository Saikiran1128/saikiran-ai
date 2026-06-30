import { create } from "zustand";
import { persist } from "zustand/middleware";

// Auth store — Internet Identity + mock email login.
// NOTE: Google/Microsoft OAuth are deferred (see doNotBuild). II is wired via
// @icp-sdk/auth's useInternetIdentity hook at the call site (see loginWithII).

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  iiPrincipal: string | null;
  loginWithEmail: (email: string, password: string) => void;
  loginWithII: (principal: string) => void;
  logout: () => void;
}

function deriveName(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      iiPrincipal: null,
      loginWithEmail: (email, _password) => {
        // Mock auth — no real credential check this version.
        set({
          isAuthenticated: true,
          user: {
            id: `email-${btoa(email).slice(0, 12)}`,
            email,
            name: deriveName(email),
          },
          iiPrincipal: null,
        });
      },
      loginWithII: (principal) => {
        // Called by the component that owns useInternetIdentity() after a
        // successful II login. We persist the principal as the user identity.
        set({
          isAuthenticated: true,
          iiPrincipal: principal,
          user: {
            id: principal,
            email: "",
            name: `II · ${principal.slice(0, 8)}…`,
          },
        });
      },
      logout: () =>
        set({ isAuthenticated: false, user: null, iiPrincipal: null }),
    }),
    { name: "caffeine-auth" },
  ),
);
