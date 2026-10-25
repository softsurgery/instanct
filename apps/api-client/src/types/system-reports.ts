import { DatabaseEntity } from "./utils/database-entity";
import { ResponseUserDto } from "./user-management";
import { ResponseUserDeviceDto } from "./user-device";

export interface ResponseBugDto extends DatabaseEntity {
  id: number;
  variant: string;
  status: string;
  title: string;
  description: string;
  device?: ResponseUserDeviceDto;
  deviceId?: string;
  userId: string;
  user?: ResponseUserDto;
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
  deviceId?: string;
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
  deviceId?: string;
}

export interface ResponseFeedbackDto extends DatabaseEntity {
  id: number;
  category: string;
  message: string;
  rating?: number;
  device?: ResponseUserDeviceDto;
  deviceId?: string;
  userId: string;
  user?: ResponseUserDto;
}
