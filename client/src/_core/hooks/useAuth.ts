import { useCallback, useEffect, useMemo } from "react";
import { authClient } from "@/lib/auth-client";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const session = authClient.useSession();

  const logout = useCallback(async () => {
    await authClient.signOut();
    await session.refetch();
  }, [session]);

  const state = useMemo(() => {
    return {
      user: session.data?.user ?? null,
      loading: session.isPending,
      error: session.error ?? null,
      isAuthenticated: Boolean(session.data?.user),
    };
  }, [
    session.data,
    session.error,
    session.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (session.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    window.location.href = redirectPath || "/connexion";
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    session.isPending,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => session.refetch(),
    logout,
  };
}
