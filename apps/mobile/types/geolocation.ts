import type { ResponseUserDto } from "@instanct/api-client";

export interface NearbyUser {
  latitude: number;
  longitude: number;
  user?: ResponseUserDto;
  userId: string;
  distance?: number | null;
  isOnline?: boolean;
  coordinatesVisible?: boolean;
  profilePicture?: React.ReactNode;
  updatedAt: string;
}

export interface Cluster {
  latitude: number;
  longitude: number;
  users: NearbyUser[];
}
