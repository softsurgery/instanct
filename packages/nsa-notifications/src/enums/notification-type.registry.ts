export type NotificationType = string;

export const NOTIFICATION_TYPE = Symbol('NOTIFICATION_TYPE');

export const NotificationType: Record<string, NotificationType> = {};

export const notificationTypeRegistry = NotificationType;

export function bindNotificationType(source: Record<string, string>) {
  Object.assign(NotificationType, source);
}
