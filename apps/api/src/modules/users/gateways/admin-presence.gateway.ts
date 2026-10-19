import { WebSocketGateway } from '@nestjs/websockets';
import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  USER_REPOSITORY,
  AppUserRepository,
} from '@softsurgery/nsa-um/tokens/user-access';
import { UserPresenceService } from '@softsurgery/nsa-um/services/user-presence.service';
import { UserDeviceService } from '@softsurgery/nsa-auth/services/user-device.service';
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
    @Optional()
    userDeviceService?: UserDeviceService,
  ) {
    super(userPresenceService, userRepository, userDeviceService);
  }
}
