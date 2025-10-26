import { Module } from '@nestjs/common';
import { AuthModule } from 'src/shared/auth/auth.module';
import { AuthController } from 'src/shared/auth/controllers/auth.controller';
import { LoggerModule } from 'src/shared/logger/logger.module';
import { UserManagementModule } from 'src/modules/user-management/user-management.module';
import { ClientAuthController } from 'src/shared/auth/controllers/client-auth.controller';
import { UploadController } from 'src/shared/uploads/controllers/upload.controller';
import { UploadModule } from 'src/shared/uploads/uploads.module';
import { ClientController } from 'src/modules/user-management/controllers/client.controller';
import { StoreController } from 'src/shared/store/controllers/store.controller';
import { StoreModule } from 'src/shared/store/store.module';
import { FollowController } from 'src/modules/user-management/controllers/follow.controller';
import { NotificationController } from 'src/shared/notifications/controllers/notification.controller';
import { NotificationModule } from 'src/shared/notifications/notifications.module';

@Module({
  controllers: [
    //auth
    AuthController,
    ClientAuthController,
    //common
    UploadController,
    StoreController,
    //user
    ClientController,
    FollowController,
    //notifications
    NotificationController,
  ],
  providers: [],
  exports: [],
  imports: [
    AuthModule,
    StoreModule,
    LoggerModule,
    UserManagementModule,
    UploadModule,
    NotificationModule,
  ],
})
export class RoutesModule {}
