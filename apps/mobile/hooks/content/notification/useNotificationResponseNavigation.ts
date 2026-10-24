import React from "react";
import { Notifications } from "@/lib/notification";
import {
  navigateToNotificationDestination,
  parseNotificationNavData,
} from "@/lib/notification-destination";

/**
 * Navigates to the screen encoded in a notification's `data` when the user
 * taps an OS banner (foreground, background, or cold start).
 */
export function useNotificationResponseNavigation(enabled = true) {
  React.useEffect(() => {
    if (!enabled || !Notifications) return;

    let handledResponseId: string | null = null;
    let coldStartTimer: ReturnType<typeof setTimeout> | null = null;

    const handleResponse = (
      response: {
        notification: {
          request: {
            identifier: string;
            content: { data?: Record<string, unknown> };
          };
        };
      } | null,
      { defer = false }: { defer?: boolean } = {},
    ) => {
      if (!response) return;
      const responseId = response.notification.request.identifier;
      if (handledResponseId === responseId) return;
      handledResponseId = responseId;

      const destination = parseNotificationNavData(
        response.notification.request.content.data,
      );
      if (!destination) return;

      if (defer) {
        // Cold start: wait for the main stack to finish mounting.
        coldStartTimer = setTimeout(() => {
          navigateToNotificationDestination(destination);
        }, 400);
        return;
      }

      navigateToNotificationDestination(destination);
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => handleResponse(response),
    );

    void Notifications.getLastNotificationResponseAsync().then((response) =>
      handleResponse(response, { defer: true }),
    );

    return () => {
      subscription.remove();
      if (coldStartTimer) clearTimeout(coldStartTimer);
    };
  }, [enabled]);
}
