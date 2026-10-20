import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { getTokenPayloadForWebSocket } from '@softsurgery/nsa-auth/utils/token-payload';
import { UserConnectionHistoryService } from '@softsurgery/nsa-auth/services/user-connection-history.service';
import { detectPresenceMetadata } from '@softsurgery/nsa-auth/utils/presence-metadata';
import { AdvancedSocket } from '@softsurgery/nsa-helpers/http';
import {
  USER_REPOSITORY,
  AppUserRepository,
} from '@softsurgery/nsa-um/tokens/user-access';
import {
  ClientPresenceSource,
  UserPresenceEvent,
  UserPresenceService,
  UserPresenceStatus,
} from '@softsurgery/nsa-um/services/user-presence.service';

export interface GetStatusPayload {
  ids: string[];
}

@WebSocketGateway({
  namespace: '/presence',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class UserPresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  protected readonly logger = new Logger(UserPresenceGateway.name);

  constructor(
    protected readonly userPresenceService: UserPresenceService,
    @Optional()
    @Inject(USER_REPOSITORY)
    protected readonly userRepository?: AppUserRepository,
    @Optional()
    protected readonly userConnectionHistoryService?: UserConnectionHistoryService,
  ) {}

  /**
   * Initializes the gateway and subscribes to service-level presence events
   * so all real-time changes are automatically broadcast to all connected clients.
   */
  onModuleInit() {
    this.userPresenceService.onPresenceChange((event: UserPresenceEvent) => {
      this.broadcastPresenceChange(event);
    });
  }

  /**
   * Handles incoming WebSocket connection, validates JWT token, detects device, IP address,
   * and geolocation, registers connection in history for mobile devices, and joins user rooms.
   */
  async handleConnection(client: AdvancedSocket) {
    const payload = getTokenPayloadForWebSocket(client);

    if (!payload?.sub) {
      this.logger.warn(
        `Unauthenticated socket connection rejected: ${client.id}`,
      );
      client.disconnect();
      return;
    }

    const userId = payload.sub;
    client.data.userId = userId;

    const source = this.extractSource(client);
    (client.data as Record<string, unknown>).source = source;

    await client.join('presence_subscribers');
    await client.join(`user_${userId}`);

    // Detect device, IP address, and IP-based geolocation
    const metadata = await detectPresenceMetadata(client);

    let connectionHistoryId: string | undefined;

    // Record presence connection & device history (especially for mobile clients)
    if (
      this.userConnectionHistoryService &&
      (source === 'mobile' || client.handshake?.auth?.device)
    ) {
      try {
        const result =
          await this.userConnectionHistoryService.recordPresenceConnection({
            userId,
            socketId: client.id,
            source,
            metadata,
          });
        connectionHistoryId = result.connection?.id;
        (client.data as Record<string, unknown>).connectionHistoryId =
          connectionHistoryId;
      } catch (err) {
        this.logger.error(
          `Failed to record connection history for user ${userId}`,
          err,
        );
      }
    }

    // Register connection and source with the centralized presence service
    this.userPresenceService.trackConnection(
      userId,
      client.id,
      source,
      'presence',
    );

    this.logger.log(
      `User ${userId} connected on socket ${client.id} (source: ${source}, device: ${metadata.device}, IP: ${metadata.ipAddress}, location: ${metadata.location})`,
    );
  }

  /**
   * Handles socket disconnection and deregisters the socket from UserPresenceService,
   * marking the disconnection time in connection history.
   */
  async handleDisconnect(client: AdvancedSocket) {
    const userId = client.data?.userId;
    const connectionHistoryId = (client.data as Record<string, unknown>)
      ?.connectionHistoryId as string;

    if (this.userConnectionHistoryService) {
      try {
        await this.userConnectionHistoryService.recordDisconnection(
          client.id,
          connectionHistoryId,
        );
      } catch (err) {
        this.logger.error(
          `Failed to record disconnection history for socket ${client.id}`,
          err,
        );
      }
    }

    if (userId) {
      this.userPresenceService.trackDisconnection(
        userId,
        client.id,
        'presence',
      );
    }
    this.logger.log(`Presence socket disconnected: ${client.id}`);
  }

  /**
   * Broadcasts real-time presence changes to all connected presence clients.
   */
  protected broadcastPresenceChange(event: UserPresenceEvent) {
    if (!this.server) return;
    this.server.emit('user-presence', event);
    this.server.emit('user-status', event);
  }

  /**
   * Unified status handler: receives { ids: string[] } and emits/returns UserPresenceStatus[].
   */
  @SubscribeMessage('get-status')
  async handleGetStatus(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: GetStatusPayload,
  ): Promise<UserPresenceStatus[]> {
    const ids = Array.isArray(data?.ids) ? data.ids : [];
    const statuses = await this.userPresenceService.getUsersStatus(ids);
    client.emit('users-status', statuses);
    return statuses;
  }

  /**
   * Extracts the client source ('web' | 'mobile') from handshake auth, query params, or HTTP headers.
   */
  protected extractSource(client: AdvancedSocket): ClientPresenceSource {
    return (
      (client.handshake?.auth?.source as string) ||
      (client.handshake?.query?.source as string) ||
      (client.handshake?.headers?.['x-client-source'] as string) ||
      (client.handshake?.headers?.['source'] as string) ||
      'web'
    );
  }
}
