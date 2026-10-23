import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_MAC_STORAGE_KEY = "instanct_device_mac_address";

let cachedDeviceMac: string | null = null;

/**
 * Validates and normalizes any hex string or hardware ID into a standard 6-octet MAC address:
 * "xx:xx:xx:xx:xx:xx".
 */
export function formatAsMacAddress(seed: string): string {
  const macRegex = /^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/;
  if (macRegex.test(seed)) {
    return seed.replace(/-/g, ":").toLowerCase();
  }

  const cleanHex = seed.replace(/[^0-9a-fA-F]/g, "");
  const paddedHex = cleanHex.padEnd(12, "0").slice(0, 12);
  const octets = paddedHex.match(/.{1,2}/g);
  return (octets || ["00", "00", "00", "00", "00", "00"]).join(":").toLowerCase();
}

/**
 * Retrieves a persistent, hardware-unique MAC address identifier for this device.
 *
 * Uses official platform hardware APIs:
 * - Android: `Application.getAndroidId()` (Unique Android ID)
 * - iOS: `Application.getIosIdForVendorAsync()` (Identifier for Vendor - IDFV)
 * - Fallback / Simulator: Cryptographically secure random UUID
 *
 * Hashes the hardware seed into a persistent standard MAC address ("xx:xx:xx:xx:xx:xx")
 * and stores it in `expo-secure-store` (iOS Keychain / Android EncryptedSharedPreferences).
 */
export async function getDeviceMacAddress(): Promise<string> {
  if (cachedDeviceMac) {
    return cachedDeviceMac;
  }

  try {
    const storedMac = await SecureStore.getItemAsync(DEVICE_MAC_STORAGE_KEY);
    if (storedMac && storedMac.trim().length > 0) {
      const normalized = formatAsMacAddress(storedMac);
      cachedDeviceMac = normalized;
      return normalized;
    }
  } catch (error) {
    console.warn("SecureStore read error during device MAC lookup:", error);
  }

  let platformId: string | null = null;

  try {
    if (Platform.OS === "android") {
      platformId = Application.getAndroidId();
    } else if (Platform.OS === "ios") {
      platformId = await Application.getIosIdForVendorAsync();
    }
  } catch (error) {
    console.warn("Error reading platform hardware identifier:", error);
  }

  const hardwareSeed = platformId && platformId.trim().length > 0 ? platformId : Crypto.randomUUID();

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    hardwareSeed,
  );

  const macAddress = formatAsMacAddress(hash);

  try {
    await SecureStore.setItemAsync(DEVICE_MAC_STORAGE_KEY, macAddress);
  } catch (error) {
    console.warn("Failed to persist device MAC into SecureStore:", error);
  }

  cachedDeviceMac = macAddress;
  return macAddress;
}
