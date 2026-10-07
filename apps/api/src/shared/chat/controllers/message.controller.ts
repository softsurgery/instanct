import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'nsa-database';
import { PageDto } from 'nsa-database';
import { ApiPaginatedResponse } from 'nsa-database';
import { toDtoArray } from 'nsa-database';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { ResponseMessageDto } from '../dtos/message/response-message.dto';

@ApiTags('message')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/message',
})
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({
    description: 'Find all paginated messages of a specific conversation',
    summary: 'Find all paginated messages of a specific conversation',
  })
  @Get(':id/list')
  @ApiPaginatedResponse(ResponseMessageDto)
  async findPaginatedConversationMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseMessageDto>> {
    const paginated =
      await this.messageService.findPaginatedConversationMessages(query, id);

    return {
      ...paginated,
      data: toDtoArray(ResponseMessageDto, paginated.data),
    };
  }
}
