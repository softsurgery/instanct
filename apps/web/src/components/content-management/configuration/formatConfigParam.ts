export function parseArrayValue(raw?: string): unknown[] | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function formatArrayItem(item: unknown): string {
  if (item === null || item === undefined) return "—";
  if (typeof item !== "object") return String(item);

  const obj = item as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0) return "{}";

  // If object has 'label' and 'code' (e.g. { label: 'English', code: 'en' })
  if (obj.label && obj.code) {
    const rest = keys.filter((k) => k !== "label" && k !== "code");
    const base = `${obj.label} (${obj.code})`;
    if (rest.length === 0) return base;
    const restStr = rest.map((k) => `${k}: ${obj[k]}`).join(", ");
    return `${base} — ${restStr}`;
  }

  // If object has a clear primary key ('label', 'name', 'title', 'key')
  const primaryKey = keys.find(
    (k) => (k === "label" || k === "name" || k === "title" || k === "key") && obj[k],
  );
  if (primaryKey && obj[primaryKey]) {
    const otherKeys = keys.filter(
      (k) => k !== primaryKey && obj[k] !== undefined && obj[k] !== "",
    );
    if (otherKeys.length === 0) return String(obj[primaryKey]);
    const details = otherKeys.map((k) => `${k}: ${obj[k]}`).join(", ");
    return `${obj[primaryKey]} (${details})`;
  }

  // Fallback for general objects: key: value, ...
  return Object.entries(obj)
    .filter(([_, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
}
