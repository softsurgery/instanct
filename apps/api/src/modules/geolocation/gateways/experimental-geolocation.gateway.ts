import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Server } from 'socket.io';
import { AdvancedSocket } from '@softsurgery/nsa-helpers/http';
import { getTokenPayloadForWebSocket } from '@softsurgery/nsa-auth/utils/token-payload';
import { UserPresenceService } from '@softsurgery/nsa-um/services/user-presence.service';
import { ExperimentalGeolocationService } from '../services/experimental-geolocation.service';

@WebSocketGateway({
  namespace: '/experimental-geolocation',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ExperimentalGeolocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ExperimentalGeolocationGateway.name);

  constructor(
    private readonly experimentalGeolocationService: ExperimentalGeolocationService,
    @Optional()
    private readonly userPresenceService?: UserPresenceService,
  ) {}

  async handleConnection(socket: AdvancedSocket): Promise<void> {
    try {
      const payload = getTokenPayloadForWebSocket(socket);
      const userId = payload?.sub;
      if (!userId) {
        socket.disconnect();
        return;
      }

      socket.data.userId = userId;
      await socket.join(`user_${userId}`);
      this.userPresenceService?.trackConnection(
        userId,
        socket.id,
        'mobile',
        'experimental-gateway',
      );
    } catch (error) {
      this.logger.warn(
        `Experimental socket connection error: ${error instanceof Error ? error.message : String(error)}`,
      );
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AdvancedSocket): void {
    const userId = socket.data?.userId;
    if (userId) {
      this.userPresenceService?.trackDisconnection(
        userId,
        socket.id,
        'experimental-gateway',
      );
    }
  }

  @SubscribeMessage('update_location')
  async handleUpdateLocation(
    @ConnectedSocket() socket: AdvancedSocket,
    @MessageBody()
    data: { latitude: number; longitude: number },
  ): Promise<void> {
    try {
      const userId = socket.data?.userId;
      if (!userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const { latitude, longitude } = data ?? {};
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        socket.emit('error', { message: 'Invalid location payload' });
        return;
      }

      await this.experimentalGeolocationService.upsertUserLocation(
        userId,
        latitude,
        longitude,
      );

      const state = await this.experimentalGeolocationService.getState();
      const showPositions = state.positionsVisibleToEveryone;

      const recipients = state.connectedUsers.filter(
        (u) => u.userId !== userId && u.latitude != null && u.longitude != null,
      );

      const nearbyPayload = recipients.map((u) => ({
        userId: u.userId,
        latitude: showPositions ? u.latitude : null,
        longitude: showPositions ? u.longitude : null,
        isOnline: u.isConnected,
        coordinatesVisible: showPositions,
        user: u.user,
      }));

      socket.emit('nearby_users', nearbyPayload);

      const currentUser = state.connectedUsers.find((u) => u.userId === userId);
      const movementPayload = {
        userId,
        latitude: showPositions ? latitude : null,
        longitude: showPositions ? longitude : null,
        user: currentUser?.user,
        isOnline: true,
        coordinatesVisible: showPositions,
        updatedAt: new Date().toISOString(),
      };

      for (const target of recipients) {
        this.server
          .to(`user_${target.userId}`)
          .emit('user_moved', movementPayload);
      }
    } catch (error) {
      this.logger.error(
        `Failed processing experimental location update for socket ${socket.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      socket.emit('error', {
        message: 'Failed to process experimental location update',
      });
    }
  }
}
