import {
  ClassSerializerInterceptor,
  Controller,
  Param,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { UserBlockService } from '../services/user-block.service';
import { AdvancedRequest } from 'src/types';
import { toDto } from 'src/shared/database/utils/dtos';
import { ResponseUserBlockDto } from '../dtos/user-block/response-user-block.dto';
import { ConversationService } from 'src/shared/chat/services/conversation.service';

@ApiTags('user-block')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/user-block',
})
export class UserBlockController {
  constructor(
    private readonly userBlockService: UserBlockService,
    private readonly conversationService: ConversationService,
  ) {}

  @Post('/:id')
  async block(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserBlockDto> {
    if (!req?.user?.sub) {
      throw new Error('User not authenticated');
    }

    const block = await this.userBlockService.blockUser(req.user.sub, id);
    await this.conversationService.removeSharedConversations(req.user.sub, id);
    return toDto(ResponseUserBlockDto, block);
  }
}
