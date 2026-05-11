import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { getTokenPayloadForWebSocket } from 'src/shared/auth/utils/token-payload';
import { AdvancedSocket } from 'src/types';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dtos/message/create-message.dto';
import { ConversationService } from '../services/conversation.service';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';

const MAX_LIMIT = 20;

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) {}

  handleConnection(client: AdvancedSocket) {
    const payload = getTokenPayloadForWebSocket(client);
    if (!payload) {
      client.disconnect();
      return;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: AdvancedSocket) {}

  /**
   * When user joins a conversation, load the latest 10 messages
   */
  @SubscribeMessage('my-conversations')
  async listMyConversations(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: { query: IQueryObject },
  ) {
    const payload = getTokenPayloadForWebSocket(client);
    const userId = payload?.sub;

    const query: IQueryObject = {
      page: data.query?.page ?? '1',
      limit: data.query?.limit ?? MAX_LIMIT.toString(),
      sort: data.query?.sort ?? 'lastMessageAt.createdAt,DESC',
      ...(data.query?.filter ? { filter: data.query.filter } : {}),
      ...(data.query?.search ? { search: data.query.search } : {}),
    };

    const conversations =
      await this.conversationService.findPaginatedUserConversations(
        query,
        userId,
      );

    client.emit('my-conversations', conversations);
  }

  /**
   * When user joins a conversation, load the latest 10 messages
   */
  @SubscribeMessage('joinConversation')
  async joinConversation(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const payload = getTokenPayloadForWebSocket(client);
    const userId = payload?.sub;

    const isParticipant = await this.conversationService.isUserInConversation(
      data.conversationId,
      userId,
    );

    if (!isParticipant) {
      client.emit('error', 'You are not part of this conversation');
      return;
    }

    await client.join(`conversation_${data.conversationId}`);

    const recentMessages =
      await this.messageService.findPaginatedConversationMessages(
        {
          sort: 'createdAt,DESC',
          limit: MAX_LIMIT.toString(),
          page: '1',
        },
        data.conversationId,
      );

    // send messages to the client (latest 10)
    client.emit('conversationMessages', recentMessages.data);
  }

  /**
   * When user requests older messages (scrolls up)
   */
  @SubscribeMessage('getConversationMessages')
  async getConversationMessages(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody()
    data: { conversationId: number; page?: string; limit?: number },
  ) {
    const payload = getTokenPayloadForWebSocket(client);
    const userId = payload?.sub;

    const isParticipant = await this.conversationService.isUserInConversation(
      data.conversationId,
      userId,
    );

    if (!isParticipant) {
      client.emit('error', 'You are not part of this conversation');
      return;
    }

    const messages =
      await this.messageService.findPaginatedConversationMessages(
        {
          sort: 'createdAt,DESC',
          limit: MAX_LIMIT.toString(),
          page: data.page ?? '1',
        },
        data.conversationId,
      );

    client.emit('conversationMessages', messages.data);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: CreateMessageDto,
  ) {
    const payload = getTokenPayloadForWebSocket(client);
    const userId = payload?.sub;

    const isParticipant = await this.conversationService.isUserInConversation(
      data.conversationId,
      userId,
    );
    if (!isParticipant) {
      client.emit('error', 'You are not part of this conversation');
      return;
    }

    const message = await this.messageService.createMessage(data, userId);

    this.server
      .to(`conversation_${data.conversationId}`)
      .emit('message', message);
  }
}
