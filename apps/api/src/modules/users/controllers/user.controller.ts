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
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { ApiPaginatedResponse } from 'src/shared/database/decorators/api-paginated-resposne.decorator';
import { toDto, toDtoArray } from 'src/shared/database/utils/dtos';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { LogEvent } from 'src/shared/logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from 'src/types';
import { UserService } from '../services/user.service';
import { ResponseUserDto } from '../dtos/user/response-user.dto';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { UpdateUserObjectivesDto } from '../dtos/user/update-user-objectives.dto';
import { UpdateUserIndustriesDto } from '../dtos/user/update-user-industries.dto';
import { UserConfigurationService } from '../services/user-configuration.service';
import { UpdateUserMapConfigurationDto } from '../dtos/configurations/update-map-configuration.dto';
import { ResponseConfigurationNamespaceDto } from 'src/shared/configurations/dtos/namespace/response-configuration-namespace.dto';

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

  @Get('/list')
  @ApiPaginatedResponse(ResponseUserDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseUserDto>> {
    const paginated = await this.userService.findAllPaginated(query);
    return { ...paginated, data: toDtoArray(ResponseUserDto, paginated.data) };
  }

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<ResponseUserDto[]> {
    const users = await this.userService.findAll(options);
    return toDtoArray(ResponseUserDto, users);
  }

  @Get(':id')
  async findCurrentUser(
    @Param('id') id: string,
    @Query() query: Pick<IQueryObject, 'join'>,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.findRelationalOneById(id, query);
    return toDto(ResponseUserDto, user);
  }

  @Get('/email/:email')
  async findOneByEmail(
    @Param('email') email: string,
  ): Promise<ResponseUserDto | null> {
    return toDto(ResponseUserDto, await this.userService.findOneByEmail(email));
  }

  @Get('/configurations/maps/:id')
  async getMapConfiguration(
    @Param('id') id: string,
  ): Promise<ResponseConfigurationNamespaceDto | null> {
    return toDto(
      ResponseConfigurationNamespaceDto,
      await this.userConfigurationService.getPersonalMapConfiguration(id),
    );
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
    req.logInfo = { id: user.id, firstName: user.firstName };
    return user;
  }

  @Get('/objectives/:id')
  async getObjectives(@Param('id') id: string): Promise<number[]> {
    return this.userService.getObjectives(id);
  }

  @Put('/objectives/:id')
  @LogEvent(EventType.USER_UPDATE)
  async updateObjectives(
    @Param('id') id: string,
    @Body() updateUserObjectivesDto: UpdateUserObjectivesDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.updateObjectives(
      id,
      updateUserObjectivesDto.objectives,
    );
    req.logInfo = { id: user?.id, firstName: user?.firstName };
    return toDto(ResponseUserDto, user);
  }

  @Get('/industries/:id')
  async getIndustries(@Param('id') id: string): Promise<number[]> {
    return this.userService.getIndustries(id);
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
    req.logInfo = { id: user?.id, firstName: user?.firstName };
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
    return toDto(
      ResponseUserDto,
      await this.userService.update(req?.user?.sub, updateUserDto),
    );
  }

  @Put(':id')
  @LogEvent(EventType.USER_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.extendedUpdate(id, updateUserDto);
    req.logInfo = { id: user?.id, firstName: user?.firstName };
    return toDto(ResponseUserDto, user);
  }

  @Put('/activate/:id')
  @LogEvent(EventType.USER_ACTIVATE)
  async activate(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.activate(id);
    req.logInfo = { id: user?.id, firstName: user?.firstName };
    return toDto(ResponseUserDto, user);
  }

  @Put('/deactivate/:id')
  @LogEvent(EventType.USER_DEACTIVATE)
  async deactivate(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    req.logInfo = { id };
    return toDto(ResponseUserDto, await this.userService.deactivate(id));
  }

  @Put('/approve/:id')
  @LogEvent(EventType.USER_APPROVE)
  async approve(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.approve(id);
    req.logInfo = { id: user?.id, firstName: user?.firstName };
    return toDto(ResponseUserDto, user);
  }

  @Put('/disapprove/:id')
  @LogEvent(EventType.USER_DISAPPROVE)
  async disapprove(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.disapprove(id);
    req.logInfo = { id: user?.id, firstName: user?.firstName };
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
    req.logInfo = { id };
    return toDto(ResponseConfigurationNamespaceDto, config);
  }

  @Delete(':id')
  @LogEvent(EventType.USER_DELETE)
  async delete(
    @Param('id') id: string,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userService.softDelete(id);
    req.logInfo = { id: user?.id, firstName: user?.firstName };
    return toDto(ResponseUserDto, user);
  }
}
