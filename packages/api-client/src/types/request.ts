import type { ResponseSessionDto } from "./session";
import type { ResponseUserDto } from "./user-management";
import type { DatabaseEntity } from "./utils/database-entity";

export enum RequestEvent {
  Accept = "Accept",
  Reject = "Reject",
  Cancel = "Cancel",
}

export enum RequestStatus {
  Sent = "Sent",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Cancelled = "Cancelled",
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
  cancelReason?: string;
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
  cancelReason?: string;
}

export interface UpdateRequestStatusDto {
  event: RequestEvent;
  cancelReason?: string;
}

export type UpdateRequestDto = Partial<CreateRequestDto>;
