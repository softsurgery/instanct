import { stringUtils, disconnectSocket } from "@softsurgery/lib";
import { NotificationType, type ResponseNotificationDto } from "api-client";
import { api } from "@/lib/api";
import {
  advanceTimestampWatermark,
  getTimestampWatermark,
  newestTimestamp,
  registerBackgroundUtilities,
  setTimestampWatermark,
  unregisterBackgroundUtilities,
  type BackgroundActivityResult,
  type NativeBackgroundTaskDefinition,
} from "@/lib/background";
import {
  connectMobilePresence,
  waitForPresenceConnection,
} from "@/lib/mobile-presence";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import {
  createAndroidChannel,
  presentLocalNotification,
  requestNotificationPermissions,
} from "@/lib/notification";
import { getNotificationDestination } from "@/lib/notification-destination";
import i18n from "@/i18n";

const PRESENCE_BACKGROUND_TASK = "INSTANCT_PRESENCE_BACKGROUND";
const NOTIFICATIONS_BACKGROUND_TASK = "INSTANCT_NOTIFICATIONS_BACKGROUND";
const BACKGROUND_RUNTIME_ID = "instanct-main";
const BG_NOTIFICATIONS_LAST_SEEN_KEY = "bg-notifications-last-seen-at";

async function syncPresenceActivity(): Promise<BackgroundActivityResult> {
  try {
    const { accessToken, isAuthenticated } = useAuthPersistStore.getState();
    if (!isAuthenticated || !accessToken) return "no-data";

    const socket = await connectMobilePresence(accessToken);
    await waitForPresenceConnection(socket);
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    return "success";
  } catch (error) {
    console.warn("[bg] presence activity failed:", error);
    try {
      disconnectSocket("presence");
    } catch {
      // ignore cleanup errors
    }
    return "failed";
  }
}

function translateNotificationField(
  field: "titles" | "descriptions",
  type: NotificationType | string,
  payload?: Record<string, unknown> | null,
) {
  const key = `${field}.${type}`;
  const fallbackKey = `${field}.fallback`;
  const interpolation = {
    ns: "notifications" as const,
    ...(payload ?? {}),
  };

  const translated = i18n.t(key, interpolation);
  if (translated === key) {
    return stringUtils.sanitizeText(
      i18n.t(fallbackKey, interpolation).toString(),
    );
  }
  return stringUtils.sanitizeText(translated.toString());
}

function notificationCopy(notification: ResponseNotificationDto) {
  return {
    title: translateNotificationField(
      "titles",
      notification.type,
      notification.payload,
    ),
    body: translateNotificationField(
      "descriptions",
      notification.type,
      notification.payload,
    ),
  };
}

async function syncNotificationsActivity(): Promise<BackgroundActivityResult> {
  try {
    const { accessToken, isAuthenticated } = useAuthPersistStore.getState();
    if (!isAuthenticated || !accessToken) return "no-data";

    await requestNotificationPermissions();
    await createAndroidChannel();

    const lastSeenAt = await getTimestampWatermark(
      BG_NOTIFICATIONS_LAST_SEEN_KEY,
    );
    const page = await api.notification.findPaginated({
      page: "1",
      limit: "20",
      sort: "createdAt,desc",
    });
    const items = page?.data ?? [];
    if (!items.length) return "no-data";

    if (!lastSeenAt) {
      await setTimestampWatermark(
        BG_NOTIFICATIONS_LAST_SEEN_KEY,
        newestTimestamp(items.map((item) => item.createdAt)),
      );
      return "no-data";
    }

    const fresh = items.filter(
      (notification) =>
        !notification.readAt && new Date(notification.createdAt) > lastSeenAt,
    );
    if (!fresh.length) return "no-data";

    for (const notification of [...fresh].reverse()) {
      const { title, body } = notificationCopy(notification);
      await presentLocalNotification({
        title,
        body,
        destination: getNotificationDestination(notification),
        data: {
          type: notification.type,
          notificationId: notification.id,
        },
      });
    }

    await setTimestampWatermark(
      BG_NOTIFICATIONS_LAST_SEEN_KEY,
      newestTimestamp(
        items.map((item) => item.createdAt),
        lastSeenAt,
      ),
    );
    return "success";
  } catch (error) {
    console.warn("[bg] notifications activity failed:", error);
    return "failed";
  }
}

const INSTANCT_BACKGROUND_TASKS: NativeBackgroundTaskDefinition[] = [
  {
    name: PRESENCE_BACKGROUND_TASK,
    activity: syncPresenceActivity,
    minimumIntervalMinutes: 15,
  },
  {
    name: NOTIFICATIONS_BACKGROUND_TASK,
    activity: syncNotificationsActivity,
    minimumIntervalMinutes: 15,
  },
];

export async function registerBackgroundActivities() {
  await registerBackgroundUtilities({
    tasks: INSTANCT_BACKGROUND_TASKS,
    appState: {
      id: BACKGROUND_RUNTIME_ID,
      backgroundPollMs: 30_000,
      foregroundPollMs: 5 * 60_000,
    },
  });
}

export async function unregisterBackgroundActivities() {
  await unregisterBackgroundUtilities({
    appStateId: BACKGROUND_RUNTIME_ID,
    taskNames: INSTANCT_BACKGROUND_TASKS.map((task) => task.name),
  });
}

export async function advanceNotificationWatermark(
  createdAt: string | Date | undefined | null,
) {
  await advanceTimestampWatermark(BG_NOTIFICATIONS_LAST_SEEN_KEY, createdAt);
}
