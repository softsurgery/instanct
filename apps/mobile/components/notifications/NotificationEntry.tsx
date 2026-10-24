import { timeAgo } from "@/lib/date";
import { useTranslation } from "react-i18next";
import { View, Pressable } from "react-native";
import { Image, Text } from "@softsurgery/mobile-ui";
import { cn } from "@softsurgery/lib";
import {
  NotificationType,
  ResponseNotificationDto,
} from "@softsurgery/api-client";
import { HTMLText } from "@softsurgery/mobile-components";
import { useServerImages } from "@/hooks/content/useServerImages";
import {
  getNotificationDestination,
  navigateToNotificationDestination,
} from "@/lib/notification-destination";

interface NotificationEntryProps {
  className?: string;
  notification: ResponseNotificationDto;
  isUnread?: boolean;
}

export const NotificationEntry = ({
  className,
  notification,
  isUnread: isUnreadProp,
}: NotificationEntryProps) => {
  const { t } = useTranslation("notifications");
  const onPress = () => {
    navigateToNotificationDestination(getNotificationDestination(notification));
  };

  const isNewSignin = notification.type === NotificationType.NEW_SIGNIN;

  //profile picture side-effect
  const { uploads: profileUploads } = useServerImages({
    ids: isNewSignin ? [] : [notification.payload?.pictureId],
    fallbacks: ["?", ""],
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 100, height: 100 },
  });
  const profilePictureSource = profileUploads?.[0];
  const isUnread = isUnreadProp ?? !notification.readAt;

  const imageSource = isNewSignin
    ? require("@/assets/images/new-signin.png")
    : profilePictureSource
      ? profilePictureSource
      : require("@/assets/images/icon.png");

  return (
    <Pressable
      className={cn(
        "flex flex-row items-center gap-2 px-2 py-1 rounded-xl",
        isUnread ? "bg-primary/10" : "bg-transparent",
        className,
      )}
      onPress={onPress}
    >
      <Image className="w-16 h-16 rounded-full" source={imageSource} />
      <View className="relative flex flex-col gap-2 px-2 py-1 flex-1">
        <HTMLText
          variant="large"
          className={isUnread ? "text-primary font-bold" : undefined}
        >
          {t(`titles.${notification.type}`)}
        </HTMLText>
        <HTMLText
          variant="muted"
          className={cn("-mt-2", isUnread && "text-foreground font-medium")}
        >
          {t(
            `descriptions.${notification.type}`,
            notification.payload,
          ).toString()}
        </HTMLText>
        <Text variant={"muted"} className="ml-auto">
          {timeAgo(notification.createdAt)}
        </Text>
        {isUnread && (
          <View className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-primary" />
        )}
      </View>
    </Pressable>
  );
};
