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

  async handleConnection(client: AdvancedSocket) {
    const payload = getTokenPayloadForWebSocket(client);
    if (!payload) {
      client.disconnect();
      return;
    }

    await client.join(`user_${payload.sub}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: AdvancedSocket) {}

  // get my conversations ***************************************************************************************************************************

  @SubscribeMessage('get-my-conversations')
  async getMyConversations(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: { query: IQueryObject },
  ) {
    const payload = getTokenPayloadForWebSocket(client);
    const userId = payload?.sub;

    const conversations =
      await this.conversationService.findPaginatedUserConversations(
        {
          ...data.query,
          sort: data.query.sort || 'lastMessage.createdAt,DESC',
          limit: data.query.limit || MAX_LIMIT.toString(),
          page: data.query.page || '1',
          search: data.query.search || '',
        },
        userId,
      );
    client.emit('my-conversations', conversations);
  }

  // join a conversation ******************************************************************************************************************************

  @SubscribeMessage('join-conversation')
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

    client.emit('conversation-messages', recentMessages.data);
  }

  // load messages for a conversation *****************************************************************************************************************

  @SubscribeMessage('get-conversation-messages')
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

    client.emit('conversation-messages', messages.data);
  }

  // new message handler *****************************************************************************************************************************
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: CreateMessageDto,
  ): Promise<void> {
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

    const conversation = await this.conversationService.findOneById(
      data.conversationId,
      'participants,participants.user,lastMessage',
    );

    for (const participant of conversation?.participants ?? []) {
      this.server
        .to(`user_${participant.userId}`)
        .emit('conversation-updated-message', conversation);
    }
  }

  // mark conversation as seen ***********************************************************************************************************************
  @SubscribeMessage('see-conversation')
  async seeConversation(
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

    const conversation = await this.conversationService.markConversationAsSeen(
      data.conversationId,
      userId,
    );

    for (const participant of conversation?.participants ?? []) {
      this.server
        .to(`user_${participant.userId}`)
        .emit('conversation-updated-last-check', conversation);
    }
  }
}
