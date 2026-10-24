import { AdvancedRequest } from "@softsurgery/nsa-helpers/http";
import {
  extractClientIp,
  formatAsMacAddress,
  generateDeterministicMacAddress,
  parseDeviceUserAgent,
  resolveIpGeolocation,
} from "./device-metadata.util";

export {
  formatAsMacAddress,
  generateDeterministicMacAddress,
  parseDeviceUserAgent as parseUserAgent,
  resolveIpGeolocation as resolveIpGeo,
};

export interface SigninMetadata {
  device: string;
  os: string;
  ip: string;
  latitude?: number;
  longitude?: number;
  location: string;
  time: string;
  when: string;
  macAddress: string;
}

export interface SigninBodyParams {
  device?: string;
  os?: string;
  macAddress?: string;
  mac?: string;
  usernameOrEmail?: string;
  email?: string;
}

export async function getSigninMetadata(
  req: AdvancedRequest,
  bodyParams?: SigninBodyParams,
): Promise<SigninMetadata> {
  const headers = req.headers || {};
  const userAgent = (headers["user-agent"] as string) || "";
  const parsedUa = parseDeviceUserAgent(userAgent);

  const device =
    bodyParams?.device ||
    (headers["x-device-name"] as string) ||
    parsedUa.device;

  const os = bodyParams?.os || (headers["x-os-name"] as string) || parsedUa.os;
  const ip = extractClientIp(req);

  const geo = await resolveIpGeolocation(ip);
  const latitude = geo?.latitude;
  const longitude = geo?.longitude;
  const location =
    geo?.location ||
    (latitude !== undefined && longitude !== undefined
      ? `${latitude}, ${longitude}`
      : "Unknown Location");

  const rawMac =
    bodyParams?.macAddress ||
    bodyParams?.mac ||
    (headers["x-mac-address"] as string) ||
    (headers["x-device-mac"] as string);

  let macAddress: string;
  if (rawMac && rawMac.trim().length > 0) {
    macAddress = formatAsMacAddress(rawMac.trim());
  } else {
    const clientIdentifier =
      req.user?.sub || bodyParams?.usernameOrEmail || bodyParams?.email || ip;
    macAddress = generateDeterministicMacAddress(
      `${clientIdentifier}:${device}:${os}:${userAgent}`,
    );
  }

  const now = new Date();
  const time = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    device,
    os,
    ip,
    latitude,
    longitude,
    location,
    time,
    when: "Just now",
    macAddress,
  };
}
