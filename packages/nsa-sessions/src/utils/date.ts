export function mergeTodayWithTime(dateWithTime: Date): Date {
  const now = new Date();

  const merged = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    dateWithTime.getHours(),
    dateWithTime.getMinutes(),
    dateWithTime.getSeconds(),
    dateWithTime.getMilliseconds(),
  );

  return merged;
}

export function getNowInTimezone(timezone?: string): Date {
  if (!timezone) return new Date();

  try {
    const nowUtcMs = Date.now();
    // Build a locale string that lets us extract each date/time part
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date(nowUtcMs));

    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? 0);

    // Construct a Date whose UTC value equals the wall-clock time in the
    // requested timezone. This makes TypeORM comparisons timezone-aware.
    return new Date(
      Date.UTC(
        get('year'),
        get('month') - 1,
        get('day'),
        get('hour'),
        get('minute'),
        get('second'),
      ),
    );
  } catch {
    // If the timezone string is invalid, fall back to server time
    return new Date();
  }
}
