import React from "react";
import {
  BarChart2,
  User as UserIcon,
  Settings as SettingsIcon,
  MessageSquare,
  BellIcon,
  BookUser,
} from "lucide-react";
import { SideNav, Spinner } from "@softsurgery/components";
import { useUI } from "@softsurgery/contexts";
import { About } from "./cards/About";
import { Settings } from "./cards/Settings";
import { Activity } from "./cards/Activity";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/hooks/stores/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@softsurgery/ui";
import { useQuery } from "@tanstack/react-query";
import { useFollowerDialog } from "./modals/FollowersDialog";
import { useFollowingDialog } from "./modals/FollowingDialog";
import { useFollowSystem } from "@/hooks/useFollowSystem";
import { Notifications } from "../audit-monitoring/notifications/Notifications";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/hooks/content/user/useCurrentUser";
import { api } from "@/lib/api";
import { Book } from "./cards/Book";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { Edit } from "lucide-react";
import { Button } from "@softsurgery/ui";
import { useCoverPhoto } from "./cover/useCoverPhoto";
import { identifyUserAvatar } from "@softsurgery/lib";

interface BaseProfileProps {
  className?: string;
  isFetchUserPending?: boolean;
}

export const BaseProfile = ({
  className,
  isFetchUserPending,
}: BaseProfileProps) => {
  const { t } = useTranslation("user-management");
  const { user: currentUser } = useCurrentUser();
  const userStore = useUserStore();
  const user = React.useMemo(() => userStore.response, [userStore]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "about";
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const { setEnableMainOverflow, clearEnableMainOverflow } = useUI();

  React.useEffect(() => {
    setEnableMainOverflow?.(true);
    return () => {
      clearEnableMainOverflow?.();
    };
  }, [clearEnableMainOverflow, setEnableMainOverflow]);

  React.useEffect(() => {
    const tab = searchParams.get("tab") || "about";
    setActiveTab((current) => (current === tab ? current : tab));
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const { followerDialog } = useFollowerDialog({
    userStore,
  });
  const { followingDialog } = useFollowingDialog({
    userStore,
  });

  const { data: profilePicture } = useQuery({
    queryKey: ["profile-picture", user?.pictureId],
    queryFn: () => api.upload.getUploadById(user?.pictureId as number),
    enabled: !!user?.pictureId,
  });

  const { data: coverPicture, isLoading: isCoverPictureLoading } = useQuery({
    queryKey: ["cover-picture", user?.coverId],
    queryFn: () => api.upload.getUploadById(user?.coverId as number),
    enabled: !!user?.coverId,
  });

  const {
    fileInputRef,
    isCoverUploadPending,
    isCoverUpdatePending,
    handleCoverEdit,
    handleFileChange,
  } = useCoverPhoto(user?.id);

  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  useFollowSystem({
    id: user?.id || "",
    use: ["followers", "followings"],
  });

  if (isFetchUserPending || !user) {
    return <Spinner className="h-screen" />;
  }

  const tabs = [
    {
      value: "about",
      label: t("userManagement.inspect.tabs.about"),
      icon: UserIcon,
      content: <About />,
    },
    {
      value: "book",
      label: t("userManagement.inspect.tabs.book"),
      icon: BookUser,
      content: <Book />,
    },
    {
      value: "activity",
      label: t("userManagement.inspect.tabs.activity"),
      icon: BarChart2,
      content: <Activity userId={user?.id} />,
    },
    {
      value: "conversations",
      label: t("userManagement.inspect.tabs.conversations"),
      icon: MessageSquare,
      content: <div>Conversations Content</div>,
    },
    {
      value: "notifications",
      label: t("userManagement.inspect.tabs.notifications"),
      icon: BellIcon,
      content: <Notifications userId={user?.id as string} />,
    },
    {
      value: "settings",
      label: t("userManagement.inspect.tabs.settings"),
      icon: SettingsIcon,
      content: <Settings />,
    },
  ];

  const filteredTabs = tabs.filter(
    (tab) => tab.value !== "notifications" || user?.id !== currentUser?.id,
  );

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
  const currentSection =
    filteredTabs.find((tab) => tab.value === activeTab) ?? filteredTabs[0];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative -mx-2 -mt-2 h-56 overflow-hidden bg-muted md:-mx-4 md:-mt-4">
        {coverPicture ? (
          <img
            src={coverPicture}
            alt={fallback || "Cover photo"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-r from-muted/50 via-muted to-muted/80">
            {isCoverPictureLoading && (
              <Spinner className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />

        {user?.id === currentUser?.id && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-10 cursor-pointer rounded-lg bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background"
            onClick={handleCoverEdit}
            disabled={isCoverUploadPending || isCoverUpdatePending}
          >
            {isCoverUploadPending || isCoverUpdatePending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div className="px-1 sm:px-4">
        <div className="-mt-12">
          <div className="flex items-center gap-2">
            <Avatar className="size-24 border-4 border-background bg-background shadow-md">
              <AvatarImage src={profilePicture} alt={fallback} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="z-20">
              <h1 className="text-2xl font-bold text-foreground">
                {displayName}
              </h1>
              {user.username && (
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              )}
              <a
                href={`mailto:${user.email}`}
                className="block text-sm text-muted-foreground hover:underline"
              >
                {user.email}
              </a>
              {user.phone && (
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-56">
            <SideNav
              activeHref={currentSection?.value}
              onSelect={(item) => handleTabChange(item.href)}
              items={filteredTabs.map(({ value, label, icon: Icon }) => ({
                href: value,
                title: label,
                icon: <Icon className="h-4 w-4" />,
              }))}
            />
          </aside>
          <div className="min-w-0 flex-1 pb-8">{currentSection?.content}</div>
        </div>
      </div>

      {followingDialog}
      {followerDialog}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
};
