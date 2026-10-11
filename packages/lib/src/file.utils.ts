export function formatFileSize(
  bytes: number | string | undefined | null
): string {
  if (bytes === undefined || bytes === null || bytes === "") return "—";
  const num = Number(bytes);
  if (isNaN(num)) return String(bytes);
  if (num === 0) return "0 octet";
  const k = 1024;
  if (num < k) {
    return `${num} octets`;
  } else if (num < k * k) {
    return `${(num / k).toFixed(1)} Ko (${num.toLocaleString()} octets)`;
  } else if (num < k * k * k) {
    return `${(num / (k * k)).toFixed(2)} Mo (${num.toLocaleString()} octets)`;
  } else {
    return `${(num / (k * k * k)).toFixed(2)} Go (${num.toLocaleString()} octets)`;
  }
}
