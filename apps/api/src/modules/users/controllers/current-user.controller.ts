import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Put,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { toDto } from 'src/shared/database/utils/dtos';
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
  ) {}

  @Get('/current')
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

  @Put('/current')
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
      await this.userService.update(req?.user?.sub, updateUserDto),
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
}
