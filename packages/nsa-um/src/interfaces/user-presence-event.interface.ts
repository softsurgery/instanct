import { ClientPresenceSource } from "./client-presence-source.interface";

export interface UserPresenceEvent {
  userId: string;
  isConnected: boolean;
  sources: ClientPresenceSource[];
  lastSeen?: Date | null;
}
