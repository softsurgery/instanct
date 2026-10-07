import { Module } from '@nestjs/common';
import { AuthModule } from 'nsa-auth/auth.module';
import { AuthController } from 'nsa-auth/controllers/auth.controller';
import { LoggerModule } from 'nsa-logger/logger.module';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { ClientAuthController } from 'nsa-auth/controllers/client-auth.controller';
import { StorageModule } from 'nsa-storage/storage.module';
import { FollowController } from '../../modules/users/controllers/follow.controller';
import { NotificationController } from 'nsa-notifications/controllers/notification.controller';
import { NotificationModule } from 'nsa-notifications/notifications.module';
import { ReferenceTypesModule } from 'nsa-reference-types/reference-types.module';
import { RefTypeController } from 'nsa-reference-types/controllers/ref-type.controller';
import { RefParamController } from 'nsa-reference-types/controllers/ref-param.controller';
import { GeolocationModule } from 'src/modules/geolocation/geolocation.module';
import { ConversationController } from 'nsa-chat/controllers/conversation.controller';
import { MessageController } from 'nsa-chat/controllers/message.controller';
import { ChatModule } from 'nsa-chat/chat.module';
import { SessionController } from 'nsa-sessions/controllers/session.controller';
import { SessionModule } from 'nsa-sessions/sessions.module';
import { ExperienceController } from 'src/modules/users/controllers/experience.controller';
import { EducationController } from 'src/modules/users/controllers/education.controller';
import { ConfigurationController } from 'nsa-configurations/controllers/configuration.controller';
import { ConfigurationsModule } from 'nsa-configurations/configurations.module';
import { StorageController } from 'nsa-storage/controllers/storage.controller';
import { CurrentUserController } from 'src/modules/users/controllers/current-user.controller';
import { CurrentConversationController } from 'nsa-chat/controllers/user-conversation.controller';
import { CurrentSessionController } from 'nsa-sessions/controllers/current-session.controller';
import { SystemReportsModule } from 'src/modules/system-reports/system-reports.module';
import { BugController } from 'src/modules/system-reports/controllers/bug.controller';
import { FeedbackController } from 'src/modules/system-reports/controllers/feedback.controller';
import { RequestController } from 'src/modules/requests/controllers/request.controller';
import { RequestWorkflowController } from 'src/modules/requests/controllers/request-workdlow.controller';
import { RequestsModule } from 'src/modules/requests/requests.module';
import { UserBookmarkController } from 'src/modules/users/controllers/user-bookmark.controller';
import { UserBlockController } from 'src/modules/users/controllers/user-block.controller';
import { ClientCustomAuthController } from 'src/modules/users/controllers/custom-auth.controller';
import { UserDeviceController } from 'nsa-auth/controllers/user-device.controller';
import { ContentModule } from 'nsa-content/content.module';
import { ContentPageController } from 'nsa-content/controllers/content-page.controller';

@Module({
  controllers: [
    //auth
    AuthController,
    ClientAuthController,
    ClientCustomAuthController,
    UserDeviceController,
    //common
    StorageController,
    ConfigurationController,
    //user
    CurrentUserController,
    FollowController,
    ExperienceController,
    EducationController,
    UserBookmarkController,
    UserBlockController,
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
    RequestWorkflowController,
    //reference-types
    RefTypeController,
    RefParamController,
    ContentPageController,
  ],
  providers: [],
  exports: [],
  imports: [
    AuthModule,
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
    ContentModule,
  ],
})
export class RoutesModule {}
