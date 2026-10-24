import React from "react";
import { BaseProfile } from "./BaseProfile";
import { useUserStore } from "@/hooks/stores/useUserStore";
import { useCurrentUser } from "@/hooks/content/user/useCurrentUser";

interface MyProfileProps {
  className?: string;
}

export const MyProfile = ({ className }: MyProfileProps) => {
  const userStore = useUserStore();
  const { user, isFetchUserPending } = useCurrentUser("role");

  React.useEffect(() => {
    if (user) {
      userStore.set("response", user);
      return () => userStore.reset();
    }
  }, [user]);

  return (
    <BaseProfile
      className={className}
      isFetchUserPending={isFetchUserPending}
    />
  );
};
