import type { ResponseUserDeviceDto } from "@softsurgery/api-client";

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
 * Returns a human-readable device display name with a sensible fallback.
 */
export function getDeviceDisplayName(
  device?: ResponseUserDeviceDto | null,
  fallback = "Device",
): string {
  return device?.deviceName?.trim() || device?.os?.trim() || fallback;
}

/**
 * Returns a secondary descriptor / subtitle for a device.
 */
export function getDeviceSubtitle(
  device?: ResponseUserDeviceDto | null,
  fallback = "Device",
): string {
  return device?.os?.trim() || fallback;
}

/**
 * Checks whether the given device is the current device by comparing MAC addresses.
 */
export function isCurrentDevice(
  device?: { macAddress?: string | null } | null,
  currentMacAddress?: string | null,
): boolean {
  if (!device?.macAddress || !currentMacAddress) return false;
  return (
    device.macAddress.trim().toLowerCase() ===
    currentMacAddress.trim().toLowerCase()
  );
}

/**
 * Resolves the current device from a list of devices based on MAC address.
 * Falls back to the first device in the list if no match is found or if the MAC address is not available.
 * Returns undefined if the devices list is empty or not provided.
 */
export function getCurrentDevice<T extends { macAddress?: string | null }>(
  devices?: T[] | null,
  currentMacAddress?: string | null,
): T | undefined {
  if (!devices || devices.length === 0) return undefined;
  if (!currentMacAddress) return devices[0];

  return (
    devices.find((d) => isCurrentDevice(d, currentMacAddress)) || devices[0]
  );
}

export const findCurrentDevice = getCurrentDevice;

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
    const parts = device.location
      .split(",")
      .map((p: string) => parseFloat(p.trim()));
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
