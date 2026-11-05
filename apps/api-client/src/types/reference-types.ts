import type { DatabaseEntity } from "./utils";

export type RefCatalogTranslations = Record<string, string>;

export interface RefParamExtras {
  color?: string;
  translations?: RefCatalogTranslations;
}

export interface RefTypeExtras {
  color?: string;
  translations?: RefCatalogTranslations;
}

export interface ResponseRefTypeDto<
  T extends RefTypeExtras = RefTypeExtras,
> extends DatabaseEntity {
  id: number;
  label: string;
  description: string;
  params?: ResponseRefParamDto[];
  refParams?: ResponseRefParamDto[];
  parentId?: number;
  parent?: ResponseRefTypeDto;
  children: ResponseRefTypeDto[];
  extras: T;
}

export interface CreateRefTypeDto<T extends RefTypeExtras = RefTypeExtras> {
  label: string;
  description: string;
  parentId?: number;
  extras: T;
}

export type UpdateRefTypeDto<T extends RefTypeExtras = RefTypeExtras> = Partial<
  CreateRefTypeDto<T>
>;

export interface ResponseRefParamDto<
  T extends RefParamExtras = RefParamExtras,
> extends DatabaseEntity {
  id: number;
  label: string;
  description: string;
  refTypeId: number;
  refType: ResponseRefTypeDto;
  extras: T;
}

export interface CreateRefParamDto<T extends RefParamExtras = RefParamExtras> {
  label: string;
  description: string;
  refTypeId?: number;
  extras: T;
}

export type UpdateRefParamDto<T extends RefParamExtras = RefParamExtras> =
  Partial<CreateRefParamDto<T>>;

export function resolveRefLabel(
  label: string,
  extras?: RefParamExtras | RefTypeExtras | null,
  locale = "en",
): string {
  const language = locale.split("-")[0]?.toLowerCase() || "en";
  const translations = extras?.translations;
  if (!translations) {
    return label;
  }
  return translations[language] ?? translations.en ?? label;
}