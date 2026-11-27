import { useChatConfig, useLayoutConfig } from "@softsurgery/contexts";
import { ChatContext } from "@/contexts/ChatContext";
import {
  ChatConfigProvider,
  presentChatMessageNotification,
} from "@softsurgery/chat-materials/mobile";
import { NotificationContext } from "@/contexts/NotificationsContext";
import { useChat, useChatPendingSync } from "api-client/hooks/chat";
import { useLiveGeolocation } from "api-client/hooks/geolocation";
import { useColorPalette } from "@softsurgery/mobile-hooks";
import { useNotifications } from "api-client/hooks/content/notification/useNotifications";
import { useCheckHealth } from "api-client/hooks/content/useCheckHealth";
import { useMobilePresence } from "@/hooks/content/users/useMobilePresence";
import { useAuthPersistStore } from "@softsurgery/hooks/stores";
import { Stack } from "expo-router";
import {
  NotificationConfigProvider,
  Notifications,
  useNotificationResponseNavigation,
  type NotificationConfig,
} from "@softsurgery/notification-materials/mobile";
import React from "react";
import { ActiveMapSessionContext } from "@/contexts/ActiveMapSessionContext";
import { useActiveSessions } from "api-client/hooks/content/sessions/useActiveSessions";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationType } from "api-client";
import {
  getChatNotificationDestination,
  getNotificationDestination,
} from "@/lib/notification-destination";

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const GEOLOCATION_JOIN = ["user", "user.industries", "user.sessions"];

export default function MainLayout() {
  const queryClient = useQueryClient();
  const { palette } = useColorPalette();
  const authPersistStore = useAuthPersistStore();
  useLiveGeolocation({
    enabled: authPersistStore.isAuthenticated,
    join: GEOLOCATION_JOIN,
    subscribe: false,
  });
  useCheckHealth({
    enabled: authPersistStore.isAuthenticated,
  });
  useMobilePresence({
    enabled: authPersistStore.isAuthenticated,
  });
  useNotificationResponseNavigation(authPersistStore.isAuthenticated);

  const chatConfig = useChatConfig();
  const { count: chatCount, resetCount: resetChatCount } = useChat({
    enabled: authPersistStore.isAuthenticated,
    onIncomingMessageNotification: (input) =>
      presentChatMessageNotification({
        ...input,
        getDestination: getChatNotificationDestination,
      }),
  });
  useChatPendingSync();

  const notificationConsequences = React.useMemo(
    () => ({
      [NotificationType.TEST]: () => {},
      [NotificationType.NEW_SIGNIN]: () => {},
      [NotificationType.NEW_MESSAGE]: () => {},
      [NotificationType.REQUEST_RECEIVED]: () => {
        queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      },
      [NotificationType.REQUEST_ACCEPTED]: () => {
        queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
      },
      [NotificationType.REQUEST_REJECTED]: () => {
        queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
      },
      [NotificationType.REQUEST_CANCELLED]: () => {
        queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
        queryClient.invalidateQueries({ queryKey: ["outgoing-requests"] });
        queryClient.invalidateQueries({ queryKey: ["request"] });
      },
    }),
    [queryClient],
  );

  const {
    count: notificationCount,
    notifications,
    resetCount: resetNotificationCount,
  } = useNotifications({
    enabled: authPersistStore.isAuthenticated,
    consequences: notificationConsequences,
    getDestination: getNotificationDestination,
  });

  const { mapSession, isSessionsPending } = useActiveSessions({
    enabled: authPersistStore.isAuthenticated,
  });

  React.useEffect(() => {
    queryClient.invalidateQueries();
  }, []);

  const { safeAreaClassNames, applicationHeaderClassNames, hasBackground } =
    useLayoutConfig();
  const notificationConfig = React.useMemo<NotificationConfig>(
    () => ({
      hasBackground,
      safeAreaClassNames,
      applicationHeaderClassNames,
      getNotificationDestination,
      fallbackImageSource: require("@/assets/images/icon.png"),
      typeImageSources: {
        [NotificationType.NEW_SIGNIN]: require("@/assets/images/new-signin.png"),
      },
    }),
    [hasBackground, safeAreaClassNames, applicationHeaderClassNames],
  );

  const activeMapSessionValue = React.useMemo(
    () => ({
      activeSession: mapSession,
      initialized: !isSessionsPending,
    }),
    [mapSession, isSessionsPending],
  );

  const notificationContextValue = React.useMemo(
    () => ({
      count: notificationCount,
      notifications,
      resetCount: resetNotificationCount,
    }),
    [notificationCount, notifications, resetNotificationCount],
  );

  const chatContextValue = React.useMemo(
    () => ({
      count: chatCount,
      resetCount: resetChatCount,
    }),
    [chatCount, resetChatCount],
  );

  return (
    <ActiveMapSessionContext.Provider value={activeMapSessionValue}>
      <NotificationContext.Provider value={notificationContextValue}>
        <NotificationConfigProvider value={notificationConfig}>
        <ChatContext.Provider value={chatContextValue}>
          <ChatConfigProvider value={chatConfig}>
          <Stack
            screenOptions={{
              contentStyle: {
                flex: 1,
                backgroundColor: "transparent",
              },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: "",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            {/* Main Application */}
            <Stack.Screen
              name="(tabs)"
              options={{
                title: "explore",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="explore/session-starter"
              options={{
                title: "sessionStarter",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="sessions/index"
              options={{
                title: "sessions",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="sessions/details"
              options={{
                title: "sessionDetails",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="sessions/manage"
              options={{
                title: "manageSession",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="explore/users-filter"
              options={{
                title: "userFilters",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />

            {/* *************************************************************************************************** */}
            {/* Notification  ************************************************************************************* */}
            <Stack.Screen
              name="notifications"
              options={{
                title: "notifications",
                headerShown: false,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Profile ********************************************************************************************* */}
            <Stack.Screen
              name="profile/inspect-profile"
              options={{
                title: "inspectProfile",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/update-profile"
              options={{
                title: "profile",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/create-experience"
              options={{
                title: "experience",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/update-experience"
              options={{
                title: "editExperience",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/delete-experience"
              options={{
                title: "deleteExperience",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/create-education"
              options={{
                title: "createEducation",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/update-education"
              options={{
                title: "editEducation",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/delete-education"
              options={{
                title: "deleteEducation",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/industries"
              options={{
                title: "industries",
                headerShown: false,
              }}
            />
            {/* <Stack.Screen
              name="profile/objectives"
              options={{
                title: "Objectives",
                headerShown: false,
              }}
            /> */}
            <Stack.Screen
              name="profile/user-calendar"
              options={{
                title: "calendar",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/devices"
              options={{
                title: "devices",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/device-details"
              options={{
                title: "deviceDetails",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/device-connections"
              options={{
                title: "deviceConnections",
                headerShown: false,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Chat  ********************************************************************************************* */}
            <Stack.Screen
              name="chat"
              options={{
                title: "chat",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/conversation"
              options={{
                title: "",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/conversation-details"
              options={{
                title: "conversationDetails",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/conversation-search"
              options={{
                title: "conversationSearch",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/report-conversation"
              options={{
                title: "reportConversation",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="chat/conversation-resource-details"
              options={{
                title: "mediaFilesLinks",
                headerShown: false,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Settings  ****************************************************************************************** */}
            <Stack.Screen
              name="profile/email-success"
              options={{
                title: "emailChangedSuccess",
                headerShown: false,
                animation: "simple_push",
                animationDuration: 200,
              }}
            />

            <Stack.Screen
              name="settings/report-bug"
              options={{
                title: "settings.reportBug",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="settings/send-feedback"
              options={{
                title: "settings.sendFeedback",
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="settings/support"
              options={{
                title: "settings.support",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="settings/index"
              options={{
                title: "settings.title",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/faqs"
              options={{
                title: "faq",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/terms"
              options={{
                title: "settings.termsOfService",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/privacy-policy"
              options={{
                title: "settings.privacyPolicy",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/verify-email"
              options={{
                title: "verifyEmail",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/about"
              options={{
                title: "aboutInstanct",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/theme"
              options={{
                title: "settings.theme",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="settings/language"
              options={{
                title: "settings.language",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            {/* <Stack.Screen
              name="profile/sessions/details"
              options={{
                title: "Sessions",
                headerShown: false,
              }}
            /> */}
            <Stack.Screen
              name="profile/privacy-security"
              options={{
                title: "privacySecurity",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/change-email"
              options={{
                title: "changeEmail",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/change-password"
              options={{
                title: "changePassword",
                headerShown: false,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Map  ****************************************************************************************** */}
            <Stack.Screen
              name="maps/map-settings"
              options={{
                title: "mapSettings",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
                gestureEnabled: false,
              }}
            />
            {/* Request  ********************************************************************************************* */}

            <Stack.Screen
              name="request/new-request"
              options={{
                title: "sendRequest",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="request/answer"
              options={{
                title: "acceptRequest",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            {/* *************************************************************************************************** */}
            {/* Utils  ********************************************************************************************* */}

            <Stack.Screen
              name="new-signin"
              options={{
                title: "New sign-in",
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />

            {/* *************************************************************************************************** */}
            {/* Test  ********************************************************************************************* */}
            <Stack.Screen
              name="test"
              options={{
                headerShown: false,
                title: "Try Anything",
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="test/deep-link-test"
              options={{
                headerShown: false,
                title: "Deep Link Test",
                animation: "fade_from_bottom",
                animationDuration: 200,
              }}
            />
          </Stack>
          </ChatConfigProvider>
        </ChatContext.Provider>
        </NotificationConfigProvider>
      </NotificationContext.Provider>
    </ActiveMapSessionContext.Provider>
  );
}
