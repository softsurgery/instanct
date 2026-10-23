import { ClientPresenceSource } from './client-presence-source.interface';

export interface SocketConnectionMeta {
  socketId: string;
  source: ClientPresenceSource;
  namespace?: string;
  connectedAt: Date;
}
