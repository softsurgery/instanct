import { DatabaseEntity } from "./utils/database-entity";
import { ResponseUserDto } from "./user-management";

export interface ResponseDeviceInfoDto extends DatabaseEntity {
  id: number;
  model?: string;
  platform?: string;
  version?: string;
  manufacturer?: string;
}

export interface ResponseBugDto extends DatabaseEntity {
  id: number;
  variant: string;
  title: string;
  description: string;
  device: ResponseDeviceInfoDto;
  deviceId: number;
  userId: string;
  user?: ResponseUserDto;
}

export interface ResponseFeedbackDto extends DatabaseEntity {
  id: number;
  category: string;
  message: string;
  rating?: number;
  device: ResponseDeviceInfoDto;
  deviceId: number;
  userId: string;
  user?: ResponseUserDto;
}
