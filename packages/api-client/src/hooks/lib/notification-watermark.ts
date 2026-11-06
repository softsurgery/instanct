const BG_NOTIFICATIONS_LAST_SEEN_KEY = "bg-notifications-last-seen";

async function advanceTimestampWatermark(
  key: string,
  createdAt: string | Date | undefined | null,
) {
  if (!createdAt) return;
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    const timestamp = new Date(createdAt).getTime();
    if (!Number.isFinite(timestamp)) return;
    const existingRaw = await AsyncStorage.getItem(key);
    const existing = existingRaw ? Number(existingRaw) : 0;
    if (timestamp > existing) {
      await AsyncStorage.setItem(key, String(timestamp));
    }
  } catch {
    // ignore storage failures
  }
}

export async function advanceNotificationWatermark(
  createdAt: string | Date | undefined | null,
) {
  await advanceTimestampWatermark(BG_NOTIFICATIONS_LAST_SEEN_KEY, createdAt);
}
