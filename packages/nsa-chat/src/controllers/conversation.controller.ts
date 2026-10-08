import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'nsa-database';
import { PageDto } from 'nsa-database';
import { ApiPaginatedResponse } from 'nsa-database';
import { toDto, toDtoArray } from 'nsa-database';
import { LogInterceptor } from 'nsa-logger/decorators/logger.interceptor';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { ResponseConversationDto } from '../dtos/conversation/response-conversation.dto';

@ApiTags('conversation')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/conversation',
})
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOperation({
    description: 'Find all paginated user conversations',
    summary: 'Find all paginated user conversations',
  })
  @Get('/list')
  @ApiPaginatedResponse(ResponseConversationDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseConversationDto>> {
    const paginated =
      await this.conversationService.findPaginatedUserConversations(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseConversationDto, paginated.data),
    };
  }

  @ApiOperation({
    description: 'Find all paginated conversations of a specific user',
    summary: 'Find all paginated conversations of a specific user',
  })
  @Get('/list/:id')
  @ApiPaginatedResponse(ResponseConversationDto)
  async findAllUserPaginated(
    @Param('id') id: string,
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseConversationDto>> {
    const paginated =
      await this.conversationService.findPaginatedUserConversations(query, id);
    return {
      ...paginated,
      data: toDtoArray(ResponseConversationDto, paginated.data),
    };
  }

  @ApiOperation({
    description: 'Find a conversation by its id',
    summary: 'Find a conversation by its id',
  })
  @Get(':id')
  async findOneById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseConversationDto | null> {
    return toDto(
      ResponseConversationDto,
      await this.conversationService.findOneById(id),
    );
  }
}
