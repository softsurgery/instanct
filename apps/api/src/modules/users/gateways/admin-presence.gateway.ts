import { WebSocketGateway } from '@nestjs/websockets';
import { Injectable, Optional } from '@nestjs/common';
import { UserPresenceService } from '@softsurgery/nsa-um/services/user-presence.service';
import { UserConnectionHistoryService } from '@softsurgery/nsa-auth/services/user-connection-history.service';
import { UserPresenceGateway } from './user-presence.gateway';

/**
 * Gateway providing backwards-compatible presence tracking and status events under the '/admin/presence' namespace.
 * Shares the unified UserPresenceService and presence logic with the global UserPresenceGateway.
 */
@WebSocketGateway({
  namespace: '/admin/presence',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class AdminPresenceGateway extends UserPresenceGateway {
  constructor(
    userPresenceService: UserPresenceService,
    @Optional()
    userConnectionHistoryService?: UserConnectionHistoryService,
  ) {
    super(userPresenceService, userConnectionHistoryService);
  }
}
