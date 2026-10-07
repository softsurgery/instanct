export type StaticMessageEnum = string;

export const STATIC_MESSAGE = Symbol('STATIC_MESSAGE');

export const StaticMessageEnum: Record<string, StaticMessageEnum> = {};

export const staticMessageRegistry = StaticMessageEnum;

export function bindStaticMessage(source: Record<string, string>) {
  Object.assign(StaticMessageEnum, source);
}
