import { createHash } from "crypto";

export interface ParsedUserAgent {
  device: string;
  os: string;
}

export interface GeolocationResult {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
}

/**
 * Parses user agent string to identify client device category and operating system.
 */
export function parseDeviceUserAgent(userAgent?: string): ParsedUserAgent {
  if (!userAgent) {
    return { device: "Mobile Device", os: "iOS / Android" };
  }

  const ua = userAgent.toLowerCase();
  let device = "Mobile Device";
  let os = "iOS / Android";

  if (
    ua.includes("iphone") ||
    ua.includes("cfnetwork") ||
    ua.includes("darwin")
  ) {
    device = "iPhone";
    os = "iOS";
    const match = userAgent.match(/iPhone\s?([^;)]+)/i);
    if (match && match[0]) {
      device = match[0].trim();
    }
  } else if (ua.includes("ipad")) {
    device = "iPad";
    os = "iPadOS";
  } else if (
    ua.includes("android") ||
    ua.includes("okhttp") ||
    ua.includes("dalvik")
  ) {
    device = "Android Device";
    os = "Android";
  } else if (ua.includes("macintosh") || ua.includes("mac os")) {
    device = "MacBook";
    os = "macOS";
  } else if (ua.includes("windows")) {
    device = "Windows PC";
    os = "Windows";
  } else if (ua.includes("linux")) {
    device = "Linux PC";
    os = "Linux";
  }

  return { device, os };
}

/**
 * Normalizes a MAC string into standard xx:xx:xx:xx:xx:xx format.
 */
export function formatAsMacAddress(seed: string): string {
  const macRegex = /^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/;
  if (macRegex.test(seed)) {
    return seed.replace(/-/g, ":").toLowerCase();
  }
  const clean = seed.replace(/[^0-9a-fA-F]/g, "");
  const padded = clean.padEnd(12, "0").slice(0, 12);
  const octets = padded.match(/.{1,2}/g);
  return (octets || ["00", "00", "00", "00", "00", "00"])
    .join(":")
    .toLowerCase();
}

/**
 * Generates a stable, reproducible MAC address for clients where hardware MAC access is unavailable.
 */
export function generateDeterministicMacAddress(seed: string): string {
  const hash = createHash("sha256").update(seed).digest();
  const bytes = Buffer.from(hash.subarray(0, 6));
  bytes[0] = (bytes[0] & 0xfe) | 0x02; // locally administered, unicast
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":");
}

/**
 * Extracts and normalizes client IP address from an HTTP request or WebSocket socket.
 */
export function extractClientIp(source?: any): string {
  if (!source) return "127.0.0.1";

  const headers =
    source.headers ||
    source.handshake?.headers ||
    source.req?.headers ||
    {};

  const forwarded =
    (headers["x-forwarded-for"] as string) ||
    (headers["x-real-ip"] as string) ||
    "";

  const rawIp =
    forwarded.split(",")[0]?.trim() ||
    source.handshake?.address ||
    source.conn?.remoteAddress ||
    source.request?.socket?.remoteAddress ||
    source.socket?.remoteAddress ||
    source.ip ||
    "127.0.0.1";

  let ip = rawIp;
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }
  if (ip === "::1") {
    ip = "127.0.0.1";
  }
  return ip;
}

/**
 * Resolves geolocation data for a public IP address via IP-API.
 */
export async function resolveIpGeolocation(
  ip: string,
): Promise<GeolocationResult | null> {
  if (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "localhost" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  ) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`,
      { signal: controller.signal },
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = (await res.json()) as {
        status?: string;
        country?: string;
        city?: string;
        lat?: number;
        lon?: number;
      };

      if (data && data.status === "success") {
        const city = data.city;
        const country = data.country;
        const location =
          city && country ? `${city}, ${country}` : country || city;
        return {
          city,
          country,
          latitude: data.lat,
          longitude: data.lon,
          location,
        };
      }
    }
  } catch {
    // Fail silently on timeout or network error
  }
  return null;
}
