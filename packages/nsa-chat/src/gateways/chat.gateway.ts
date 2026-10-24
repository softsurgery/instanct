import { Inject, OnModuleInit, Optional } from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { getTokenPayloadForWebSocket } from "@softsurgery/nsa-auth/utils/token-payload";
import { AdvancedSocket } from "@softsurgery/nsa-helpers/http";
import { MessageService } from "../services/message.service";
import { CreateMessageDto } from "../dtos/message/create-message.dto";
import { ConversationService } from "../services/conversation.service";
import {
  USER_REPOSITORY,
  AppUserRepository,
} from "@softsurgery/nsa-um/tokens/user-access";
import {
  UserPresenceEvent,
  UserPresenceService,
} from "@softsurgery/nsa-um/services/user-presence.service";
import { ConversationEntity } from "../entities/conversation.entity";
import { DeepPartial } from "typeorm";

const MAX_LIMIT = 20;

@WebSocketGateway({
  namespace: "/chat",
  cors: { origin: "*" },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: AppUserRepository,
    @Optional()
    private readonly userPresenceService?: UserPresenceService,
  ) {}

  /**
   * Initializes module and subscribes to centralized presence events
   * to broadcast presence updates to all clients connected to the /chat namespace.
   */
  onModuleInit() {
    this.userPresenceService?.onPresenceChange((event: UserPresenceEvent) => {
      this.server?.emit("user-presence", event);
    });
  }

  /**
   * Handles incoming chat WebSocket connection, verifies token, joins personal user room,
   * and registers the connection with the centralized UserPresenceService.
   */
  async handleConnection(client: AdvancedSocket) {
    const payload = getTokenPayloadForWebSocket(client);
    if (!payload) {
      client.disconnect();
      return;
    }

    const userId = payload.sub;
    client.data.userId = userId;
    await client.join(`user_${userId}`);

    const source = this.extractClientSource(client);

    // Centralize presence tracking into UserPresenceService
    this.userPresenceService?.trackConnection(
      userId,
      client.id,
      source,
      "chat",
    );
  }

  /**
   * Handles chat WebSocket disconnection and deregisters connection from UserPresenceService.
   */
  async handleDisconnect(client: AdvancedSocket) {
    const payload = getTokenPayloadForWebSocket(client);
    if (!payload?.sub) return;

    const userId = payload.sub;

    // Centralize disconnection tracking into UserPresenceService
    this.userPresenceService?.trackDisconnection(userId, client.id, "chat");
  }

  /**
   * Retrieves and emits presence status for a single user using UserPresenceService.
   */
  @SubscribeMessage("get-user-status")
  async handleGetUserStatus(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: { userId: string },
  ) {
    if (!data?.userId) return;

    let status;
    if (this.userPresenceService) {
      status = await this.userPresenceService.getUserStatus(data.userId);
    } else {
      const isConnected = this.isUserConnected(data.userId);
      const user = await this.userRepository.findOneById(data.userId);
      status = {
        userId: data.userId,
        isConnected,
        sources: [],
        lastSeen: user?.lastSeen ?? null,
      };
    }

    client.emit("user-status", status);
    return status;
  }

  /**
   * Retrieves and emits presence statuses for multiple users in batch using UserPresenceService.
   */
  @SubscribeMessage("get-users-status")
  async handleGetUsersStatus(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: { userIds: string[] },
  ) {
    const userIds = data?.userIds ?? [];

    let statuses;
    if (this.userPresenceService) {
      statuses = await this.userPresenceService.getUsersStatus(userIds);
    } else {
      statuses = await Promise.all(
        userIds.map(async (userId) => {
          const isConnected = this.isUserConnected(userId);
          const user = await this.userRepository.findOneById(userId);
          return {
            userId,
            isConnected,
            sources: [],
            lastSeen: user?.lastSeen ?? null,
          };
        }),
      );
    }

    client.emit("users-status", statuses);
    return statuses;
  }

  /**
   * Checks whether a user is connected via centralized UserPresenceService.
   */
  isUserConnected(userId: string): boolean {
    return this.userPresenceService?.isUserConnected(userId) ?? false;
  }

  /**
   * Helper to extract client source ('web' | 'mobile') from handshake data.
   */
  private extractClientSource(client: AdvancedSocket): string {
    return (
      (client.handshake?.auth?.source as string) ||
      (client.handshake?.query?.source as string) ||
      (client.handshake?.headers?.["x-client-source"] as string) ||
      (client.handshake?.headers?.["source"] as string) ||
      "chat"
    );
  }

  /**
   * Broadcasts updated unread conversation count to a specific user.
   */
  async emitUnreadCountUpdate(userId?: string): Promise<void> {
    if (!userId) {
      return;
    }

    const count =
      await this.conversationService.getUnreadConversationCount(userId);

    this.server
      .to(`user_${userId}`)
      .emit("conversations-unread-count", { count });
  }

  /**
   * Emits new conversation creation event and unread count update to all conversation participants.
   */
  async emitNewConversation(
    conversationId: number,
    creatorUserId?: string,
  ): Promise<void> {
    const conversation = await this.conversationService.findOneById(
      conversationId,
      "participants,participants.user,lastMessage,lastMessage.uploads",
    );

    if (!conversation) {
      return;
    }

    for (const participant of conversation.participants ?? []) {
      this.server
        .to(`user_${participant.userId}`)
        .emit("conversation-created", {
          conversation,
          creatorUserId,
        });
    }

    for (const participant of conversation.participants ?? []) {
      if (participant.userId !== creatorUserId) {
        await this.emitUnreadCountUpdate(participant.userId);
      }
    }
  }

  /**
   * Subscribes a client to a conversation room and returns recent paginated messages.
   */
  @SubscribeMessage("join-conversation")
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
      client.emit("error", "You are not part of this conversation");
      return;
    }

    const rooms = [...client.rooms];

    for (const room of rooms) {
      if (room.startsWith("conversation_")) {
        await client.leave(room);
      }
    }

    await client.join(`conversation_${data.conversationId}`);

    const recentMessages =
      await this.messageService.findPaginatedConversationMessages(
        {
          sort: "createdAt,DESC",
          limit: MAX_LIMIT.toString(),
          page: "1",
        },
        data.conversationId,
      );

    client.emit("conversation-messages", recentMessages.data);
  }

  /**
   * Fetches paginated messages for a conversation requested by a participant.
   */
  @SubscribeMessage("get-conversation-messages")
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
      client.emit("error", "You are not part of this conversation");
      return;
    }

    const messages =
      await this.messageService.findPaginatedConversationMessages(
        {
          sort: "createdAt,DESC",
          limit: MAX_LIMIT.toString(),
          page: data.page ?? "1",
        },
        data.conversationId,
      );

    client.emit("conversation-messages", messages.data);
  }

  /**
   * Handles incoming new chat message creation, updates conversation seen timestamps,
   * and emits the message to the conversation room and participant user rooms.
   */
  @SubscribeMessage("message")
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
      client.emit("error", "You are not part of this conversation");
      return;
    }

    const message = await this.messageService.createMessage(data, userId);

    await this.conversationService.markConversationAsSeen(
      data.conversationId,
      userId,
      message.createdAt,
    );

    this.server
      .to(`conversation_${data.conversationId}`)
      .emit("message", message);

    let conversation: DeepPartial<ConversationEntity> =
      (await this.conversationService.findOneById(
        data.conversationId,
        "participants,participants.user,lastMessage,lastMessage.uploads",
      )) as DeepPartial<ConversationEntity>;

    conversation = {
      ...conversation,
      messages: [message],
    };

    for (const participant of conversation?.participants ?? []) {
      this.server
        .to(`user_${participant.userId}`)
        .emit("conversation-updated-last-check", conversation);
    }

    for (const participant of conversation?.participants ?? []) {
      this.server
        .to(`user_${participant.userId}`)
        .emit("conversation-updated-message", conversation);
    }
  }

  /**
   * Marks a conversation as seen by the current user and notifies other participants.
   */
  @SubscribeMessage("see-conversation")
  async seeConversation(
    @ConnectedSocket() client: AdvancedSocket,
    @MessageBody() data: { conversationId: number; lastCheck?: string },
  ) {
    const payload = getTokenPayloadForWebSocket(client);
    const userId = payload?.sub;

    const isParticipant = await this.conversationService.isUserInConversation(
      data.conversationId,
      userId,
    );

    if (!isParticipant) {
      client.emit("error", "You are not part of this conversation");
      return;
    }

    const conversation = await this.conversationService.markConversationAsSeen(
      data.conversationId,
      userId,
      data.lastCheck ? new Date(data.lastCheck) : new Date(),
    );

    for (const participant of conversation?.participants ?? []) {
      this.server
        .to(`user_${participant.userId}`)
        .emit("conversation-updated-last-check", conversation);
    }
  }
}
