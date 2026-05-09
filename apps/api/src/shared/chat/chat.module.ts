import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { MessageService } from './services/message.service';
import { ChatGateway } from './gateways/chat.gateway';
import { ConversationService } from './services/conversation.service';
import { ChatService } from './services/chat.service';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { TriggerRegistry } from '../database/services/trigger-registry.service';
import { ConversationParticipantsTrigger } from './triggers/conversation-participants.trigger';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [],
  providers: [
    ConversationRepository,
    MessageRepository,
    MessageService,
    ConversationService,
    ChatService,
    ChatGateway,
  ],
  exports: [
    ConversationRepository,
    MessageRepository,
    ConversationService,
    MessageService,
    ChatService,
  ],
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity]),
    UserManagementModule,
    DatabaseModule,
  ],
})
export class ChatModule {
  constructor(registry: TriggerRegistry) {
    registry.register(new ConversationParticipantsTrigger());
  }
}
