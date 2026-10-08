export function parseCorsOrigins(origins?: string): string[] {
  if (!origins) {
    return [];
  }

  return origins
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: string[],
): boolean {
  // Allow requests with no origin (such as mobile native apps, curl, server-to-server)
  if (!origin) {
    return true;
  }

  const normalized = origin.replace(/\/+$/, '');

  return allowedOrigins.some((allowed) => {
    if (allowed === '*' || allowed === normalized) {
      return true;
    }
    if (allowed.includes('*')) {
      const pattern = new RegExp(
        `^${allowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\*', '.*')}$`,
      );
      return pattern.test(normalized);
    }
    return false;
  });
}
