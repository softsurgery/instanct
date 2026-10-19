import { DatabaseEntity } from "./utils/database-entity";

export interface ResponseUserConnectionHistoryDto extends DatabaseEntity {
  id: string;
  userId: string;
  deviceId?: string;
  source: string;
  socketId?: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  disconnectedAt?: string;
}

export interface CreateUserConnectionHistoryDto {
  deviceId?: string;
  source?: string;
  socketId?: string;
  ipAddress?: string;
}
