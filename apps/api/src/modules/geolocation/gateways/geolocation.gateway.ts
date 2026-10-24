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
import { Server } from 'socket.io';
import { GeolocationService } from '../services/geolocation.service';
import { AdvancedSocket } from '@softsurgery/nsa-helpers/http';
import { getTokenPayloadForWebSocket } from '@softsurgery/nsa-auth/utils/token-payload';
import { ConfigurationNamespaceService } from '@softsurgery/nsa-configurations/services/configuration-namespace.service';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';
import { MapConfigurationParam } from 'src/app/configurations/map-configuration.enum';
import { IQueryObject } from '@softsurgery/nsa-database';
import { SessionService } from '@softsurgery/nsa-sessions/services/session.service';
import {
  ClientPresenceSource,
  UserPresenceEvent,
  UserPresenceService,
} from '@softsurgery/nsa-um/services/user-presence.service';
import { UserConnectionHistoryService } from '@softsurgery/nsa-auth/services/user-connection-history.service';

@WebSocketGateway({
  namespace: '/geolocation',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class GeolocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GeolocationGateway.name);

  private rangeMin: number;
  private rangeMax: number;

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
    private readonly sessionService: SessionService,
    @Optional()
    private readonly userPresenceService?: UserPresenceService,
    @Optional()
    private readonly userConnectionHistoryService?: UserConnectionHistoryService,
  ) {}

  async onModuleInit() {
    this.rangeMin = (await this.configurationNamespaceService.getSpecificParam(
      ConfigurationNamespaces.MAPS,
      MapConfigurationParam.RANGE_MIN,
    )) as number;

    this.rangeMax = (await this.configurationNamespaceService.getSpecificParam(
      ConfigurationNamespaces.MAPS,
      MapConfigurationParam.RANGE_MAX,
    )) as number;

    // Reactively broadcast presence changes to map clients so status badges reflect real-time transitions
    this.userPresenceService?.onPresenceChange((event: UserPresenceEvent) => {
      this.server?.emit('user_presence_changed', {
        userId: event.userId,
        isConnected: event.isConnected,
        sources: event.sources,
        lastSeen: event.lastSeen,
      });
    });

    this.logger.log(
      `Geolocation radius limits loaded: min=${this.rangeMin}, max=${this.rangeMax}`,
    );
  }

  async handleConnection(client: AdvancedSocket) {
    const payload = getTokenPayloadForWebSocket(client);

    if (!payload?.sub) {
      this.logger.warn(`Rejected unauthenticated socket ${client.id}`);
      client.disconnect();
      return;
    }

    const userId = payload.sub;
    client.data.userId = userId;

    await client.join(`user_${userId}`);
    await client.join('geolocation_subscribers');

    const source: ClientPresenceSource =
      (client.handshake?.auth?.source as ClientPresenceSource) ||
      (client.handshake?.query?.source as ClientPresenceSource) ||
      (client.handshake?.headers?.[
        'x-client-source'
      ] as ClientPresenceSource) ||
      'mobile';

    // Centralize presence tracking into UserPresenceService
    this.userPresenceService?.trackConnection(
      userId,
      client.id,
      source,
      'geolocation',
    );
  }

  handleDisconnect(client: AdvancedSocket) {
    const userId = client.data?.userId;

    if (!userId) return;

    // Centralize disconnection tracking into UserPresenceService
    this.userPresenceService?.trackDisconnection(
      userId,
      client.id,
      'geolocation',
    );
  }

  @SubscribeMessage('identify')
  handleIdentify(@ConnectedSocket() socket: AdvancedSocket) {
    const userId = socket.data?.userId;

    if (!userId) {
      socket.emit('error', { message: 'User not identified' });
      return;
    }

    socket.emit('identified', {
      userId,
      message: 'User registered successfully',
    });

    this.logger.debug(`User ${userId} identified on socket ${socket.id}`);
  }

  /**
   * Check if two users have an accepted request between them
   * in either user's current active session (bidirectional visibility)
   */

  @SubscribeMessage('update_location')
  async handleUpdateLocation(
    @ConnectedSocket() socket: AdvancedSocket,
    @MessageBody()
    data: {
      latitude: number;
      longitude: number;
      radius: number;
      query?: IQueryObject;
    },
  ) {
    try {
      const userId = socket.data?.userId;

      if (!userId) {
        socket.emit('error', { message: 'User not identified' });
        return;
      }

      const { latitude, longitude, radius } = data;

      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        typeof radius !== 'number'
      ) {
        socket.emit('error', { message: 'Invalid location payload' });
        return;
      }

      if (radius < this.rangeMin || radius > this.rangeMax) {
        socket.emit('error', {
          message: `Radius must be between ${this.rangeMin} and ${this.rangeMax}`,
        });
        return;
      }

      // Check if the current user has an active session
      const activeSessions =
        await this.sessionService.findAllActiveUserSessions({}, userId);

      if (activeSessions.length === 0) {
        socket.emit('nearby_users', []);
        return;
      }

      await this.geolocationService.saveNewLocation(
        { latitude, longitude },
        userId,
      );

      const nearbyUsers =
        await this.geolocationService.findActiveSessionsByRadius(
          latitude,
          longitude,
          radius,
          userId,
          data.query,
        );

      // Batch resolve bidirectional accepted requests for all candidate nearby users in a single query
      const candidateUserIds = nearbyUsers.map((g) => g.userId);
      const acceptedIds =
        await this.geolocationService.getAcceptedRequestUserIds(
          userId,
          candidateUserIds,
        );

      const nearbyWithPresence = nearbyUsers.map((geo) => {
        const accepted = acceptedIds.has(geo.userId);
        const isOnline =
          this.userPresenceService?.isUserConnected(geo.userId) ?? false;

        return {
          ...geo,
          latitude: accepted ? geo.latitude : null,
          longitude: accepted ? geo.longitude : null,
          distance: accepted
            ? GeolocationService.calculateDistanceKm(
                latitude,
                longitude,
                geo.latitude as number,
                geo.longitude as number,
              )
            : null,
          isOnline,
          coordinatesVisible: accepted,
        };
      });

      socket.emit('nearby_users', nearbyWithPresence);

      // Synchronize high-accuracy GPS coordinates with the active device connection history record
      if (this.userConnectionHistoryService) {
        this.userConnectionHistoryService
          .updateActiveLocation(userId, latitude, longitude)
          .catch((err) => {
            this.logger.debug(
              `Failed updating active connection location for ${userId}: ${err}`,
            );
          });
      }

      const movementPayload = {
        userId,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      };

      // Emit user_moved to user rooms (reliably covers multiple sockets/devices per user)
      for (const user of nearbyWithPresence) {
        if (!user.coordinatesVisible) continue;
        this.server
          .to(`user_${user.userId}`)
          .emit('user_moved', movementPayload);
      }
    } catch (error) {
      this.logger.error(
        `Failed processing location update for socket ${socket.id}`,
        error instanceof Error ? error.stack : undefined,
      );

      socket.emit('error', {
        message: 'Failed to process location update',
      });
    }
  }
}
