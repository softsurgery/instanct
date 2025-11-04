import React from "react";
import {
BarChart2,
User as UserIcon,
Settings as SettingsIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "../shared/Spinner";
import { About } from "./cards/About";
import { Settings } from "./cards/Settings";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/hooks/stores/useUserStore";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useFollowerDialog } from "./modals/FollowersDialog";
import { useFollowingDialog } from "./modals/FollowingDialog";
import { useFollowSystem } from "@/hooks/useFollowSystem";
import { Separator } from "../ui/separator";
import { useTranslation } from "react-i18next";

interface BaseProfileProps {
className?: string;
isFetchUserPending?: boolean;
}

export const BaseProfile = ({
className,
isFetchUserPending,
}: BaseProfileProps) => {
const { t } = useTranslation("user-management");
const userStore = useUserStore();
const user = React.useMemo(() => userStore.response, [userStore]);
const [activeTab, setActiveTab] = React.useState("about");

const { followerDialog, openFollowerDialog } = useFollowerDialog({ userStore });
const { followingDialog, openFollowingDialog } = useFollowingDialog({ userStore });

const { data: picture } = useQuery({
queryKey: ["picture", user?.profile?.pictureId],
// queryFn: () => api.upload.getUploadById(user?.profile?.pictureId!),
enabled: !!user?.profile?.pictureId,
staleTime: Infinity,
});

React.useEffect(() => {
if (user) userStore.set("picture", picture);
}, [picture]);

const {
followers,
followings,
isFollowersPending,
isFollowingPending,
} = useFollowSystem({
id: user?.id || "",
use: ["followers", "followings"],
});

if (isFetchUserPending) {
return <Spinner className="h-screen" />;
}

const tabs = [
{ value: "about", label: t("userManagement.inspect.tabs.about"), icon: UserIcon, content: <About /> },
{ value: "settings", label: t("userManagement.inspect.tabs.settings"), icon: SettingsIcon, content: <Settings /> },
];

return (
<div className={cn("flex flex-col flex-1 h-full overflow-auto no-scrollbar container mx-auto", className)}> <div className="flex flex-col flex-1 overflow-auto no-scrollbar h-full">
{/* Profile Info */} 
<div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4"> 
  <div className="flex flex-row items-center gap-4">
<Avatar className={cn("w-24 h-24 rounded-full", className)}>
   <AvatarFallback>{user?.firstName?.charAt(0) || "U"}
    </AvatarFallback> 
    </Avatar> 
    <div className="flex flex-col items-start"> 
      <h1 className="font-semibold text-lg">{user?.firstName} {user?.lastName}
        </h1>
         <h2 className="text-sm text-muted-foreground hover:underline cursor-pointer">
<a href={`mailto:${user?.email}`}>{user?.email || "No email"}
  </a>
   </h2>
    <div className="flex flex-row items-center mt-2">
       <Separator orientation="vertical" className="mx-1 h-4" /> 
    <p className="text-sm text-muted-foreground">
{user?.profile?.phone || t("userManagement.inspect.noPhoneNumber")} 
</p>
 </div> 
 </div> 
 </div>

      {/* Stats */}
      <div className="flex flex-row justify-start gap-6 mt-4 lg:mt-0">
        <div className="flex flex-col items-center">
          <div className="font-semibold text-lg">-
          </div>
          <div className="text-sm text-muted-foreground">
            {t("userManagement.inspect.stats.services")}
            </div>
        </div>
        <div className="text-center cursor-pointer" onClick={openFollowingDialog}>
          <div className="font-semibold text-lg">{isFollowingPending ? "..." : followings.length}

          </div>
          <div className="text-sm text-muted-foreground">
            {t("Following")}

          </div>
        </div>
        <div className="text-center cursor-pointer" onClick={openFollowerDialog}>
          <div className="font-semibold text-lg">
            {isFollowersPending ? "..." : followers.length}
            </div>
          <div className="text-sm text-muted-foreground">
            {t("Followers")}
            </div>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <Tabs value={activeTab} onValueChange={setActiveTab} 
    className="flex flex-col flex-1 overflow-auto">
      <TabsList className="grid grid-cols-5 mb-4">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="hidden lg:block">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex flex-col flex-1 overflow-auto h-full">
        {tabs.map(({ value, content }) => (
          activeTab === value ? 
          <TabsContent key={value} value={value} className="flex flex-col flex-1 overflow-auto h-full">
            {content}
            </TabsContent> : null
        ))}
      </div>
    </Tabs>
  </div>

  {/* Dialogs */}
  {followingDialog}
  {followerDialog}
</div>


);
};
