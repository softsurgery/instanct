import { Module } from '@nestjs/common';
import { AuthModule } from 'src/shared/auth/auth.module';
import { AuthController } from 'src/shared/auth/controllers/auth.controller';
import { LoggerModule } from 'src/shared/logger/logger.module';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { ClientAuthController } from 'src/shared/auth/controllers/client-auth.controller';
import { StorageModule } from 'src/shared/storage/storage.module';
import { StoreController } from 'src/shared/store/controllers/store.controller';
import { StoreModule } from 'src/shared/store/store.module';
import { FollowController } from 'src/shared/abstract-user-management/controllers/follow.controller';
import { NotificationController } from 'src/shared/notifications/controllers/notification.controller';
import { NotificationModule } from 'src/shared/notifications/notifications.module';
import { ReferenceTypesModule } from 'src/shared/reference-types/reference-types.module';
import { RefTypeController } from 'src/shared/reference-types/controllers/ref-type.controller';
import { RefParamController } from 'src/shared/reference-types/controllers/ref-param.controller';
import { GeolocationModule } from 'src/modules/geolocation/geolocation.module';
import { ConversationController } from 'src/shared/chat/controllers/conversation.controller';
import { MessageController } from 'src/shared/chat/controllers/message.controller';
import { ChatModule } from 'src/shared/chat/chat.module';
import { SessionController } from 'src/shared/sessions/controllers/session.controller';
import { SessionModule } from 'src/shared/sessions/sessions.module';
import { ExperienceController } from 'src/modules/users/controllers/experience.controller';
import { EducationController } from 'src/modules/users/controllers/education.controller';
import { ConfigurationController } from 'src/shared/configurations/controllers/configuration.controller';
import { ConfigurationsModule } from 'src/shared/configurations/configurations.module';
import { StorageController } from 'src/shared/storage/controllers/storage.controller';
import { CurrentUserController } from 'src/modules/users/controllers/current-user.controller';
import { CurrentConversationController } from 'src/shared/chat/controllers/user-conversation.controller';
import { CurrentSessionController } from 'src/shared/sessions/controllers/current-session.controller';
import { SystemReportsModule } from 'src/modules/system-reports/system-reports.module';
import { BugController } from 'src/modules/system-reports/controllers/bug.controller';
import { FeedbackController } from 'src/modules/system-reports/controllers/feedback.controller';
import { RequestController } from 'src/modules/requests/controllers/request.controller';
import { RequestsModule } from 'src/modules/requests/requests.module';
import { UserBookmarkController } from 'src/modules/users/controllers/user-bookmark.controller';
import { ClientCustomAuthController } from 'src/modules/users/controllers/custom-auth.controller';

@Module({
  controllers: [
    //auth
    AuthController,
    ClientAuthController,
    ClientCustomAuthController,
    //common
    StorageController,
    StoreController,
    ConfigurationController,
    //user
    CurrentUserController,
    FollowController,
    ExperienceController,
    EducationController,
    UserBookmarkController,
    //system reports
    FeedbackController,
    BugController,
    //chat
    CurrentConversationController,
    ConversationController,
    MessageController,
    //notifications
    NotificationController,
    SessionController,
    CurrentSessionController,
    RequestController,
    //reference-types
    RefTypeController,
    RefParamController,
  ],
  providers: [],
  exports: [],
  imports: [
    AuthModule,
    StoreModule,
    ConfigurationsModule,
    LoggerModule,
    UserManagementModule,
    SystemReportsModule,
    StorageModule,
    ChatModule,
    NotificationModule,
    SessionModule,
    ReferenceTypesModule,
    GeolocationModule,
    RequestsModule,
  ],
})
export class RoutesModule {}
