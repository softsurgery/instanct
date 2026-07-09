import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/shared/database/decorators/api-paginated-resposne.decorator';
import { toDto, toDtoArray } from 'src/shared/database/utils/dtos';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { ResponseConversationDto } from '../dtos/conversation/response-conversation.dto';
import { AdvancedRequest } from 'src/types';
import { CreateConversationDto } from '../dtos/conversation/create-conversation.dto';
import { CreateConversationReportDto } from '../dtos/conversation/create-conversation-report.dto';

@ApiTags('current-conversation')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/current-conversation',
})
export class CurrentConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get('/unread-count')
  async getUnreadCount(
    @Request() req: AdvancedRequest,
  ): Promise<{ count: number }> {
    const count = await this.conversationService.getUnreadConversationCount(
      req?.user?.sub,
    );
    return { count };
  }

  @Get('/list')
  @ApiPaginatedResponse(ResponseConversationDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
    @Request() req: AdvancedRequest,
  ): Promise<PageDto<ResponseConversationDto>> {
    const paginated =
      await this.conversationService.findPaginatedUserConversations(
        query,
        req?.user?.sub,
      );
    return {
      ...paginated,
      data: toDtoArray(ResponseConversationDto, paginated.data),
    };
  }

  @Get(':id')
  async findOneById(
    @Param('id') id: number,
    @Query() query: IQueryObject,
  ): Promise<ResponseConversationDto | null> {
    return toDto(
      ResponseConversationDto,
      await this.conversationService.findOneById(id, query?.join),
    );
  }

  @Post()
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseConversationDto> {
    const conversation = await this.conversationService.createConversation(
      createConversationDto.users[0],
      req?.user?.sub,
    );
    return toDto(ResponseConversationDto, conversation);
  }

  @Post(':id/report')
  async reportConversation(
    @Param('id') id: number,
    @Body() createConversationReportDto: CreateConversationReportDto,
    @Request() req: AdvancedRequest,
  ): Promise<void> {
    await this.conversationService.reportConversation(
      id,
      req?.user?.sub,
      createConversationReportDto,
    );
  }

  @Delete(':id')
  async deleteConversation(
    @Param('id') id: number,
    @Request() req: AdvancedRequest,
  ): Promise<void> {
    await this.conversationService.leaveConversation(id, req?.user?.sub);
  }
}
