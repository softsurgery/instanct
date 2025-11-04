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
import { CreateGeolocationDto } from '../dtos/create-geolocation.dto';
import { AdvancedSocket } from 'src/types';
import { getTokenPayloadForWebSocket } from 'src/shared/auth/utils/token-payload';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
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
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: AdvancedSocket) {}

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
    @MessageBody() data: CreateGeolocationDto & { radius?: number },
  ) {
    const payload = getTokenPayloadForWebSocket(socket);
    const userId = payload?.sub;
    if (!userId) {
      socket.emit('error', { message: 'User not identified' });
      return;
    }

    const { latitude, longitude, radius = 5 } = data;

    if (!latitude || !longitude) {
      socket.emit('error', { message: 'Missing location data' });
      return;
    }

    // Save/update user location
    await this.geolocationService.saveNewLocation(
      { latitude, longitude },
      userId,
    );

    // Fetch nearby users
    const nearby = await this.geolocationService.findByRadius(
      latitude,
      longitude,
      radius,
      userId,
    );

    socket.emit('nearby_users', nearby);

    nearby.forEach((user) => {
      const targetSocketId = [...this.connectedUsers.entries()].find(
        ([, id]) => id === user.userId,
      )?.[0];

      if (targetSocketId) {
        this.server.to(targetSocketId).emit('user_moved', {
          userId,
          latitude,
          longitude,
        });
      }
    });
  }
}
