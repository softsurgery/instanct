import type { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';

export interface ExperimentalConnectedUserSessionInfo {
  plannedStart?: Date;
  plannedEnd?: Date;
}

export interface ExperimentalConnectedUserState {
  userId: string;
  isConnected: boolean;
  hasActiveSession: boolean;
  isExperimental: boolean;
  latitude: number | null;
  longitude: number | null;
  activeSession?: ExperimentalConnectedUserSessionInfo;
  user?: ResponseUserDto;
}
