import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Reads an ISO timestamp watermark from AsyncStorage.
 */
export async function getTimestampWatermark(
  storageKey: string,
): Promise<Date | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn("[bg] failed to read watermark:", storageKey, error);
    return null;
  }
}

/**
 * Writes an ISO timestamp watermark to AsyncStorage.
 */
export async function setTimestampWatermark(
  storageKey: string,
  date: Date,
): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey, date.toISOString());
  } catch (error) {
    console.warn("[bg] failed to write watermark:", storageKey, error);
  }
}

/**
 * Advances a timestamp watermark if `createdAt` is newer than the stored value.
 */
export async function advanceTimestampWatermark(
  storageKey: string,
  createdAt: string | Date | undefined | null,
): Promise<void> {
  if (!createdAt) return;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return;

  const lastSeenAt = await getTimestampWatermark(storageKey);
  if (lastSeenAt && created <= lastSeenAt) return;

  await setTimestampWatermark(storageKey, created);
}

/**
 * Returns the newest date among items, or `fallback` when the list is empty.
 */
export function newestTimestamp(
  dates: Array<string | Date | null | undefined>,
  fallback: Date = new Date(0),
): Date {
  return dates.reduce<Date>((latest, value) => {
    if (value == null) return latest;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return latest;
    return date > latest ? date : latest;
  }, fallback);
}
