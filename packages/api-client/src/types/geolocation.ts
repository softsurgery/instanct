import type { ResponseUserDto } from "./user-management";
import type { DatabaseEntity } from "./utils/database-entity";

export interface CreateGeolocationDto {
  latitude: number;
  longitude: number;
}

export interface ResponseGeolocationDto extends DatabaseEntity {
  id: number;
  latitude: number;
  longitude: number;
  user: ResponseUserDto;
  userId: string;
}
