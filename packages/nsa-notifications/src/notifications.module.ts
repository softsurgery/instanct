import { Module } from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';
import { NotificationInterceptor } from './decorators/notification.interceptor';
import { NotificationGateway } from './gateways/notification.gateway';
import {
  NOTIFICATION_TYPE,
  notificationTypeRegistry,
} from './enums/notification-type.registry';

@Module({
  controllers: [],
  providers: [
    NotificationRepository,
    NotificationService,
    NotificationInterceptor,
    NotificationGateway,
    { provide: NOTIFICATION_TYPE, useValue: notificationTypeRegistry },
  ],
  exports: [
    NotificationRepository,
    NotificationService,
    NotificationInterceptor,
    NotificationGateway,
    NOTIFICATION_TYPE,
  ],
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
})
export class NotificationModule {}
