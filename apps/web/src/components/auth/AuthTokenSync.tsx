import React from "react";
import { useSession } from "next-auth/react";
import { useAuthPersistStore } from "@instanct/hooks/stores";

export function AuthTokenSync() {
  const { data: session, status } = useSession();
  const authPersistStore = useAuthPersistStore();

  React.useEffect(() => {
    if (session?.user?.access_token && session?.user?.refresh_token) {
      authPersistStore.setAccessToken(session.user.access_token);
      authPersistStore.setRefreshToken(session.user.refresh_token);
      authPersistStore.setAuthenticated(true);
    }
  }, [session, status, authPersistStore.isAuthenticated]);

  return null;
}
