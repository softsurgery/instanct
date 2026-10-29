import { RequestStatus } from "api-client";
import { View } from "react-native";
import { Icon, Text } from "@softsurgery/mobile-ui";
import { Check, X } from "lucide-react-native";
import { cn } from "@softsurgery/lib";

interface RequestStatusBadgeProps {
  status?: RequestStatus;
  className?: string;
}

const STATUS_CONFIG = {
  [RequestStatus.Accepted]: {
    label: "Acceptée",
    icon: Check,
    containerClass: "bg-primary/10 border-primary/20",
    iconClass: "text-primary",
    textClass: "text-primary",
  },
  [RequestStatus.Rejected]: {
    label: "Refusée",
    icon: X,
    containerClass: "bg-destructive/10 border-destructive/20",
    iconClass: "text-destructive",
    textClass: "text-destructive",
  },
  [RequestStatus.Sent]: {
    label: "En attente",
    containerClass: "bg-muted border-border",
    dotClass: "bg-muted-foreground",
    textClass: "text-muted-foreground",
  },
  [RequestStatus.Expired]: {
    label: "Expirée",
    containerClass: "bg-muted border-border",
    dotClass: "bg-muted-foreground/60",
    textClass: "text-muted-foreground/60",
  },
} as const;

export const StatusBadge = ({ status, className }: RequestStatusBadgeProps) => {
  if (!status) return null;

  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 px-3 py-2 rounded-full border",
        config.containerClass,
        className,
      )}
    >
      {"icon" in config ? (
        <Icon as={config.icon} size={14} className={config.iconClass} />
      ) : (
        <View className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      )}

      <Text className={cn("text-sm font-semibold", config.textClass)}>
        {config.label}
      </Text>
    </View>
  );
};
