import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { MailModule } from '@softsurgery/nsa-mail/mail.module';
import { ClientAuthService } from './services/client-auth.service';
import { ConfigurationsModule } from '@softsurgery/nsa-configurations/configurations.module';
import { StorageModule } from '@softsurgery/nsa-storage/storage.module';
import { AuthProvidersService } from './services/auth-provider.service';
import { NotificationModule } from '@softsurgery/nsa-notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDeviceEntity } from './entities/user-device.entity';
import { UserConnectionHistoryEntity } from './entities/user-connection-history.entity';
import { UserDeviceRepository } from './repositories/user-device.repository';
import { UserConnectionHistoryRepository } from './repositories/user-connection-history.repository';
import { UserDeviceService } from './services/user-device.service';
import { UserConnectionHistoryService } from './services/user-connection-history.service';

@Module({
  imports: [
    ConfigModule,
    ConfigurationsModule,
    MailModule,
    StorageModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      UserDeviceEntity,
      UserConnectionHistoryEntity,
    ]),
  ],
  controllers: [],
  providers: [
    AuthService,
    AuthProvidersService,
    ClientAuthService,
    UserDeviceRepository,
    UserConnectionHistoryRepository,
    UserDeviceService,
    UserConnectionHistoryService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [
    AuthService,
    ClientAuthService,
    UserDeviceService,
    UserConnectionHistoryService,
    UserDeviceRepository,
    UserConnectionHistoryRepository,
  ],
})
export class AuthModule {}
