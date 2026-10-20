import { Module } from '@nestjs/common';
import { AuthModule } from '@softsurgery/nsa-auth/auth.module';
import { AuthController } from '@softsurgery/nsa-auth/controllers/auth.controller';
import { LoggerModule } from '@softsurgery/nsa-logger/logger.module';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { ClientAuthController } from '@softsurgery/nsa-auth/controllers/client-auth.controller';
import { StorageModule } from '@softsurgery/nsa-storage/storage.module';
import { FollowController } from '../../modules/users/controllers/follow.controller';
import { NotificationController } from '@softsurgery/nsa-notifications/controllers/notification.controller';
import { NotificationModule } from '@softsurgery/nsa-notifications/notifications.module';
import { ReferenceTypesModule } from '@softsurgery/nsa-reference-types/reference-types.module';
import { RefTypeController } from '@softsurgery/nsa-reference-types/controllers/ref-type.controller';
import { RefParamController } from '@softsurgery/nsa-reference-types/controllers/ref-param.controller';
import { GeolocationModule } from 'src/modules/geolocation/geolocation.module';
import { ConversationController } from '@softsurgery/nsa-chat/controllers/conversation.controller';
import { MessageController } from '@softsurgery/nsa-chat/controllers/message.controller';
import { ChatModule } from '@softsurgery/nsa-chat/chat.module';
import { SessionController } from '@softsurgery/nsa-sessions/controllers/session.controller';
import { SessionModule } from '@softsurgery/nsa-sessions/sessions.module';
import { ExperienceController } from 'src/modules/users/controllers/experience.controller';
import { EducationController } from 'src/modules/users/controllers/education.controller';
import { ConfigurationController } from '@softsurgery/nsa-configurations/controllers/configuration.controller';
import { ConfigurationsModule } from '@softsurgery/nsa-configurations/configurations.module';
import { StorageController } from '@softsurgery/nsa-storage/controllers/storage.controller';
import { CurrentUserController } from 'src/modules/users/controllers/current-user.controller';
import { CurrentConversationController } from '@softsurgery/nsa-chat/controllers/user-conversation.controller';
import { CurrentSessionController } from '@softsurgery/nsa-sessions/controllers/current-session.controller';
import { SystemReportsModule } from 'src/modules/system-reports/system-reports.module';
import { BugController } from 'src/modules/system-reports/controllers/bug.controller';
import { FeedbackController } from 'src/modules/system-reports/controllers/feedback.controller';
import { RequestController } from 'src/modules/requests/controllers/request.controller';
import { RequestWorkflowController } from 'src/modules/requests/controllers/request-workdlow.controller';
import { RequestsModule } from 'src/modules/requests/requests.module';
import { UserBookmarkController } from 'src/modules/users/controllers/user-bookmark.controller';
import { UserBlockController } from 'src/modules/users/controllers/user-block.controller';
import { ClientCustomAuthController } from 'src/modules/users/controllers/custom-auth.controller';
import { UserDeviceController } from '@softsurgery/nsa-auth/controllers/user-device.controller';
import { UserDeviceHistoryController } from '@softsurgery/nsa-auth/controllers/user-device-history.controller';
import { ContentModule } from '@softsurgery/nsa-content/content.module';
import { ContentPageController } from '@softsurgery/nsa-content/controllers/content-page.controller';
import { TemplateModule } from '@softsurgery/nsa-templates/template.module';
import { TemplateController } from '@softsurgery/nsa-templates/controllers/template.controller';

@Module({
  controllers: [
    //auth
    AuthController,
    ClientAuthController,
    ClientCustomAuthController,
    UserDeviceHistoryController,
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
    //templates
    TemplateController,
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
    TemplateModule,
  ],
})
export class RoutesModule {}
