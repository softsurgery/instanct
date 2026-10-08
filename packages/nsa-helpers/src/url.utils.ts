export function buildStaticUrl(
  host: string | null,
  port: number | null,
  secure = false,
): string {
  if (!host) {
    return '';
  }
  const protocol = secure ? 'https' : 'http';
  const defaultPort = secure ? 443 : 80;
  if (!port || port === defaultPort) {
    return `${protocol}://${host}`;
  }

  return `${protocol}://${host}:${port}`;
}
