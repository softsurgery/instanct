import type { ResponseUserDto } from "./user-management";
import type { DatabaseEntity } from "./utils/database-entity";

export enum NotificationType {
  TEST = "TEST",
  NEW_SIGIN = "NEW_SIGIN",
  NEW_MESSAGE = "NEW_MESSAGE",
}

export interface ResponseNotificationDto extends DatabaseEntity {
  id: string;
  type: NotificationType;
  userId?: string;
  user: ResponseUserDto;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}
