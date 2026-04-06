import React from "react";
import {
  BarChart2,
  User as UserIcon,
  Settings as SettingsIcon,
  MessageSquare,
  BellIcon,
  BookUser,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "../shared/Spinner";
import { About } from "./cards/About";
import { Settings } from "./cards/Settings";
import { Activity } from "./cards/Activity";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/hooks/stores/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useFollowerDialog } from "./modals/FollowersDialog";
import { useFollowingDialog } from "./modals/FollowingDialog";
import { useFollowSystem } from "@/hooks/useFollowSystem";
import { Separator } from "../ui/separator";
import { Notifications } from "../audit-monitoring/notifications/Notifications";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/hooks/content/user/useCurrentUser";
import { identifyUserAvatar } from "@/lib/user";
import { api } from "@/api";
import { Book } from "./cards/Book";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const { followerDialog, openFollowerDialog } = useFollowerDialog({
    userStore,
  });
  const { followingDialog, openFollowingDialog } = useFollowingDialog({
    userStore,
  });

  const { data: profilePicture } = useQuery({
    queryKey: ["profile-picture", user?.pictureId],
    queryFn: () => api.upload.getUploadById(user?.pictureId as number),
    enabled: !!user?.pictureId,
  });

  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { followers, followings, isFollowersPending, isFollowingPending } =
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

  return (
    <div
      className={cn(
        "flex flex-col flex-1 h-full overflow-auto no-scrollbar container mx-auto",
        className,
      )}
    >
      {/* Profile Info */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4">
        <div className="flex flex-row items-center gap-4">
          <Avatar className={cn("w-24 h-24 rounded-full", className)}>
            <AvatarImage src={profilePicture} alt={fallback} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <h1 className="font-semibold text-lg">
              {user?.firstName} {user?.lastName}
            </h1>
            <h2 className="text-sm text-muted-foreground hover:underline cursor-pointer">
              <a href={`mailto:${user?.email}`}>{user?.email || "No email"}</a>
            </h2>
            <div className="flex flex-row items-center mt-2">
              <Separator orientation="vertical" className="mx-1 h-4" />
              <p className="text-sm text-muted-foreground">
                {user?.phone || t("userManagement.inspect.noPhoneNumber")}
              </p>
            </div>
          </div>
        </div>

        {/* Remove stats following/follower section or all the feature??*/}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col flex-1 overflow-auto"
      >
        <TabsList
          className={`grid border-b-2 border-[#3B82F6]`}
          style={{
            gridTemplateColumns: `repeat(${filteredTabs.length}, minmax(0, 1fr))`,
          }}
        >
          {filteredTabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:block">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>      {followingDialog}
      {followerDialog}

        <div className="flex flex-col flex-1 overflow-auto h-full">
          {filteredTabs.map(({ value, content }) =>
            activeTab === value ? (
              <TabsContent
                key={value}
                value={value}
                className="flex flex-col flex-1 overflow-auto h-full no-scrollbar"
              >
                {content}
              </TabsContent>
            ) : null,
          )}
        </div>
      </Tabs>
    </div>
  );
};
