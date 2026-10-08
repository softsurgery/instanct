export type StorageSystematics = string;

export const STORAGE_SYSTEMATICS_TOKEN = Symbol('STORAGE_SYSTEMATICS');

export const STORAGE_SYSTEMATICS: Record<string, StorageSystematics> = {};

export const storageSystematicsRegistry = STORAGE_SYSTEMATICS;

export function bindStorageSystematics(source: Record<string, string>) {
  Object.assign(STORAGE_SYSTEMATICS, source);
}
