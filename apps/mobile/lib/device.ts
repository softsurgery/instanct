import type { UserDevice } from "@softsurgery/api-client";

export const waitForUiReady = () =>
  // It returns a Promise that resolves only after:
  // All ongoing user interactions/animations are finished
  // The JS thread is free of “high priority” UI work
  // The next frame has been scheduled and painted
  new Promise<void>((resolve) => {
    setTimeout(() => {
      requestAnimationFrame(() => resolve());
    }, 10);
  });

/**
 * Common shape for device data across screens and components.
 */
export type DeviceLike = Partial<UserDevice> & {
  lastSignInAt?: string | Date | null;
  time?: string | null;
};

/**
 * Returns a human-readable device display name with a sensible fallback.
 */
export function getDeviceDisplayName(
  device?: DeviceLike | null,
  fallback = "Device",
): string {
  return device?.deviceName?.trim() || device?.os?.trim() || fallback;
}

/**
 * Returns a secondary descriptor / subtitle for a device.
 */
export function getDeviceSubtitle(
  device?: DeviceLike | null,
  fallback = "Device",
): string {
  return device?.os?.trim() || fallback;
}

/**
 * Checks whether the given device is the current device by comparing fingerprints.
 */
export function isCurrentDevice(
  device?: DeviceLike | null,
  currentDeviceId?: string | null,
): boolean {
  return !!(
    device?.fingerprint &&
    currentDeviceId &&
    device.fingerprint === currentDeviceId
  );
}

/**
 * Parses numeric latitude/longitude coordinates from a device object or its location string.
 */
export function parseDeviceCoordinates(
  device?: DeviceLike | null,
): { latitude: number; longitude: number } | null {
  if (!device) return null;

  const lat =
    typeof device.latitude === "string"
      ? parseFloat(device.latitude)
      : device.latitude;
  const lng =
    typeof device.longitude === "string"
      ? parseFloat(device.longitude)
      : device.longitude;

  if (
    lat != null &&
    lng != null &&
    !(lat === 0 && lng === 0) &&
    !isNaN(lat) &&
    !isNaN(lng)
  ) {
    return { latitude: lat, longitude: lng };
  }

  if (device.location) {
    const parts = device.location.split(",").map((p) => parseFloat(p.trim()));
    if (
      parts.length === 2 &&
      !isNaN(parts[0]) &&
      !isNaN(parts[1]) &&
      Math.abs(parts[0]) <= 90 &&
      Math.abs(parts[1]) <= 180
    ) {
      return { latitude: parts[0], longitude: parts[1] };
    }
  }

  return null;
}
