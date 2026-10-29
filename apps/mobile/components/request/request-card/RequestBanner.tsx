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

export const RequestBanner = ({
  status,
  className,
  isIncoming = false,
}: RequestBannerProps) => {
  const { t } = useTranslation("activities");

  const isPendingStatus =
    status !== undefined &&
    status !== RequestStatus.Accepted &&
    status !== RequestStatus.Rejected;

  if (status === RequestStatus.Accepted) {
    return (
      <View
        className={cn(
          "flex-row items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/10 p-3.5",
          className,
        )}
      >
        <Icon as={Calendar} size={18} className="text-primary" />
        <Text className="flex-1 text-sm text-primary">
          {t("activities.request.banners.accepted")}
        </Text>
      </View>
    );
  }

  if (status === RequestStatus.Rejected) {
    return (
      <View
        className={cn(
          "flex-row items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5",
          className,
        )}
      >
        <Icon as={XCircle} size={18} className="text-destructive" />
        <Text className="flex-1 text-sm text-destructive">
          {t("activities.request.banners.rejected")}
        </Text>
      </View>
    );
  }

  if (isPendingStatus && !isIncoming) {
    return (
      <View
        className={cn(
          "flex-row items-center gap-2.5 rounded-xl border border-border bg-muted p-3.5",
          className,
        )}
      >
        <Icon as={Clock3} size={18} className="text-muted-foreground" />
        <Text className="flex-1 text-sm text-muted-foreground">
          {t("activities.outgoing.request.banners.pending")}
        </Text>
      </View>
    );
  }

  return null;
};
