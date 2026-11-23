import { Icon, Text } from "@softsurgery/mobile-ui";
import { RequestStatus } from "api-client";
import { Calendar, Clock3, XCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { cn } from "@softsurgery/lib";

interface RequestBannerProps {
  status?: RequestStatus;
  className?: string;
  isIncoming?: boolean;
}

const BANNER_CONFIG = {
  [RequestStatus.Accepted]: {
    icon: Calendar,
    containerClass: "border-emerald-500/25 bg-emerald-500/10",
    textClass: "text-emerald-600 dark:text-emerald-400",
    messageKey: "activities.request.banners.accepted",
  },
  [RequestStatus.Rejected]: {
    icon: XCircle,
    containerClass: "border-destructive/20 bg-destructive/10",
    textClass: "text-destructive",
    messageKey: "activities.request.banners.rejected",
  },
  [RequestStatus.Cancelled]: {
    icon: XCircle,
    containerClass: "border-destructive/20 bg-destructive/10",
    textClass: "text-destructive",
    messageKey: "activities.request.banners.cancelled",
  },
  [RequestStatus.Sent]: {
    icon: Clock3,
    containerClass: "border-border bg-muted",
    textClass: "text-muted-foreground",
    messageKey: "activities.outgoing.request.banners.pending",
  },
} as const;

export const RequestBanner = ({
  status,
  className,
  isIncoming = false,
}: RequestBannerProps) => {
  const { t } = useTranslation("activities");

  if (!status) return null;
  if (status === RequestStatus.Sent && isIncoming) return null;

  const config = BANNER_CONFIG[status as keyof typeof BANNER_CONFIG];
  if (!config) return null;

  return (
    <View
      className={cn(
        "flex-row items-center gap-2.5 rounded-xl border p-3.5",
        config.containerClass,
        className,
      )}
    >
      <Icon as={config.icon} size={18} className={config.textClass} />
      <Text className={cn("flex-1 text-sm", config.textClass)}>
        {t(config.messageKey)}
      </Text>
    </View>
  );
};
