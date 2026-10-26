import type { ResponseUserDto } from "./user-management";
import type { DatabaseEntity } from "./utils/database-entity";

export interface ResponseUserBookmarkDto extends DatabaseEntity {
  id: number;
  userId: string;
  user?: ResponseUserDto;
  bookmarkId: string;
  bookmark?: ResponseUserDto;
}
