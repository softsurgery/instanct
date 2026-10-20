import { randomBytes } from 'crypto';
import { AdvancedRequest } from '@softsurgery/nsa-helpers/http';

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

export function formatAsMacAddress(seed: string): string {
  const macRegex = /^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/;
  if (macRegex.test(seed)) {
    return seed.replace(/-/g, ':').toLowerCase();
  }
  const clean = seed.replace(/[^0-9a-fA-F]/g, '');
  const padded = clean.padEnd(12, '0').slice(0, 12);
  const octets = padded.match(/.{1,2}/g);
  return (octets || ['00', '00', '00', '00', '00', '00']).join(':').toLowerCase();
}

export function generateRandomMacAddress(): string {
  const bytes = randomBytes(6);
  bytes[0] = (bytes[0] & 0xfe) | 0x02;
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(':');
}

function parseUserAgent(userAgent?: string): { device: string; os: string } {
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

async function resolveIpGeo(ip: string): Promise<{
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
    ip.startsWith('172.')
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
    // Ignore geo-ip lookup timeouts or failures
  }
  return null;
}

export async function getSigninMetadata(
  req: AdvancedRequest,
  bodyParams?: {
    device?: string;
    os?: string;
    macAddress?: string;
    mac?: string;
  },
): Promise<SigninMetadata> {
  const headers = req.headers || {};
  const userAgent = (headers['user-agent'] as string) || '';
  const parsedUa = parseUserAgent(userAgent);

  const device =
    bodyParams?.device ||
    (headers['x-device-name'] as string) ||
    parsedUa.device;

  const os = bodyParams?.os || (headers['x-os-name'] as string) || parsedUa.os;

  const ipRaw =
    (headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  let ip = ipRaw;
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  const geo = await resolveIpGeo(ip);
  const latitude = geo?.latitude;
  const longitude = geo?.longitude;
  const location =
    geo?.location ||
    (latitude !== undefined && longitude !== undefined
      ? `${latitude}, ${longitude}`
      : 'Unknown Location');

  const rawMac =
    bodyParams?.macAddress ||
    bodyParams?.mac ||
    (headers['x-mac-address'] as string) ||
    (headers['x-device-mac'] as string);

  let macAddress: string;

  if (rawMac && rawMac.trim().length > 0) {
    macAddress = formatAsMacAddress(rawMac.trim());
  } else {
    macAddress = generateRandomMacAddress();
  }

  const now = new Date();
  const time = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const when = 'Just now';

  return {
    device,
    os,
    ip,
    latitude,
    longitude,
    location,
    time,
    when,
    macAddress,
  };
}
