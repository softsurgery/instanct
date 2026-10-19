import { DatabaseEntity } from "./utils/database-entity";

export interface ResponseUserDeviceDto extends DatabaseEntity {
  id: string;
  userId: string;
  fingerprint: string;
  deviceName?: string;
  deviceModel?: string;
  os?: string;
  isTrusted: boolean;
}

export interface CreateUserDeviceDto {
  fingerprint: string;
  deviceName?: string;
  deviceModel?: string;
  os?: string;
  isTrusted?: boolean;
}

export interface UpdateUserDeviceDto {
  deviceName?: string;
  deviceModel?: string;
  os?: string;
  isTrusted?: boolean;
}
