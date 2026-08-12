import { createHash } from 'crypto';
import { AdvancedRequest } from 'src/types';

export interface SigninMetadata {
  device: string;
  os: string;
  ip: string;
  latitude?: number;
  longitude?: number;
  location: string;
  time: string;
  when: string;
  fingerprint: string;
}

function parseUserAgent(userAgent?: string): { device: string; os: string } {
  if (!userAgent) {
    return { device: 'Mobile Device', os: 'iOS / Android' };
  }

  const ua = userAgent.toLowerCase();
  let device = 'Mobile Device';
  let os = 'iOS / Android';

  if (ua.includes('iphone')) {
    device = 'iPhone';
    os = 'iOS';
    const match = userAgent.match(/iPhone\s?([^;)]+)/i);
    if (match && match[0]) {
      device = match[0].trim();
    }
  } else if (ua.includes('ipad')) {
    device = 'iPad';
    os = 'iPadOS';
  } else if (ua.includes('android')) {
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

export function getSigninMetadata(
  req: AdvancedRequest,
  bodyParams?: {
    device?: string;
    os?: string;
    latitude?: number;
    longitude?: number;
    location?: string;
    fingerprint?: string;
  },
): SigninMetadata {
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

  const ip =
    ipRaw === '::1' || ipRaw === '::ffff:127.0.0.1' ? '127.0.0.1' : ipRaw;

  const rawLat =
    bodyParams?.latitude ??
    (headers['x-latitude']
      ? parseFloat(headers['x-latitude'] as string)
      : undefined);
  const rawLng =
    bodyParams?.longitude ??
    (headers['x-longitude']
      ? parseFloat(headers['x-longitude'] as string)
      : undefined);

  const latitude =
    typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : undefined;
  const longitude =
    typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : undefined;

  let location = bodyParams?.location || (headers['x-location'] as string);
  if (!location) {
    if (latitude !== undefined && longitude !== undefined) {
      location = `${latitude}, ${longitude}`;
    } else {
      location = 'Unknown Location';
    }
  }

  const rawFingerprint =
    bodyParams?.fingerprint ||
    (headers['x-device-fingerprint'] as string) ||
    createHash('sha256')
      .update(`${device}|${os}|${userAgent}|${ip}`)
      .digest('hex');

  const fingerprint = rawFingerprint;

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
    fingerprint,
  };
}
