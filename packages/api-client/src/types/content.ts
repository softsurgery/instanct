import type { DatabaseEntity } from "./utils/database-entity";

export interface ResponseContentPageDto extends DatabaseEntity {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  body: string;
  locale: string;
  unresolvedKeys?: string[];
  hasNotApplied?: boolean;
}

export interface CreateContentPageDto {
  slug: string;
  title: string;
  subtitle?: string;
  body: string;
  locale?: string;
}

export interface UpdateContentPageDto {
  title?: string;
  subtitle?: string;
  body?: string;
  locale?: string;
}
