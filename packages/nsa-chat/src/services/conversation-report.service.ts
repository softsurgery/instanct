import { Injectable } from '@nestjs/common';
import { AbstractCrudService } from 'nsa-database';
import { ConversationReportEntity } from '../entities/conversation-report.entity';
import { ConversationReportRepository } from '../repositories/conversation-report.repository';
import { CreateConversationReportDto } from '../dtos/conversation/create-conversation-report.dto';

@Injectable()
export class ConversationReportService extends AbstractCrudService<ConversationReportEntity> {
  constructor(
    private readonly conversationReportRepository: ConversationReportRepository,
  ) {
    super(conversationReportRepository);
  }

  async reportConversation(
    conversationId: number,
    userId: string,
    reportedUserId: string | undefined,
    createConversationReportDto: CreateConversationReportDto,
  ): Promise<ConversationReportEntity> {
    return this.conversationReportRepository.save({
      conversationId,
      userId,
      reportedUserId,
      reason: createConversationReportDto.reason,
      description: createConversationReportDto.description,
    });
  }
}
