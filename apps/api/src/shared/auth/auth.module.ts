import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { MailModule } from '../mail/mail.module';
import { ClientAuthService } from './services/client-auth.service';
import { ConfigurationsModule } from '../configurations/configurations.module';
import { StorageModule } from '../storage/storage.module';
import { AuthProvidersService } from './services/auth-provider.service';

import { NotificationModule } from '../notifications/notifications.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDeviceEntity } from './entities/user-device.entity';
import { UserDeviceRepository } from './repositories/user-device.repository';
import { UserDeviceService } from './services/user-device.service';

@Module({
  imports: [
    UserManagementModule,
    ConfigModule,
    ConfigurationsModule,
    MailModule,
    StorageModule,
    NotificationModule,
    TypeOrmModule.forFeature([UserDeviceEntity]),
  ],
  controllers: [],
  providers: [
    AuthService,
    AuthProvidersService,
    ClientAuthService,
    UserDeviceRepository,
    UserDeviceService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [
    AuthService,
    ClientAuthService,
    UserDeviceService,
    UserDeviceRepository,
  ],
})
export class AuthModule {}
