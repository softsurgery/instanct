import type { ResponseUserDto } from "./user-management";

export interface ExperimentalConnectedUserSessionInfo {
  plannedStart?: Date | string;
  plannedEnd?: Date | string;
}

export interface ExperimentalConnectedUserState {
  userId: string;
  isConnected: boolean;
  hasActiveSession: boolean;
  isExperimental?: boolean;
  latitude: number | null;
  longitude: number | null;
  activeSession?: ExperimentalConnectedUserSessionInfo;
  user?: ResponseUserDto;
}

export interface ExperimentalGeolocationState {
  positionsVisibleToEveryone: boolean;
  includeConnectedUsers: boolean;
  connectedUsers: ExperimentalConnectedUserState[];
}

export interface UpdateExperimentalGeolocationFlagsDto {
  positionsVisibleToEveryone?: boolean;
  includeConnectedUsers?: boolean;
}

export interface ConnectExperimentalGeolocationUserDto {
  latitude?: number;
  longitude?: number;
}

export interface UpdateExperimentalGeolocationUserLocationDto {
  latitude: number;
  longitude: number;
}
