import { Global, Module, forwardRef } from '@nestjs/common';
import {
  USER_REPOSITORY,
  USER_SERVICE,
} from 'nsa-um/tokens/user-access';
import { FollowService } from 'src/modules/users/services/follow.service';
import { NotificationModule } from 'nsa-notifications/notifications.module';
import { LoggerModule } from 'nsa-logger/logger.module';
import { SessionModule } from 'nsa-sessions/sessions.module';
import { PermissionService } from 'nsa-um/services/permission.service';
import { RolePermissionService } from 'nsa-um/services/role-permission.service';
import { RoleService } from 'nsa-um/services/role.service';
import { RoleRepository } from 'nsa-um/repositories/role.repository';
import { PermissionRepository } from 'nsa-um/repositories/permission.repository';
import { RolePermissionRepository } from 'nsa-um/repositories/role-permission.repository';
import { FollowRepository } from './repositories/follow.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbstractUserEntity } from 'nsa-um/entities/abstract-user.entity';
import { RoleEntity } from 'nsa-um/entities/role.entity';
import { PermissionEntity } from 'nsa-um/entities/permission.entity';
import { RolePermissionEntity } from 'nsa-um/entities/role-permission.entity';
import { UserUploadEntity } from './entities/user-upload.entity';
import { UserEntity } from './entities/user.entity';
import { FollowEntity } from 'src/modules/users/entities/follow.entity';
import { UserService } from './services/user.service';
import { UserUploadService } from './services/user-upload.service';
import { UserRepository } from './repositories/user.repository';
import { UserUploadRepository } from './repositories/user-upload.repository';
import { ExperienceService } from './services/experience.service';
import { ExperienceRepository } from './repositories/experience.repository';
import { ExperienceEntity } from './entities/experience.entity';
import { EducationService } from './services/education.service';
import { EducationRepository } from './repositories/education.repository';
import { EducationEntity } from './entities/education.entity';
import { ReferenceTypesModule } from 'nsa-reference-types/reference-types.module';
import { StorageModule } from 'nsa-storage/storage.module';
import { UserConfigurationService } from './services/user-configuration.service';
import { ConfigurationsModule } from 'nsa-configurations/configurations.module';
import { UserBookmarkRepository } from './repositories/user-bookmark.repository';
import { UserBookmarkService } from './services/user-bookmark.service';
import { UserBookmarkEntity } from './entities/user-bookmark.entity';
import { UserBlockRepository } from './repositories/user-block.repository';
import { UserBlockService } from './services/user-block.service';
import { UserBlockEntity } from './entities/user-block.entity';
import { MailModule } from 'nsa-mail/mail.module';
import { CustomAuthService } from './services/custom-auth.service';

@Global()
@Module({
  controllers: [],
  providers: [
    CustomAuthService,
    //services
    UserService,
    UserUploadService,
    UserConfigurationService,

    RoleService,
    PermissionService,
    RolePermissionService,

    FollowService,
    ExperienceService,
    EducationService,

    UserBookmarkService,
    UserBlockService,

    //repositories
    UserRepository,
    UserUploadRepository,
    UserConfigurationService,

    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,

    FollowRepository,
    ExperienceRepository,
    EducationRepository,

    UserBookmarkRepository,
    UserBlockRepository,
    { provide: USER_SERVICE, useExisting: UserService },
    { provide: USER_REPOSITORY, useExisting: UserRepository },
  ],
  exports: [
    //services
    CustomAuthService,
    UserService,
    UserUploadService,
    UserConfigurationService,

    RoleService,
    PermissionService,
    RolePermissionService,

    FollowService,
    ExperienceService,
    EducationService,

    UserBookmarkService,
    UserBlockService,

    //repositories
    UserRepository,
    UserUploadRepository,

    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,

    FollowRepository,
    ExperienceRepository,
    EducationRepository,

    UserBookmarkRepository,
    UserBlockRepository,
    USER_SERVICE,
    USER_REPOSITORY,
  ],
  imports: [
    TypeOrmModule.forFeature([
      AbstractUserEntity,
      UserEntity,
      UserUploadEntity,
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      FollowEntity,
      ExperienceEntity,
      EducationEntity,
      UserBookmarkEntity,
      UserBlockEntity,
    ]),
    MailModule,
    StorageModule,
    ReferenceTypesModule,
    ConfigurationsModule,
    NotificationModule,
    LoggerModule,
    forwardRef(() => SessionModule),
  ],
})
export class UserManagementModule {}
