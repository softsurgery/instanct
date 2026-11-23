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
import { LogInterceptor } from '@softsurgery/nsa-logger/decorators/logger.interceptor';
import { NotificationInterceptor } from '@softsurgery/nsa-notifications/decorators/notification.interceptor';
import { toDto } from '@softsurgery/nsa-database';
import { RequestWorkflowService } from '../services/request-workflow.service';
import { RequestService } from '../services/request.service';
import { ResponseRequestWorkflowDto } from '../dtos/response-request-workflow.dto';
import { UpdateRequestStatusDto } from '../dtos/update-request-status.dto';
import { BatchNotify } from '@softsurgery/nsa-notifications/decorators/notify.decorator';
import { NotificationType } from 'src/app/enums/notification-type.enum';
import { EventType } from 'src/app/enums/event-type.enum';
import { AdvancedRequest } from '@softsurgery/nsa-helpers/http';
import { UserService } from 'src/modules/users/services/user.service';
import { identifyUser } from '@softsurgery/nsa-um/utils/identify-user';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { RequestEvent } from '../enums/request-event.enum';

@ApiTags('request-workflow')
@ApiBearerAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@UseInterceptors(NotificationInterceptor)
@Controller({
  version: '1',
  path: '/request-workflow',
})
export class RequestWorkflowController {
  constructor(
    private readonly requestWorkflowService: RequestWorkflowService,
    private readonly requestService: RequestService,
    private readonly userService: UserService,
  ) {}

  @Get(':id')
  async findOneById(
    @Param('id') id: number,
    @Query('join') join?: string,
  ): Promise<ResponseRequestWorkflowDto | null> {
    return toDto(
      ResponseRequestWorkflowDto,
      await this.requestWorkflowService.findOneById(id, join),
    );
  }

  @Post(':id/next')
  @BatchNotify(NotificationType.REQUEST_ACCEPTED)
  @BatchNotify(NotificationType.REQUEST_REJECTED)
  @BatchNotify(NotificationType.REQUEST_CANCELLED)
  async next(
    @Param('id') id: number,
    @Body() updateRequestStatusDto: UpdateRequestStatusDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRequestWorkflowDto> {
    const updatedRequest = await this.requestWorkflowService.next(
      id,
      updateRequestStatusDto.event,
      updateRequestStatusDto.cancelReason,
    );

    const request = await this.requestService.findOneById(
      id,
      'session.user,receivers',
    );
    const currentUser = (await this.userService.findOneById(
      req.user!.sub,
    )) as UserEntity;
    const senderId = request?.session?.user?.id;
    const isSender = senderId === req.user!.sub;
    const recipientIds = isSender
      ? (request?.receivers?.map((receiver) => receiver.id) ?? []).filter(
          (uid) => uid !== req.user!.sub,
        )
      : senderId
        ? [senderId]
        : [];

    const eventMap: Record<
      RequestEvent,
      { notificationType: NotificationType; logEvent: EventType }
    > = {
      [RequestEvent.Accept]: {
        notificationType: NotificationType.REQUEST_ACCEPTED,
        logEvent: EventType.REQUEST_ACCEPTED,
      },
      [RequestEvent.Reject]: {
        notificationType: NotificationType.REQUEST_REJECTED,
        logEvent: EventType.REQUEST_REJECTED,
      },
      [RequestEvent.Cancel]: {
        notificationType: NotificationType.REQUEST_CANCELLED,
        logEvent: EventType.REQUEST_CANCELLED,
      },
    };

    const { notificationType, logEvent } =
      eventMap[updateRequestStatusDto.event];

    req.logEvent = logEvent;
    req.logInfo = {
      requestId: id,
      senderId,
      senderName: identifyUser(request?.session?.user),
    };

    if (recipientIds.length > 0) {
      req.batchNotificationInfo = [
        {
          type: notificationType,
          entries: recipientIds.map((userId) => ({
            userId,
            payload: {
              requestId: id,
              responderId: req.user!.sub,
              responderIdentification: identifyUser(currentUser),
              pictureId: currentUser?.pictureId,
              event: updateRequestStatusDto.event,
              isIncoming: isSender,
            },
          })),
        },
      ];
    }
    return toDto(ResponseRequestWorkflowDto, updatedRequest);
  }
}
