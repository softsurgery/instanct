export function setNestedValue<T>(object: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const next = { ...(object as object) } as Record<string, unknown>;
  let current: Record<string, unknown> = next;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    const existing = current[key];
    current[key] = Array.isArray(existing)
      ? [...existing]
      : { ...((existing as Record<string, unknown>) ?? {}) };
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
  return next as T;
}
