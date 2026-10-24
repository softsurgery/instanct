import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IQueryObject } from "@softsurgery/nsa-database";
import { PageDto } from "@softsurgery/nsa-database";
import { ApiPaginatedResponse } from "@softsurgery/nsa-database";
import { toDto, toDtoArray } from "@softsurgery/nsa-database";
import { LogInterceptor } from "@softsurgery/nsa-logger/decorators/logger.interceptor";
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseInterceptors,
} from "@nestjs/common";
import { AdvancedRequest } from "@softsurgery/nsa-helpers/http";
import { NotificationService } from "../services/notification.service";
import { ResponseNotificationDto } from "../dtos/response-notification.dto";
import { NotificationGateway } from "../gateways/notification.gateway";
import { NOTIFICATION_TYPE } from "../enums/notification-type.registry";

@ApiTags("notification")
@ApiBearerAuth("access_token")
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LogInterceptor)
@Controller({
  version: "1",
  path: "/notification",
})
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
    @Inject(NOTIFICATION_TYPE)
    private readonly notificationType: Record<string, string>,
  ) {}

  @Get("/unread-count")
  async getUnreadCount(
    @Request() req: AdvancedRequest,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(req?.user?.sub);
    return { count };
  }

  @Get("/list")
  @ApiPaginatedResponse(ResponseNotificationDto)
  async findAllPaginated(
    @Query() query: IQueryObject,
    @Request() req: AdvancedRequest,
  ): Promise<PageDto<ResponseNotificationDto>> {
    const paginated = await this.notificationService.findAllPaginatedByUser(
      query,
      req?.user?.sub,
    );
    return {
      ...paginated,
      data: toDtoArray(ResponseNotificationDto, paginated.data),
    };
  }

  @Get("/list/:id")
  @ApiPaginatedResponse(ResponseNotificationDto)
  async findAllUserPaginated(
    @Param("id") id: string,
    @Query() query: IQueryObject,
  ): Promise<PageDto<ResponseNotificationDto>> {
    const paginated = await this.notificationService.findAllPaginatedByUser(
      query,
      id,
    );
    return {
      ...paginated,
      data: toDtoArray(ResponseNotificationDto, paginated.data),
    };
  }

  @Get(":id")
  async findOneById(
    @Param("id") id: number,
  ): Promise<ResponseNotificationDto | null> {
    return toDto(
      ResponseNotificationDto,
      await this.notificationService.findOneById(id),
    );
  }

  @Post("/mark-read")
  async markAllAsRead(@Request() req: AdvancedRequest): Promise<void> {
    await this.notificationService.markAllAsRead(req?.user?.sub);
  }

  @Post("test/:id")
  async triggerNotification(@Param("id") id: string): Promise<void> {
    await this.notificationGateway.notifyUser(id, this.notificationType.TEST, {
      userId: id,
    });
  }
}
