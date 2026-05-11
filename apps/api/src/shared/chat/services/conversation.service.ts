import { Transactional } from '@nestjs-cls/transactional';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FindManyOptions, In } from 'typeorm';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ConversationEntity } from '../entities/conversation.entity';
import { CreateConversationDto } from '../dtos/conversation/create-conversation.dto';
import { UserNotFoundException } from 'src/shared/abstract-user-management/errors/user/user.notfound.error';
import { UserService } from 'src/modules/users/services/user.service';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { MessageService } from './message.service';
import { ConversationNotFoundException } from '../errors/conversation/conversation.notfound.error';
import { ConversationUserEntity } from '../entities/conversation-user.entity';
import { ConversationUserService } from './conversation-user.service';

@Injectable()
export class ConversationService extends AbstractCrudService<ConversationEntity> {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationUserService: ConversationUserService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {
    super(conversationRepository);
  }

  async isUserInConversation(
    conversationId: number,
    userId?: string,
  ): Promise<boolean> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    } as FindManyOptions<ConversationEntity>);

    if (!conversation) return false;
    return conversation.participants.some((p) => p.userId === userId);
  }

  async findPaginatedUserConversations(
    query: IQueryObject,
    userId?: string,
  ): Promise<PageDto<ConversationEntity>> {
    const queryBuilder = new QueryBuilder(
      this.conversationRepository.getMetadata(),
    );

    const queryOptions = queryBuilder.build(query);

    const userConversations =
      await this.conversationUserService.findByUserId(userId);

    const conversationIds = userConversations.map((uc) => uc.conversationId);

    queryOptions.where = {
      ...(queryOptions.where || {}),
      id: In(conversationIds),
    };

    const count = await this.conversationRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.conversationRepository.findAll(
      queryOptions as FindManyOptions<ConversationEntity>,
    );

    // Fetch last message for each conversation
    await this.populateLastMessages(entities);

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: Number(query.page),
        take: Number(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  private async populateLastMessages(
    conversations: ConversationEntity[],
  ): Promise<void> {
    if (conversations.length === 0) return;

    await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage =
          await this.messageService.findConversationLastMessage(
            conversation.id,
          );
        if (lastMessage) {
          conversation.messages = [lastMessage];
        } else {
          conversation.messages = [];
        }
      }),
    );
  }

  @Transactional()
  async createConversation(
    targetUserId: string,
    userId?: string,
    duplicateCheck = true,
  ): Promise<ConversationEntity> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }
    const targetUser = await this.userService.findOneById(targetUserId);
    if (!targetUser) {
      throw new UserNotFoundException();
    }

    const existingConversation = await this.findConversationByUsers([
      userId,
      targetUserId,
    ]);

    if (duplicateCheck && existingConversation) return existingConversation;

    const conversation = await this.conversationRepository.save(
      new ConversationEntity(),
    );

    const participantEntries = [userId, targetUserId].map((uid) => {
      const cu = new ConversationUserEntity();
      cu.userId = uid;
      cu.conversationId = conversation.id;
      return cu;
    });
    conversation.participants =
      await this.conversationUserService.saveMany(participantEntries);

    return conversation;
  }

  @Transactional()
  async createGroupedConversation(
    createConversationDto: CreateConversationDto,
    userId?: string,
  ): Promise<ConversationEntity> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }
    for (const targetUserId of createConversationDto.users) {
      const targetUser = await this.userService.findOneById(targetUserId);
      if (!targetUser) {
        throw new UserNotFoundException();
      }
    }

    const conversation = await this.conversationRepository.save(
      new ConversationEntity(),
    );

    const participantEntries = [userId, ...createConversationDto.users].map(
      (uid) => {
        const cu = new ConversationUserEntity();
        cu.userId = uid;
        cu.conversationId = conversation.id;
        return cu;
      },
    );
    conversation.participants =
      await this.conversationUserService.saveMany(participantEntries);

    return conversation;
  }

  async findConversationByUsers(
    userIds: string[],
  ): Promise<ConversationEntity | null> {
    const conversations =
      await this.conversationRepository.getUsersConversations(userIds);
    return conversations.length > 0 ? conversations[0] : null;
  }

  async markConversationAsSeen(
    conversationId: number,
    userId?: string,
  ): Promise<ConversationEntity | null> {
    const conversation = await this.findOneById(conversationId);

    if (!conversation) {
      throw new ConversationNotFoundException();
    }

    if (!conversation.participants.some((p) => p.userId === userId)) {
      throw new BadRequestException(
        'User is not a participant of the conversation',
      );
    }

    return this.update(conversationId, { seenAt: new Date() });
  }
}
