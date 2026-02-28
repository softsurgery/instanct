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
