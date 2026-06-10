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

@Module({
  imports: [
    UserManagementModule,
    ConfigModule,
    ConfigurationsModule,
    MailModule,
    StorageModule,
  ],
  controllers: [],
  providers: [
    AuthService,
    AuthProvidersService,
    ClientAuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, ClientAuthService],
})
export class AuthModule {}
