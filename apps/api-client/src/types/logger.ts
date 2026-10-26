import type { ResponseUserDto } from "./user-management";
import type { DatabaseEntity } from "./utils/database-entity";

export interface LogEntry extends DatabaseEntity {
  id: number;
  event: string;
  api: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  user: ResponseUserDto;
  userId?: string;
  logInfo: Record<string, unknown>;
}

export type ResponseLogDto = LogEntry;
