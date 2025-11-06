import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { api } from "@/api";
import { identifyUser, identifyUserAvatar } from "@/lib/user";

interface UserEntryProps {
  className?: string;
  user: ResponseUserDto;
  closeDialog?: () => void;
}

export const UserEntry = ({ className, user, closeDialog }: UserEntryProps) => {
  const router = useRouter();

  const { data: profilePicture } = useQuery({
    queryKey: ["profile-picture", user?.profile?.pictureId],
    queryFn: () => api.upload.getUploadById(user?.profile?.pictureId as number),
    enabled: !!user?.profile?.pictureId,
  });

  const identification = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const handleClick = () => {
    router.push(`/user-management/users/${user.id}`);
    closeDialog?.();
  };

  return (
    <div
      className={cn(
        "p-2 hover:bg-secondary/10 rounded-md cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={profilePicture} alt={fallback} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-medium text-card-foreground">
              {identification}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
