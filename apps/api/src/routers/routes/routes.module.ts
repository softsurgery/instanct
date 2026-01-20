import { Module } from '@nestjs/common';
import { AuthModule } from 'src/shared/auth/auth.module';
import { AuthController } from 'src/shared/auth/controllers/auth.controller';
import { LoggerModule } from 'src/shared/logger/logger.module';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { ClientAuthController } from 'src/shared/auth/controllers/client-auth.controller';
import { UploadController } from 'src/shared/uploads/controllers/upload.controller';
import { UploadModule } from 'src/shared/uploads/uploads.module';
import { StoreController } from 'src/shared/store/controllers/store.controller';
import { StoreModule } from 'src/shared/store/store.module';
import { FollowController } from 'src/shared/abstract-user-management/controllers/follow.controller';
import { NotificationController } from 'src/shared/notifications/controllers/notification.controller';
import { NotificationModule } from 'src/shared/notifications/notifications.module';
import { ReferenceTypesModule } from 'src/shared/reference-types/reference-types.module';
import { RefTypeController } from 'src/shared/reference-types/controllers/ref-type.controller';
import { RefParamController } from 'src/shared/reference-types/controllers/ref-param.controller';
import { GeolocationModule } from 'src/modules/geolocation/geolocation.module';
import { ReferenceImplModule } from 'src/modules/reference-impl/reference-impl.module';
import { RefImplementationController } from 'src/modules/reference-impl/reference-impl.controller';
import { ConversationController } from 'src/shared/chat/controllers/conversation.controller';
import { MessageController } from 'src/shared/chat/controllers/message.controller';
import { ChatModule } from 'src/shared/chat/chat.module';
import { SessionController } from 'src/shared/sessions/controllers/session.controller';
import { SessionModule } from 'src/shared/sessions/sessions.module';
import { ExperienceController } from 'src/modules/users/controllers/experience.controller';
import { EducationController } from 'src/modules/users/controllers/education.controller';

@Module({
  controllers: [
    //auth
    AuthController,
    ClientAuthController,
    //common
    UploadController,
    StoreController,
    //user
    FollowController,
    ExperienceController,
    EducationController,
    //chat
    ConversationController,
    MessageController,
    //notifications
    NotificationController,
    SessionController,
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
    SessionModule,
    ReferenceTypesModule,
    GeolocationModule,
    ReferenceImplModule,
  ],
})
export class RoutesModule {}
