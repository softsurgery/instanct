import React from "react";
import {
  ApplicationHeader,
  StableSafeAreaView,
} from "@softsurgery/mobile-components";
import { cn } from "@softsurgery/lib";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { ActivitiesDetailContent } from "./ActivitiesDetailContent";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/contexts/NotificationsContext";
import { IconMessageChatbot } from "@tabler/icons-react-native";
import { useScrollableElement } from "@softsurgery/mobile-hooks";
import { useChatContext } from "@/contexts/ChatContext";

interface ActivitiesPortalProps {
  className?: string;
}

export const ActivitiesPortal = ({ className }: ActivitiesPortalProps) => {
  const { t } = useTranslation("activities");
  const { count } = useNotificationContext();
  const { count: chatCount } = useChatContext();

  const handleNotificationsPress = React.useCallback(() => {
    router.push("/main/notifications");
  }, []);

  const handleChatPress = React.useCallback(() => {
    router.push("/main/chat");
  }, []);

  const {
    animatedHeaderStyle,
    animatedContentStyle,
    handleScroll,
    onLayout,
    reset,
  } = useScrollableElement({
    deltaThreshold: 40,
    landscapeDeltaThreshold: 20,
    duration: 250,
    checkScrollable: true,
    collapseHeight: false,
  });

  return (
    <StableSafeAreaView className={cn("flex-1 bg-background", className)}>
      <View className="flex-1">
        <Animated.View
          style={[
            animatedHeaderStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            },
          ]}
        >
          <View onLayout={onLayout}>
            <ApplicationHeader
              title={t("activities.title")}
              shortcuts={[
                {
                  key: "bell",
                  icon: Bell,
                  onPress: handleNotificationsPress,
                  badgeText: count > 0 ? String(count) : undefined,
                },
                {
                  key: "chat",
                  icon: IconMessageChatbot,
                  onPress: handleChatPress,
                  badgeText: chatCount > 0 ? String(chatCount) : undefined,
                },
              ]}
            />
          </View>
        </Animated.View>
        <ActivitiesDetailContent
          handleScroll={handleScroll}
          onTabChange={reset}
          animatedTabsStyle={animatedContentStyle}
        />
      </View>
    </StableSafeAreaView>
  );
};
