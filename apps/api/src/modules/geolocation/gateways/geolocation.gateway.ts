import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GeolocationService } from '../services/geolocation.service';
import { AdvancedSocket } from 'src/types';
import { getTokenPayloadForWebSocket } from 'src/shared/auth/utils/token-payload';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/geolocation',
})
@Injectable()
export class GeolocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly geolocationService: GeolocationService) {}

  private connectedUsers = new Map<string, string>();

  handleConnection(client: AdvancedSocket) {
    const payload = getTokenPayloadForWebSocket(client);
    if (!payload) {
      client.disconnect();
      return;
    }

    const userId = payload.sub;
    this.connectedUsers.set(client.id, userId);
  }

  handleDisconnect(client: AdvancedSocket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      console.log(`🔌 User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('identify')
  handleIdentify(@ConnectedSocket() socket: Socket) {
    const payload = getTokenPayloadForWebSocket(socket);
    const userId = payload?.sub;
    if (!userId) {
      socket.emit('error', { message: 'User not identified' });
      return;
    }
    this.connectedUsers.set(socket.id, userId);
    console.log(`User ${userId} identified on socket ${socket.id}`);
    socket.emit('identified', { message: 'User registered successfully' });
  }

  @SubscribeMessage('update_location')
  async handleUpdateLocation(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { latitude: number; longitude: number; radius?: number },
  ) {
    const payload = getTokenPayloadForWebSocket(socket);
    const userId = payload?.sub;
    if (!userId) return socket.emit('error', { message: 'Not identified' });

    const { latitude, longitude, radius = 5 } = data;
    await this.geolocationService.saveNewLocation(
      { latitude, longitude },
      userId,
    );

    const nearby = await this.geolocationService.findByRadius(
      latitude,
      longitude,
      radius,
      userId,
    );

    const connectedIds = [...this.connectedUsers.values()];

    const nearbyWithPresence = nearby.map((u) => ({
      ...u,
      isOnline: connectedIds.includes(u.userId),
    }));

    socket.emit('nearby_users', nearbyWithPresence);

    nearbyWithPresence.forEach((u) => {
      const targetId = [...this.connectedUsers.entries()].find(
        ([, id]) => id === u.userId,
      )?.[0];
      if (targetId) {
        this.server.to(targetId).emit('user_moved', {
          userId,
          latitude,
          longitude,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }
}
