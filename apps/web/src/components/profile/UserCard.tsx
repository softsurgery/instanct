import { Avatar, AvatarFallback, AvatarImage } from "@instanct/ui";
import { Card, CardContent } from "@instanct/ui";
import { Badge } from "@instanct/ui";

import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import React from "react";
import { identifyUser, identifyUserAvatar } from "@/lib/user";

interface UserCardProps {
  className?: string;
  user: ResponseUserDto;
}

export const UserCard = ({ className, user }: UserCardProps) => {
  const identification = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { data: profilePicture } = useQuery({
    queryKey: ["profile-picture", user?.pictureId],
    queryFn: () => api.upload.getUploadById(user?.pictureId as number),
    enabled: !!user?.pictureId,
  });

  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col 2xl:flex-row items-center gap-4 pt-6">
        <div className="flex flex-row items-center justify-center w-full gap-5">
          <div>
            <Avatar className="h-24 w-24 border">
              <AvatarImage src={profilePicture} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="mb-2">
              <h2 className="font-bold">{identification}</h2>
              <p className="text-muted-foreground text-xs">@{user?.username}</p>
              <p className="text-muted-foreground text-xs">@{user?.email}</p>
            </div>
            <p className="font-extrabold text-xs">{user?.role?.label}</p>
          </div>
        </div>

        <div className="w-full hidden"></div>

        <div className="w-full hidden">
          <h3 className="font-medium mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">UI Design</Badge>
            <Badge variant="secondary">UX Research</Badge>
            <Badge variant="secondary">Prototyping</Badge>
            <Badge variant="secondary">Figma</Badge>
            <Badge variant="secondary">User Testing</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
