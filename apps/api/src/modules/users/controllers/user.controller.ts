import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from '@softsurgery/nsa-database';
import { PageDto } from '@softsurgery/nsa-database';
import { ApiPaginatedResponse } from '@softsurgery/nsa-database';
import { toDto, toDtoArray } from '@softsurgery/nsa-database';
import { LogInterceptor } from '@softsurgery/nsa-logger/decorators/logger.interceptor';
import { LogEvent } from '@softsurgery/nsa-logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from '@softsurgery/nsa-helpers/http';
import { UserService } from '../services/user.service';
import { ResponseUserDto } from '../dtos/user/response-user.dto';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { UpdateUserIndustriesDto } from '../dtos/user/update-user-industries.dto';
import { UserConfigurationService } from '../services/user-configuration.service';
import { UpdateUserMapConfigurationDto } from '../dtos/configurations/update-map-configuration.dto';
import { ResponseConfigurationNamespaceDto } from '@softsurgery/nsa-configurations/dtos/namespace/response-configuration-namespace.dto';
import { Public } from '@softsurgery/nsa-auth/utils/public-strategy';
import { identifyUser } from '@softsurgery/nsa-um/utils/identify-user';
import { AbstractUserEntity } from '@softsurgery/nsa-um/entities/abstract-user.entity';

@ApiTags('user')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/user',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userConfigurationService: UserConfigurationService,
  ) {}

  @Get()
  async findOne(@Query() query: IQueryObject): Promise<ResponseUserDto | null> {
    return toDto(
      ResponseUserDto,
      await this.userService.findOneByCondition(query),
    );
  }

  @Get('list')
  @ApiPaginatedResponse(ResponseUserDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseUserDto>> {
    const paginated = await this.userService.findAllPaginated(query);
    return { ...paginated, data: toDtoArray(ResponseUserDto, paginated.data) };
  }

  @Get('all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseUserDto[]> {
    const users = await this.userService.findAll(options);
    return toDtoArray(ResponseUserDto, users);
  }

  @Public()
  @Get('email/:email')
  async findOneByEmail(
    @Param('email') email: string,
  ): Promise<ResponseUserDto | null> {
    return toDto(ResponseUserDto, await this.userService.findOneByEmail(email));
  }

  @Public()
  @Get('username/:username')
  async findOneByUsername(
    @Param('username') username: string,
  ): Promise<ResponseUserDto | null> {
    return toDto(
      ResponseUserDto,
      await this.userService.findOneByUsername(username),
    );
  }

  @Get('configurations/maps/:id')
  async getMapConfiguration(
    @Param('id') id: string,
  ): Promise<ResponseConfigurationNamespaceDto | null> {
    return toDto(
      ResponseConfigurationNamespaceDto,
      await this.userConfigurationService.getPersonalMapConfiguration(id),
    );
  }

  @Get(':id')
  async findCurrentUser(
    @Param('id') id: string,
    @Query() query: Pick<IQueryObject, 'join'>,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.findOneById(id, query);
    return toDto(ResponseUserDto, user);
  }

  @Get('/industries/:id')
  async getIndustries(@Param('id') id: string): Promise<number[]> {
    return this.userService.getIndustries(id);
  }

  @Post()
  @LogEvent(EventType.USER_CREATE)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto> {
    const user = toDto(
      ResponseUserDto,
      await this.userService.save(createUserDto),
    );
    req.logInfo = {
      targetUserId: user.id,
      targetName: identifyUser(user as unknown as AbstractUserEntity),
    };
    return user;
  }

  @Put('/industries/:id')
  @LogEvent(EventType.USER_UPDATE)
  async updateIndustries(
    @Param('id') id: string,
    @Body() updateUserIndustriesDto: UpdateUserIndustriesDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.updateIndustries(
      id,
      updateUserIndustriesDto.industries,
    );
    req.logInfo = {
      targetUserId: id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseUserDto, user);
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
    const user = await this.userService.update(req?.user?.sub, updateUserDto);
    req.logInfo = {
      targetUserId: user?.id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseUserDto, user);
  }

  @Put(':id')
  @LogEvent(EventType.USER_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.extendedUpdate(id, updateUserDto);
    req.logInfo = {
      targetUserId: user?.id || id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseUserDto, user);
  }

  @Put('/activate/:id')
  @LogEvent(EventType.USER_ACTIVATE)
  async activate(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.activate(id);
    req.logInfo = {
      targetUserId: user?.id || id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseUserDto, user);
  }

  @Put('/deactivate/:id')
  @LogEvent(EventType.USER_DEACTIVATE)
  async deactivate(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.deactivate(id);
    req.logInfo = {
      targetUserId: user?.id || id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseUserDto, user);
  }

  @Put('/approve/:id')
  @LogEvent(EventType.USER_APPROVE)
  async approve(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.approve(id);
    req.logInfo = {
      targetUserId: user?.id || id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseUserDto, user);
  }

  @Put('/disapprove/:id')
  @LogEvent(EventType.USER_DISAPPROVE)
  async disapprove(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.disapprove(id);
    req.logInfo = {
      targetUserId: user?.id || id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseUserDto, user);
  }

  @Put('/configuration/maps/:id')
  @LogEvent(EventType.USER_UPDATE)
  async updateMapConfiguration(
    @Param('id') id: string,
    @Body() updateUserMapConfigurationDto: UpdateUserMapConfigurationDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseConfigurationNamespaceDto | null> {
    const config =
      await this.userConfigurationService.updatePersonalMapConfiguration(
        id,
        updateUserMapConfigurationDto,
      );
    const user = await this.userService.findOneById(id);
    req.logInfo = {
      targetUserId: id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseConfigurationNamespaceDto, config);
  }

  @Delete(':id')
  @LogEvent(EventType.USER_DELETE)
  async delete(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.softDelete(id);
    req.logInfo = {
      targetUserId: user?.id || id,
      targetName: identifyUser(user),
    };
    return toDto(ResponseUserDto, user);
  }
}
