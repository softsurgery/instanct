import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Put,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { toDto, toDtoArray } from 'src/shared/database/utils/dtos';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/shared/logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from 'src/types';
import { UserService } from '../services/user.service';
import { ResponseUserDto } from '../dtos/user/response-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { UserConfigurationService } from '../services/user-configuration.service';
import { UpdateUserMapConfigurationDto } from '../dtos/configurations/update-map-configuration.dto';
import { ResponseConfigurationNamespaceDto } from 'src/shared/configurations/dtos/namespace/response-configuration-namespace.dto';
import { UpdateUserCoverDto } from '../dtos/user/update-user-cover.dto';
import { UserBookmarkService } from '../services/user-bookmark.service';
import { ResponseUserBookmarkDto } from '../dtos/user-bookmark/response-user-bookmark.dto';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';

@ApiTags('current-user')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/current-user',
})
export class CurrentUserController {
  constructor(
    private readonly userService: UserService,
    private readonly userConfigurationService: UserConfigurationService,
    private readonly userBookmarkService: UserBookmarkService,
  ) {}

  @Get('')
  async findCurrentUser(
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    if (!req?.user?.sub) {
      return null;
    }
    const user = await this.userService.findOneById(req?.user?.sub);
    return toDto(ResponseUserDto, user);
  }

  @Get('/configurations/maps/current')
  async getCurrentUserMapConfiguration(
    @Request() req: AdvancedRequest,
  ): Promise<ResponseConfigurationNamespaceDto | null> {
    if (!req?.user?.sub) {
      return null;
    }
    const config =
      await this.userConfigurationService.getPersonalMapConfiguration(
        req?.user?.sub,
      );
    return toDto(ResponseConfigurationNamespaceDto, config);
  }

  @Get('/bookmarks/list')
  async getPaginatedCurrentUserBookmarks(
    @Query() query: IQueryObject,
    @Request() req: AdvancedRequest,
  ): Promise<PageDto<ResponseUserBookmarkDto> | null> {
    if (!req?.user?.sub) {
      return null;
    }
    const paginated = await this.userBookmarkService.findAllPaginatedByUser(
      query,
      req.user.sub,
    );
    return {
      ...paginated,
      data: toDtoArray(ResponseUserBookmarkDto, paginated.data),
    };
  }

  @Put()
  @LogEvent(EventType.USER_UPDATE)
  async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    if (!req?.user?.sub) {
      return null;
    }
    return toDto(
      ResponseUserDto,
      await this.userService.extendedUpdate(req?.user?.sub, updateUserDto),
    );
  }

  @Put('/configuration/maps/current')
  @LogEvent(EventType.USER_UPDATE)
  async updateCurrentUserMapConfiguration(
    @Body() updateUserMapConfigurationDto: UpdateUserMapConfigurationDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseConfigurationNamespaceDto | null> {
    if (!req?.user?.sub) {
      return null;
    }
    const config =
      await this.userConfigurationService.updatePersonalMapConfiguration(
        req.user.sub,
        updateUserMapConfigurationDto,
      );
    req.logInfo = { id: req.user.sub };
    return toDto(ResponseConfigurationNamespaceDto, config);
  }

  @Put('/cover')
  @LogEvent(EventType.USER_UPDATE_COVER)
  async updateCurrentUserCover(
    @Body() updateUserCoverDto: UpdateUserCoverDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    if (!req?.user?.sub) {
      return null;
    }
    const user = await this.userService.updateCover(
      req?.user?.sub,
      updateUserCoverDto.coverId,
    );
    req.logInfo = { id: user?.id, firstName: user?.firstName };
    return toDto(ResponseUserDto, user);
  }

  @Delete('/')
  @LogEvent(EventType.USER_DELETE)
  async deleteCurrent(
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    if (!req?.user?.sub) {
      return null;
    }
    const user = await this.userService.softDelete(req.user.sub);
    req.logInfo = { id: user?.id, firstName: user?.firstName };
    return toDto(ResponseUserDto, user);
  }
}
