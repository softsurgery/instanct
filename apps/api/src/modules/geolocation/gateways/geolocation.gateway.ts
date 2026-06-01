import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GeolocationService } from '../services/geolocation.service';
import { AdvancedSocket } from 'src/types';
import { getTokenPayloadForWebSocket } from 'src/shared/auth/utils/token-payload';
import { ConfigurationNamespaceService } from 'src/shared/configurations/services/configuration-namespace.service';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';
import { MapConfigurationParam } from 'src/app/configurations/map-configuration.enum';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';

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

  /**
   * socket.id -> userId
   */
  private readonly socketToUser = new Map<string, string>();

  /**
   * userId -> socket.id
   */
  private readonly userToSocket = new Map<string, string>();

  private rangeMin = 0;
  private rangeMax = 100;

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
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

    this.logger.log(
      `Geolocation radius limits loaded: min=${this.rangeMin}, max=${this.rangeMax}`,
    );
  }

  handleConnection(client: AdvancedSocket) {
    const payload = getTokenPayloadForWebSocket(client);

    if (!payload?.sub) {
      this.logger.warn(`Rejected unauthenticated socket ${client.id}`);
      client.disconnect();
      return;
    }

    const userId = payload.sub;

    // remove previous socket if user reconnects
    const previousSocketId = this.userToSocket.get(userId);
    if (previousSocketId && previousSocketId !== client.id) {
      this.socketToUser.delete(previousSocketId);
    }

    this.socketToUser.set(client.id, userId);
    this.userToSocket.set(userId, client.id);

    // this.logger.log(`User ${userId} connected on socket ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);

    if (!userId) return;

    this.socketToUser.delete(client.id);

    const currentSocket = this.userToSocket.get(userId);
    if (currentSocket === client.id) {
      this.userToSocket.delete(userId);
    }

    // this.logger.log(`User ${userId} disconnected`);
  }

  @SubscribeMessage('identify')
  handleIdentify(@ConnectedSocket() socket: Socket) {
    const userId = this.socketToUser.get(socket.id);

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

  @SubscribeMessage('update_location')
  async handleUpdateLocation(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      latitude: number;
      longitude: number;
      radius: number;
      query?: IQueryObject;
    },
  ) {
    try {
      const userId = this.socketToUser.get(socket.id);

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

      const nearbyWithPresence = nearbyUsers.map((geo) => ({
        ...geo,
        distance: GeolocationService.calculateDistanceKm(
          latitude,
          longitude,
          geo.latitude as number,
          geo.longitude as number,
        ),
        isOnline: this.userToSocket.has(geo.userId),
      }));

      socket.emit('nearby_users', nearbyWithPresence);

      const movementPayload = {
        userId,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      };

      for (const user of nearbyWithPresence) {
        const targetSocketId = this.userToSocket.get(user.userId);

        if (!targetSocketId) continue;

        this.server.to(targetSocketId).emit('user_moved', movementPayload);
      }

      // this.logger.debug(
      //   `Updated location for user ${userId}. Nearby users: ${nearbyWithPresence.length}`,
      // );
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
