import React from "react";
import { BaseProfile } from "./BaseProfile";
import { useIdentifiedUser } from "@/hooks/content/user/useIdentifiedUser";
import { useUserStore } from "@/hooks/stores/useUserStore";
import { useUserRefParamsStore } from "@/hooks/stores/useUserRefParamsStore";

interface UserProfileProps {
  className?: string;
  id: string;
}

export const UserProfile = ({ className, id }: UserProfileProps) => {
  const userStore = useUserStore();
  const userRefParamStore = useUserRefParamsStore();
  const { user, isFetchUserPending } = useIdentifiedUser(id, [
    "role",
    "objectives",
    "industries",
  ]);

  React.useEffect(() => {
    if (user) {
      userStore.set("response", user);
      userRefParamStore.set(
        "industries",
        user.industries.map((i) => i.id),
      );
      userRefParamStore.set(
        "objectives",
        user.objectives.map((i) => i.id),
      );

      return () => {
        userStore.reset();
      };
    }
  }, [user]);

  return (
    <BaseProfile
      className={className}
      isFetchUserPending={isFetchUserPending}
    />
  );
};
