import type { ResponseUserDto } from "./user-management";
import type { DatabaseEntity } from "./utils/database-entity";

export enum SessionType {
  DEFAULT = "",
  MAP_SESSION = "map-session",
}

export enum SessionStatus {
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface MapSessionPayload {
  objectives: number[];
}

export interface ResponseSessionDto<T = any> extends DatabaseEntity {
  id: number;
  userId?: string;
  user: ResponseUserDto;
  sessionType: SessionType;
  plannedStart?: Date;
  plannedEnd?: Date;
  started?: Date;
  ended?: Date;
  payload?: T;
  status: SessionStatus;
}

export interface CreateSessionDto<T = any> {
  sessionType: SessionType;
  plannedStart?: Date;
  plannedEnd?: Date;
  payload?: T;
}

export interface UpdateSessionDto<T = any> {
  plannedEnd?: Date;
  payload?: T;
}
