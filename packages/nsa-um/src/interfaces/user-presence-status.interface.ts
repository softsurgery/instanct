import { ClientPresenceSource } from './client-presence-source.interface';

export interface UserPresenceStatus {
  userId: string;
  isConnected: boolean;
  sources: ClientPresenceSource[];
  lastSeen?: Date | null;
}
