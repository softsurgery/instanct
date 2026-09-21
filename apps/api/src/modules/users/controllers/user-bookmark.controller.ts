import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Delete,
  Param,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { UserBookmarkService } from '../services/user-bookmark.service';
import { LogEvent } from 'src/shared/logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from 'src/types';
import { ResponseUserBookmarkDto } from '../dtos/user-bookmark/response-user-bookmark.dto';
import { toDto } from 'src/shared/database/utils/dtos';
import { UserService } from '../services/user.service';
import { identifyUser } from 'src/shared/abstract-user-management/utils/identify-user';

@ApiTags('user-bookmark')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/user-bookmark',
})
export class UserBookmarkController {
  constructor(
    private readonly userService: UserService,
    private readonly userBookmarkService: UserBookmarkService,
  ) {}

  @Get('/:id')
  async findBookmark(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserBookmarkDto | null> {
    if (!req?.user?.sub) {
      throw new Error('User not authenticated');
    }
    const bookmark = await this.userBookmarkService.findBookmark(
      req?.user?.sub,
      id,
    );
    return toDto(ResponseUserBookmarkDto, bookmark);
  }

  @Post('/:id')
  @LogEvent(EventType.BOOKMARK_CREATED)
  async create(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserBookmarkDto> {
    if (!req?.user?.sub) {
      throw new Error('User not authenticated');
    }
    const bookmark = toDto(
      ResponseUserBookmarkDto,
      await this.userBookmarkService.saveBookmark(req?.user?.sub, id),
    );
    const user = await this.userService.findOneById(req?.user?.sub);
    const bookmarkedUser = await this.userService.findOneById(id);

    req.logInfo = {
      id: bookmark.id,
      userId: bookmark.userId,
      userIdentity: identifyUser(user),
      bookmarkId: bookmark.bookmarkId,
      bookmarkIdentity: identifyUser(bookmarkedUser),
    };
    return bookmark;
  }

  @Delete('/:id')
  @LogEvent(EventType.BOOKMARK_DELETED)
  async delete(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserBookmarkDto | null> {
    if (!req?.user?.sub) {
      throw new Error('User not authenticated');
    }
    const bookmark = await this.userBookmarkService.deleteBookmark(
      req?.user?.sub,
      id,
    );

    const user = await this.userService.findOneById(req?.user?.sub);
    const bookmarkedUser = await this.userService.findOneById(id);

    req.logInfo = {
      id: bookmark?.id,
      userId: bookmark?.userId,
      userIdentity: identifyUser(user),
      bookmarkId: bookmark?.bookmarkId,
      bookmarkIdentity: identifyUser(bookmarkedUser),
    };
    return toDto(ResponseUserBookmarkDto, bookmark);
  }
}
