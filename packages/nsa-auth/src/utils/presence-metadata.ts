import {
  extractClientIp,
  formatAsMacAddress,
  generateDeterministicMacAddress,
  parseDeviceUserAgent,
  resolveIpGeolocation,
} from "./device-metadata.util";

export {
  extractClientIp,
  formatAsMacAddress,
  generateDeterministicMacAddress,
  parseDeviceUserAgent,
  resolveIpGeolocation,
};

export interface PresenceMetadata {
  device: string;
  deviceModel?: string;
  os: string;
  macAddress: string;
  ipAddress: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  userAgent?: string;
}

export interface ClientConnectionPayload {
  device?: string;
  deviceModel?: string;
  os?: string;
  macAddress?: string;
}

export interface PresenceSocketLike {
  handshake?: {
    headers?: Record<string, unknown>;
    auth?: Record<string, unknown>;
    query?: Record<string, unknown>;
    address?: string;
  };
  headers?: Record<string, unknown>;
  conn?: { remoteAddress?: string };
  request?: { socket?: { remoteAddress?: string } };
  ip?: string;
  data?: Record<string, unknown>;
}

/**
 * Detects device, IP address, and IP-based geolocation for incoming WebSocket connections.
 */
export async function detectPresenceMetadata(
  socket?: PresenceSocketLike | null,
  explicitPayload?: ClientConnectionPayload,
): Promise<PresenceMetadata> {
  const headers = socket?.handshake?.headers || socket?.headers || {};
  const auth = socket?.handshake?.auth || {};
  const query = socket?.handshake?.query || {};
  const userAgent = (headers["user-agent"] as string) || "";

  const parsedUa = parseDeviceUserAgent(userAgent);

  const device =
    explicitPayload?.device ||
    (auth.device as string) ||
    (headers["x-device-name"] as string) ||
    (query.device as string) ||
    parsedUa.device;

  const deviceModel =
    explicitPayload?.deviceModel ||
    (auth.deviceModel as string) ||
    (headers["x-device-model"] as string) ||
    (query.deviceModel as string) ||
    undefined;

  const os =
    explicitPayload?.os ||
    (auth.os as string) ||
    (headers["x-os-name"] as string) ||
    (query.os as string) ||
    parsedUa.os;

  const ipAddress = extractClientIp(socket);
  const geo = await resolveIpGeolocation(ipAddress);
  const latitude = geo?.latitude;
  const longitude = geo?.longitude;
  const location =
    geo?.location ||
    (latitude !== undefined && longitude !== undefined
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : "Unknown Location");

  const rawMac =
    explicitPayload?.macAddress ||
    (auth.macAddress as string) ||
    (headers["x-mac-address"] as string) ||
    (headers["x-device-mac"] as string) ||
    (query.macAddress as string) ||
    (query.mac as string);

  let macAddress: string;
  if (rawMac && rawMac.trim().length > 0) {
    macAddress = formatAsMacAddress(rawMac.trim());
  } else {
    const clientIdentifier =
      socket?.data?.userId || auth?.userId || auth?.token || ipAddress;
    macAddress = generateDeterministicMacAddress(
      `${clientIdentifier}:${device}:${os}:${userAgent}`,
    );
  }

  return {
    device,
    deviceModel,
    os,
    macAddress,
    ipAddress,
    latitude,
    longitude,
    location,
    userAgent,
  };
}
