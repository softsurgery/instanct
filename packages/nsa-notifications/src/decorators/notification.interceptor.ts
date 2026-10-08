import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';
import { AdvancedRequest } from 'nsa-helpers/http';
import { AccessTokenPayload } from 'nsa-auth/interfaces/access-token-payload.interface';
import { getTokenPayload } from 'nsa-auth/utils/token-payload';
import { NotificationGateway } from '../gateways/notification.gateway';
import {
  NOTIFICATION_TYPE,
  type NotificationType,
} from '../enums/notification-type.registry';
import {
  NOTIFY_METADATA_KEY,
  BATCH_NOTIFY_METADATA_KEY,
} from './notify.decorator';
import type { BatchNotificationInfo } from './notify.decorator';

@Injectable()
export class NotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly notificationGateway: NotificationGateway,
    @Inject(NOTIFICATION_TYPE)
    private readonly notificationType: Record<string, string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(() => {
        const request: AdvancedRequest = context.switchToHttp().getRequest();
        const payload: AccessTokenPayload = getTokenPayload(request);

        // Handle stacked @Notify decorators
        this.handleNotifyDecorators(context, request, payload);

        // Handle @BatchNotify decorators
        this.handleBatchNotifyDecorators(context, request);
      }),
    );
  }

  private handleNotifyDecorators(
    context: ExecutionContext,
    request: AdvancedRequest,
    payload: AccessTokenPayload,
  ): void {
    const types = Reflect.getMetadata(
      NOTIFY_METADATA_KEY,
      context.getHandler(),
    ) as NotificationType[] | undefined;

    if (!types || types.length === 0) return;

    const { notificationInfo } = request;

    for (const type of types) {
      if (type === this.notificationType.NEW_SIGNIN) {
        void this.notificationGateway.notifyUser(
          notificationInfo?.userId as string,
          type,
          notificationInfo ?? {},
        );
        continue;
      }

      void this.notificationGateway.notifyUser(
        payload?.sub,
        type,
        notificationInfo ?? {},
      );
    }
  }

  private handleBatchNotifyDecorators(
    context: ExecutionContext,
    request: AdvancedRequest,
  ): void {
    const batchTypes = Reflect.getMetadata(
      BATCH_NOTIFY_METADATA_KEY,
      context.getHandler(),
    ) as NotificationType[] | undefined;

    if (!batchTypes || batchTypes.length === 0) return;

    const batchNotificationInfo =
      request.batchNotificationInfo as BatchNotificationInfo[];
    if (!batchNotificationInfo) return;

    for (const batchInfo of batchNotificationInfo) {
      if (!batchTypes.includes(batchInfo.type)) continue;
      for (const entry of batchInfo.entries) {
        void this.notificationGateway.notifyUser(
          entry.userId,
          batchInfo.type,
          entry.payload,
        );
      }
    }
  }
}
