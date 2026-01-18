import { Module } from '@nestjs/common';
import { AuthModule } from 'src/shared/auth/auth.module';
import { AuthController } from 'src/shared/auth/controllers/auth.controller';
import { LoggerModule } from 'src/shared/logger/logger.module';
import { UserManagementModule } from 'src/shared/user-management/user-management.module';
import { ClientAuthController } from 'src/shared/auth/controllers/client-auth.controller';
import { UploadController } from 'src/shared/uploads/controllers/upload.controller';
import { UploadModule } from 'src/shared/uploads/uploads.module';
import { ClientController } from 'src/shared/user-management/controllers/client.controller';
import { StoreController } from 'src/shared/store/controllers/store.controller';
import { StoreModule } from 'src/shared/store/store.module';
import { FollowController } from 'src/shared/user-management/controllers/follow.controller';
import { NotificationController } from 'src/shared/notifications/controllers/notification.controller';
import { NotificationModule } from 'src/shared/notifications/notifications.module';
import { ReferenceTypesModule } from 'src/shared/reference-types/reference-types.module';
import { RefTypeController } from 'src/shared/reference-types/controllers/ref-type.controller';
import { RefParamController } from 'src/shared/reference-types/controllers/ref-param.controller';
import { GeolocationModule } from 'src/modules/geolocation/geolocation.module';
import { ReferenceImplModule } from 'src/modules/reference-impl/reference-impl.module';
import { RefImplementationController } from 'src/modules/reference-impl/reference-impl.controller';
import { ConversationController } from 'src/modules/chat/controllers/conversation.controller';
import { MessageController } from 'src/modules/chat/controllers/message.controller';
import { ChatModule } from 'src/modules/chat/chat.module';
import { WalkOfLifeController } from 'src/shared/user-management/modules/profile-management/controllers/walk-of-life.controller';

@Module({
  controllers: [
    //auth
    AuthController,
    ClientAuthController,
    WalkOfLifeController,
    //common
    UploadController,
    StoreController,
    //user
    ClientController,
    FollowController,
    //chat
    ConversationController,
    MessageController,
    //notifications
    NotificationController,
    //reference-types
    RefTypeController,
    RefParamController,
    RefImplementationController,
  ],
  providers: [],
  exports: [],
  imports: [
    AuthModule,
    StoreModule,
    LoggerModule,
    UserManagementModule,
    UploadModule,
    ChatModule,
    NotificationModule,
    ReferenceTypesModule,
    GeolocationModule,
    ReferenceImplModule,
  ],
})
export class RoutesModule {}
