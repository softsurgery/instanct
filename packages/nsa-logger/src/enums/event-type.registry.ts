export type EventType = string;

export const EVENT_TYPE = Symbol('EVENT_TYPE');

export const EventType: Record<string, EventType> = {};

export const eventTypeRegistry = EventType;

export function bindEventType(source: Record<string, string>) {
  Object.assign(EventType, source);
}
