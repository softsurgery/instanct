import type { ExperimentalConnectedUserState } from './experimental-connected-user-state.interface';

export interface ExperimentalGeolocationState {
  positionsVisibleToEveryone: boolean;
  includeConnectedUsers: boolean;
  connectedUsers: ExperimentalConnectedUserState[];
}
