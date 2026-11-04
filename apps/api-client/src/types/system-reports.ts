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
  interestedUsers?: ResponseBugInterestedUserDto[];
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
  deviceId?: string | null;
  userId?: string;
  interestedUserIds?: string[];
}

export interface UpdateBugDto {
  variant?: BugVariant;
  status?: BugStatus | string;
  title?: string;
  description?: string;
  deviceId?: string | null;
  userId?: string;
  interestedUserIds?: string[];
  notify?: boolean;
}

export enum BugStatus {
  RESOLVED = "Resolved",
  NOT_RESOLVED = "Not Resolved",
  PENDING = "Pending",
}

export interface ResponseBugInterestedUserDto extends DatabaseEntity {
  id: number;
  bugId: number;
  userId: string;
  user?: ResponseUserDto;
}

export interface CreateBugInterestedUserDto {
  bugId: number;
  userId: string;
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
