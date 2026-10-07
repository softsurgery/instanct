import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';
import { AdvancedRequest } from 'nsa-helpers/http';
import { LoggerService } from '../services/logger.service';
import { EVENT_TYPE } from '../enums/event-type.registry';
import { AccessTokenPayload } from 'nsa-auth/interfaces/access-token-payload.interface';
import { getTokenPayload } from 'nsa-auth/utils/token-payload';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly loggerService: LoggerService,
    @Inject(EVENT_TYPE)
    private readonly eventType: Record<string, string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(() => {
        const event = this.reflector.get<string>(
          'event',
          context.getHandler(),
        );

        if (!event) return;

        const request: AdvancedRequest = context.switchToHttp().getRequest();
        const { method, url, logInfo } = request;

        if (event === this.eventType.SIGNIN) {
          const payload: AccessTokenPayload = getTokenPayload(request);

          void this.loggerService.save({
            event,
            logInfo,
            api: url,
            method,
            userId: payload?.sub,
          });

          return;
        }

        const payload: AccessTokenPayload = getTokenPayload(request);

        void this.loggerService.save({
          event,
          logInfo,
          api: url,
          method,
          userId: payload?.sub,
        });
      }),
    );
  }
}
