import { WebSocketGateway } from '@nestjs/websockets';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { USER_REPOSITORY, AppUserRepository } from 'nsa-um/tokens/user-access';
import { UserPresenceService } from 'nsa-um/services/user-presence.service';
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
    @Inject(USER_REPOSITORY)
    userRepository?: AppUserRepository,
  ) {
    super(userPresenceService, userRepository);
  }
}
