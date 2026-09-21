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
import { toDto } from 'src/shared/database/utils/dtos';
import { RequestWorkflowService } from '../services/request-workflow.service';
import { RequestService } from '../services/request.service';
import { ResponseRequestWorkflowDto } from '../dtos/response-request-workflow.dto';
import { UpdateRequestStatusDto } from '../dtos/update-request-status.dto';
import { BatchNotify } from 'src/shared/notifications/decorators/notify.decorator';
import { NotificationType } from 'src/app/enums/notification-type.enum';
import { AdvancedRequest } from 'src/types';
import { UserService } from 'src/modules/users/services/user.service';
import { identifyUser } from 'src/shared/abstract-user-management/utils/identify-user';
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
  async next(
    @Param('id') id: number,
    @Body() updateRequestStatusDto: UpdateRequestStatusDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRequestWorkflowDto> {
    const updatedRequest = await this.requestWorkflowService.next(
      id,
      updateRequestStatusDto.event,
    );

    const request = await this.requestService.findOneById(id, 'session.user');
    const currentUser = (await this.userService.findOneById(
      req.user!.sub,
    )) as UserEntity;
    const senderId = request?.session?.user?.id;

    if (senderId) {
      const notificationType =
        updateRequestStatusDto.event === RequestEvent.Accept
          ? NotificationType.REQUEST_ACCEPTED
          : NotificationType.REQUEST_REJECTED;

      req.batchNotificationInfo = [
        {
          type: notificationType,
          entries: [
            {
              userId: senderId,
              payload: {
                requestId: id,
                responderId: req.user!.sub,
                responderIdentification: identifyUser(currentUser),
                pictureId: currentUser?.pictureId,
                event: updateRequestStatusDto.event,
              },
            },
          ],
        },
      ];
    }
    return toDto(ResponseRequestWorkflowDto, updatedRequest);
  }
}
