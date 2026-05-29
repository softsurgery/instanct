import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogInterceptor } from 'src/shared/logger/decorators/logger.interceptor';
import { NotificationInterceptor } from 'src/shared/notifications/decorators/notification.interceptor';
import { RequestService } from '../services/request.service';
import { ApiPaginatedResponse } from 'src/shared/database/decorators/api-paginated-resposne.decorator';
import { ResponseRequestDto } from '../dtos/response-request.dto';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { toDto, toDtoArray } from 'src/shared/database/utils/dtos';
import { CreateRequestDto } from '../dtos/create-request.dto';
import { LogEvent } from 'src/shared/logger/decorators/log-event.decorator';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from 'src/types';
import { BatchNotify } from 'src/shared/notifications/decorators/notify.decorator';
import { NotificationType } from 'src/app/enums/notification-type.enum';
import { UserService } from 'src/modules/users/services/user.service';
import { identifyUser } from 'src/shared/abstract-user-management/utils/identify-user';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@ApiTags('requests')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@UseInterceptors(NotificationInterceptor)
@Controller({
  version: '1',
  path: '/requests',
})
export class RequestController {
  constructor(
    private readonly requestService: RequestService,
    private readonly userService: UserService,
  ) {}

  @Get('/list')
  @ApiPaginatedResponse(ResponseRequestDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseRequestDto>> {
    const paginated = await this.requestService.findAllPaginated(query);
    return {
      ...paginated,
      data: toDtoArray(ResponseRequestDto, paginated.data),
    };
  }

  @Get('/all')
  async findAll(@Query() query: IQueryObject): Promise<ResponseRequestDto[]> {
    const requests = await this.requestService.findAll(query);
    return toDtoArray(ResponseRequestDto, requests);
  }

  @Get('/incoming/list')
  async findAllIncomingNonPaginated(
    @Query() query: IQueryObject,
    @Request() req: AdvancedRequest,
  ): Promise<PageDto<ResponseRequestDto>> {
    if (!req?.user?.sub) {
      throw new Error('User not authenticated');
    }
    const paginated = await this.requestService.findIncomingRequestsPaginated(
      query,
      req.user.sub,
    );
    return {
      ...paginated,
      data: toDtoArray(ResponseRequestDto, paginated.data),
    };
  }

  @Get('/outgoing/list')
  async findAllOutgoingNonPaginated(
    @Query() query: IQueryObject,
    @Request() req: AdvancedRequest,
  ): Promise<PageDto<ResponseRequestDto>> {
    if (!req?.user?.sub) {
      throw new Error('User not authenticated');
    }
    const paginated = await this.requestService.findOutgoingRequestsPaginated(
      query,
      req.user.sub,
    );
    return {
      ...paginated,
      data: toDtoArray(ResponseRequestDto, paginated.data),
    };
  }

  @Get(':id')
  async findOneById(
    @Param('id') id: string,
    @Query() query: IQueryObject,
  ): Promise<ResponseRequestDto | null> {
    const request = await this.requestService.findOneById(id, query.join);
    return toDto(ResponseRequestDto, request);
  }

  @Post()
  @LogEvent(EventType.REQUEST_CREATED)
  @BatchNotify(NotificationType.REQUEST_RECEIVED)
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRequestDto | null> {
    if (!req?.user?.sub) return null;
    const user = (await this.userService.findOneById(
      req.user.sub,
    )) as UserEntity;
    const request = await this.requestService.sendRequest(
      createRequestDto,
      req.user.sub,
    );
    req.logInfo = {
      id: request.id,
      receiverSessionIds: createRequestDto.receiverIds,
    };
    req.batchNotificationInfo = [
      {
        type: NotificationType.REQUEST_RECEIVED,
        entries: createRequestDto.receiverIds.map((receiverId) => ({
          userId: receiverId,
          payload: {
            requestId: request.id,
            senderId: req?.user?.sub,
            senderIdentification: identifyUser(user),
            pictureId: user?.pictureId,
          },
        })),
      },
    ];
    return toDto(ResponseRequestDto, request);
  }
}
