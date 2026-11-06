import type { DatabaseEntity } from "./utils/database-entity";

export interface ResponseTemplateDto extends DatabaseEntity {
  id: string;
  name?: string;
  content?: string;
  size: number;
}

export interface CreateTemplateDto {
  name: string;
  content: string;
}

export interface UpdateTemplateDto {
  name?: string;
  content?: string;
}
