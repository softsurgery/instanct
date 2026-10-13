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
  status: string;
  title: string;
  description: string;
  device: ResponseDeviceInfoDto;
  deviceId: number;
  userId: string;
  user?: ResponseUserDto;
}

export interface CreateDeviceDto {
  model: string;
  platform: string;
  version: string;
  manufacturer: string;
}

export enum BugVariant {
  CRASH = "Crash",
  UI_ISSUE = "UI Issue",
  PERFORMANCE_ISSUE = "Performance Issue",
  FEATURE_NOT_WORKING = "Feature Not Working",
  OTHER = "Other",
}

export interface CreateBugDto {
  variant?: BugVariant;
  title: string;
  description: string;
  device: CreateDeviceDto;
}

export enum FeedbackCategory {
  GENERAL_FEEDBACK = "General Feedback",
  FEATURE_REQUEST = "Feature Request",
  OTHER = "Other",
}

export interface CreateFeedbackDto {
  category?: FeedbackCategory;
  message: string;
  rating: number;
  device: CreateDeviceDto;
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
