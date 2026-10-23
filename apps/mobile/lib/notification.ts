import { Platform } from "react-native";
import { cacheDirectory, downloadAsync } from "expo-file-system/legacy";
import type { NotificationDestination } from "@/lib/notification-destination";
import { destinationToNavData } from "@/lib/notification-destination";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";

export let Notifications: typeof import("expo-notifications") | null = null;
try {
  Notifications = require("expo-notifications");
} catch {
  // expo-notifications may be unavailable in some environments
}

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

export async function requestNotificationPermissions() {
  if (!Notifications) return;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("Notification permissions not granted");
  }
}

export async function createAndroidChannel() {
  if (Platform.OS === "android" && Notifications) {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

/**
 * Downloads a profile picture into the cache so it can be attached to a
 * local notification (iOS attachments / Android large-icon when supported).
 */
export async function resolveNotificationAvatarUri(
  pictureId?: number | string | null,
): Promise<string | null> {
  if (pictureId == null || pictureId === "") return null;
  if (!BASE_URL || !cacheDirectory) return null;

  const accessToken = useAuthPersistStore.getState().accessToken;
  if (!accessToken) return null;

  const localUri = `${cacheDirectory}notif-avatar-${pictureId}.jpg`;
  try {
    const result = await Promise.race([
      downloadAsync(`${BASE_URL}/storage/view/id/${pictureId}`, localUri, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2_500)),
    ]);

    if (!result || typeof result !== "object" || !("uri" in result)) {
      return null;
    }
    return result.uri;
  } catch (error) {
    console.warn("[notif] failed to download avatar:", error);
    return null;
  }
}

export type PresentLocalNotificationInput = {
  title: string;
  body: string;
  destination?: NotificationDestination | null;
  data?: Record<string, unknown>;
  sound?: boolean;
  /** Profile / media upload id — downloaded and shown beside the notification. */
  pictureId?: number | string | null;
  /** Pre-resolved local or remote image URI for the notification. */
  imageUri?: string | null;
};

/** Android / Expo Go require notification `data` values to be strings. */
function stringifyNotificationData(
  data: Record<string, unknown>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;
    result[key] = typeof value === "string" ? value : JSON.stringify(value);
  }
  return result;
}

/**
 * Schedules an immediate local OS notification and attaches navigation
 * destination data so taps can open the right screen.
 * Optionally includes a user/media image (avatar).
 */
export async function presentLocalNotification({
  title,
  body,
  destination,
  data = {},
  sound = true,
  pictureId,
  imageUri,
}: PresentLocalNotificationInput) {
  if (!Notifications) return;

  const navData = destinationToNavData(destination);
  const resolvedImageUri =
    imageUri ?? (await resolveNotificationAvatarUri(pictureId));

  // iOS shows attachments as the notification image; Android local notifications
  // have limited custom-avatar support in Expo Go, so we still attach when
  // possible and always put the sender name + message in title/body.
  const attachments = resolvedImageUri
    ? [
        {
          identifier: "avatar",
          url: resolvedImageUri,
          type: "image",
          typeHint: "public.jpeg",
        },
      ]
    : undefined;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound,
      data: stringifyNotificationData({
        ...navData,
        ...data,
        ...(resolvedImageUri ? { imageUri: resolvedImageUri } : {}),
        ...(pictureId != null ? { pictureId: String(pictureId) } : {}),
      }),
      ...(attachments ? { attachments } : {}),
      ...(Platform.OS === "android"
        ? { priority: Notifications.AndroidNotificationPriority.HIGH }
        : {}),
    },
    trigger: null,
  });
}
