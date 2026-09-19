"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

type AuthSession = NonNullable<ReturnType<typeof authClient.useSession>["data"]>;

export function SessionHydrator({ session }: { session: AuthSession | null }) {
  useEffect(() => {
    if (!session) return;
    authClient.hydrateSession(session);
  }, [session]);
  return null;
}
