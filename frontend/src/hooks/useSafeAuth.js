import { useAuth as useClerkAuth } from "@clerk/clerk-react";

/**
 * Safe wrapper around Clerk's useAuth.
 * Returns a working auth object even when Clerk is not configured.
 */
export function useSafeAuth() {
  try {
    const auth = useClerkAuth();
    return auth;
  } catch {
    // Clerk not configured or provider missing — return a no-op auth object
    return {
      isSignedIn: false,
      getToken: async () => null,
      userId: null,
      sessionId: null,
      signOut: async () => {},
    };
  }
}
