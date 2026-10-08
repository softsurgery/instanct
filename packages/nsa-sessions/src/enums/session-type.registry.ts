export type SessionType = string;

export const SESSION_TYPE = Symbol('SESSION_TYPE');

export const SessionType: Record<string, SessionType> = {};

export const sessionTypeRegistry = SessionType;

export function bindSessionType(source: Record<string, string>) {
  Object.assign(SessionType, source);
}
