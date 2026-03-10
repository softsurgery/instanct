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

@ApiTags('requests')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: '1',
  path: '/requests',
})
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

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
  async findAll(@Query() options: IQueryObject): Promise<ResponseRequestDto[]> {
    const requests = await this.requestService.findAll(options);
    return toDtoArray(ResponseRequestDto, requests);
  }

  @Get(':id')
  async findOneById(
    @Param('id') id: string,
  ): Promise<ResponseRequestDto | null> {
    const request = await this.requestService.findOneById(id);
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
    const request = await this.requestService.sendRequest(
      createRequestDto,
      req.user.sub,
    );
    req.logInfo = {
      id: request.id,
      receiversIds: createRequestDto.receiversIds,
    };
    req.batchNotificationInfo = [
      {
        type: NotificationType.REQUEST_RECEIVED,
        entries: createRequestDto.receiversIds.map((receiverId) => ({
          userId: receiverId,
          payload: {
            requestId: request.id,
            senderId: req?.user?.sub,
          },
        })),
      },
    ];
    return toDto(ResponseRequestDto, request);
  }
}
