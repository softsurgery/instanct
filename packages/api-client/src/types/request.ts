import type { ResponseSessionDto } from "./session";
import type { ResponseUserDto } from "./user-management";
import type { DatabaseEntity } from "./utils/database-entity";

export enum RequestEvent {
  Accept = "Accept",
  Reject = "Reject",
}

export enum RequestStatus {
  Sent = "Sent",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Expired = "Expired",
}

export interface ResponseRequestDto extends DatabaseEntity {
  id: number;
  sessionId: number;
  session: ResponseSessionDto;
  receivers: ResponseUserDto[];
  status?: RequestStatus;
  message?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  time?: Date;
}

export interface ResponseRequestWorkflowDto {
  status: RequestStatus;
  request: ResponseRequestDto;
}

export interface CreateRequestDto {
  receiverIds: string[];
  message?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  time?: Date;
}

export interface UpdateRequestStatusDto {
  event: RequestEvent;
}

export type UpdateRequestDto = Partial<CreateRequestDto>;
