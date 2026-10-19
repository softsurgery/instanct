import { createHash } from 'crypto';

export interface PresenceMetadata {
  device: string;
  deviceModel?: string;
  os: string;
  fingerprint: string;
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
  fingerprint?: string;
}

export function parseDeviceUserAgent(userAgent?: string): {
  device: string;
  os: string;
} {
  if (!userAgent) {
    return { device: 'Mobile Device', os: 'iOS / Android' };
  }

  const ua = userAgent.toLowerCase();
  let device = 'Mobile Device';
  let os = 'iOS / Android';

  if (
    ua.includes('iphone') ||
    ua.includes('cfnetwork') ||
    ua.includes('darwin')
  ) {
    device = 'iPhone';
    os = 'iOS';
    const match = userAgent.match(/iPhone\s?([^;)]+)/i);
    if (match && match[0]) {
      device = match[0].trim();
    }
  } else if (ua.includes('ipad')) {
    device = 'iPad';
    os = 'iPadOS';
  } else if (
    ua.includes('android') ||
    ua.includes('okhttp') ||
    ua.includes('dalvik')
  ) {
    device = 'Android Device';
    os = 'Android';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    device = 'MacBook';
    os = 'macOS';
  } else if (ua.includes('windows')) {
    device = 'Windows PC';
    os = 'Windows';
  } else if (ua.includes('linux')) {
    device = 'Linux PC';
    os = 'Linux';
  }

  return { device, os };
}

export async function resolveIpGeolocation(ip: string): Promise<{
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
} | null> {
  if (
    !ip ||
    ip === '127.0.0.1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.')
  ) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

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

      if (data && data.status === 'success') {
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
    // Ignore geo-ip lookup timeouts or network errors
  }
  return null;
}

/**
 * Extracts and normalizes client IP address from socket handshake or request.
 */
export function extractClientIp(socket: any): string {
  const headers = socket?.handshake?.headers || socket?.headers || {};
  const forwarded =
    (headers['x-forwarded-for'] as string) ||
    (headers['x-real-ip'] as string) ||
    '';

  const rawIp =
    forwarded.split(',')[0]?.trim() ||
    socket?.handshake?.address ||
    socket?.conn?.remoteAddress ||
    socket?.request?.socket?.remoteAddress ||
    socket?.ip ||
    '127.0.0.1';

  let ip = rawIp;
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  return ip;
}

/**
 * Comprehensive detector for socket connections: detects device, IP address, and IP-based geolocation.
 */
export async function detectPresenceMetadata(
  socket: any,
  explicitPayload?: ClientConnectionPayload,
): Promise<PresenceMetadata> {
  const headers = socket?.handshake?.headers || socket?.headers || {};
  const auth = socket?.handshake?.auth || {};
  const query = socket?.handshake?.query || {};
  const userAgent = (headers['user-agent'] as string) || '';

  const parsedUa = parseDeviceUserAgent(userAgent);

  const device =
    explicitPayload?.device ||
    (auth.device as string) ||
    (headers['x-device-name'] as string) ||
    (query.device as string) ||
    parsedUa.device;

  const deviceModel =
    explicitPayload?.deviceModel ||
    (auth.deviceModel as string) ||
    (headers['x-device-model'] as string) ||
    (query.deviceModel as string) ||
    undefined;

  const os =
    explicitPayload?.os ||
    (auth.os as string) ||
    (headers['x-os-name'] as string) ||
    (query.os as string) ||
    parsedUa.os;

  const ipAddress = extractClientIp(socket);

  // Resolve location and coordinates strictly via IP Geolocation
  const geo = await resolveIpGeolocation(ipAddress);
  const latitude = geo?.latitude;
  const longitude = geo?.longitude;
  const location =
    geo?.location ||
    (latitude !== undefined && longitude !== undefined
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : 'Unknown Location');

  const rawFingerprint =
    explicitPayload?.fingerprint ||
    (auth.fingerprint as string) ||
    (headers['x-device-fingerprint'] as string) ||
    (query.fingerprint as string) ||
    createHash('sha256')
      .update(`${device}|${os}|${userAgent || ipAddress}`)
      .digest('hex');

  return {
    device,
    deviceModel,
    os,
    fingerprint: rawFingerprint,
    ipAddress,
    latitude,
    longitude,
    location,
    userAgent,
  };
}
