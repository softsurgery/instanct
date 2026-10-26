import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { getTokenPayloadForWebSocket } from '@softsurgery/nsa-auth/utils/token-payload';
import {
  detectPresenceMetadata,
  PresenceMetadata,
} from '@softsurgery/nsa-auth/utils/presence-metadata';
import { UserConnectionHistoryService } from '@softsurgery/nsa-auth/services/user-connection-history.service';
import {
  ClientPresenceSource,
  UserPresenceEvent,
  UserPresenceService,
  UserPresenceStatus,
} from '@softsurgery/nsa-um/services/user-presence.service';

/**
 * Standard data format stored on the presence socket instance.
 */
export interface PresenceClientData {
  userId: string;
  source: ClientPresenceSource;
  isDisconnected: boolean;
  connectionHistoryId?: string;
  connectedAt: Date;
  [key: string]: unknown;
}

export type PresenceSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  PresenceClientData
>;

export interface GetStatusPayload {
  ids?: string[];
}

/**
 * Reusable helper encapsulating presence socket lifecycle state and connection checks.
 */
export class PresenceSocketState {
  static initialize(
    client: PresenceSocket,
    userId: string,
    source: ClientPresenceSource,
  ): PresenceClientData {
    const data: PresenceClientData = {
      userId,
      source,
      isDisconnected: false,
      connectedAt: new Date(),
    };
    client.data = data;
    return data;
  }

  static get(client: PresenceSocket): PresenceClientData | undefined {
    return client.data;
  }

  static isConnected(client: PresenceSocket): boolean {
    return Boolean(
      client.connected && !client.disconnected && !client.data?.isDisconnected,
    );
  }

  static markDisconnected(client: PresenceSocket): void {
    if (client.data) {
      client.data.isDisconnected = true;
    }
  }
}

@WebSocketGateway({
  namespace: '/presence',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class UserPresenceGateway
  implements
    OnGatewayConnection<PresenceSocket>,
    OnGatewayDisconnect<PresenceSocket>,
    OnModuleInit
{
  @WebSocketServer()
  server: Server;

  protected readonly logger = new Logger(UserPresenceGateway.name);

  constructor(
    protected readonly userPresenceService: UserPresenceService,
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
  async handleConnection(client: PresenceSocket): Promise<void> {
    const payload = getTokenPayloadForWebSocket(client);

    if (!payload?.sub) {
      this.logger.warn(
        `Unauthenticated socket connection rejected: ${client.id}`,
      );
      client.disconnect();
      return;
    }

    const userId = payload.sub;
    const source = this.extractSource(client);
    const session = PresenceSocketState.initialize(client, userId, source);

    await client.join('presence_subscribers');
    await client.join(`user_${userId}`);

    // Detect device, IP address, and IP-based geolocation
    const metadata = await detectPresenceMetadata(client);

    // Abort if client disconnected while awaiting presence metadata
    if (!PresenceSocketState.isConnected(client)) {
      this.logger.warn(
        `Socket ${client.id} disconnected before presence metadata detection completed`,
      );
      return;
    }

    // Record presence connection & device history (for all authenticated clients, smoothly deduplicating with sign-in)
    const historyId = await this.recordConnectionHistory(
      userId,
      client.id,
      source,
      metadata,
    );
    session.connectionHistoryId = historyId;

    // Abort and clean up if client disconnected while recording connection history
    if (!PresenceSocketState.isConnected(client)) {
      this.logger.warn(
        `Socket ${client.id} disconnected immediately after recording presence connection`,
      );
      await this.recordDisconnectionHistory(client.id, historyId);
      return;
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
  async handleDisconnect(client: PresenceSocket): Promise<void> {
    PresenceSocketState.markDisconnected(client);
    const session = PresenceSocketState.get(client);

    if (session?.connectionHistoryId) {
      await this.recordDisconnectionHistory(
        client.id,
        session.connectionHistoryId,
      );
    }

    if (session?.userId) {
      this.userPresenceService.trackDisconnection(
        session.userId,
        client.id,
        'presence',
      );
    }

    this.logger.log(`Presence socket disconnected: ${client.id}`);
  }

  /**
   * Safely records presence connection in UserConnectionHistoryService, logging any error.
   */
  protected async recordConnectionHistory(
    userId: string,
    socketId: string,
    source: ClientPresenceSource,
    metadata: PresenceMetadata,
  ): Promise<string | undefined> {
    if (!this.userConnectionHistoryService) return undefined;
    try {
      const result =
        await this.userConnectionHistoryService.recordPresenceConnection({
          userId,
          socketId,
          source,
          metadata,
        });
      return result.connection?.id;
    } catch (err) {
      this.logger.error(
        `Failed to record connection history for user ${userId}`,
        err,
      );
      return undefined;
    }
  }

  /**
   * Safely records socket disconnection in UserConnectionHistoryService, logging any error.
   */
  protected async recordDisconnectionHistory(
    socketId: string,
    connectionHistoryId?: string,
  ): Promise<void> {
    if (!this.userConnectionHistoryService) return;
    try {
      await this.userConnectionHistoryService.recordDisconnection(
        socketId,
        connectionHistoryId,
      );
    } catch (err) {
      this.logger.error(
        `Failed to record disconnection history for socket ${socketId}`,
        err,
      );
    }
  }

  /**
   * Broadcasts real-time presence changes to all connected presence clients.
   */
  protected broadcastPresenceChange(event: UserPresenceEvent): void {
    if (!this.server) return;
    this.server.emit('user-presence', event);
    this.server.emit('user-status', event);
  }

  /**
   * Unified status handler: receives { ids: string[] } and emits/returns UserPresenceStatus[].
   */
  @SubscribeMessage('get-status')
  async handleGetStatus(
    @ConnectedSocket() client: PresenceSocket,
    @MessageBody() data: GetStatusPayload,
  ): Promise<UserPresenceStatus[]> {
    const ids = Array.isArray(data?.ids)
      ? data.ids.filter((id): id is string => typeof id === 'string')
      : [];
    const statuses = await this.userPresenceService.getUsersStatus(ids);
    client.emit('users-status', statuses);
    return statuses;
  }

  /**
   * Extracts the client source ('web' | 'mobile') from handshake auth, query params, or HTTP headers.
   */
  protected extractSource(client: PresenceSocket): ClientPresenceSource {
    const handshake = client.handshake;
    const auth = handshake?.auth as Record<string, unknown> | undefined;
    const authSource =
      typeof auth?.source === 'string' ? auth.source : undefined;

    const query = handshake?.query;
    const querySource =
      typeof query?.source === 'string'
        ? query.source
        : Array.isArray(query?.source)
          ? query.source[0]
          : undefined;

    const headers = handshake?.headers;
    const headerClientSource = headers?.['x-client-source'];
    const headerSource = headers?.['source'];
    const resolvedHeaderSource =
      typeof headerClientSource === 'string'
        ? headerClientSource
        : Array.isArray(headerClientSource)
          ? headerClientSource[0]
          : typeof headerSource === 'string'
            ? headerSource
            : Array.isArray(headerSource)
              ? headerSource[0]
              : undefined;

    const rawSource = authSource ?? querySource ?? resolvedHeaderSource;

    if (rawSource && rawSource.trim().length > 0) {
      return rawSource.trim();
    }
    return 'web';
  }
}
