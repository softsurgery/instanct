import { Module } from '@nestjs/common';
import { FollowService } from 'src/modules/users/services/follow.service';
import { PermissionService } from 'src/shared/abstract-user-management/services/permission.service';
import { RolePermissionService } from 'src/shared/abstract-user-management/services/role-permission.service';
import { RoleService } from 'src/shared/abstract-user-management/services/role.service';
import { RoleRepository } from 'src/shared/abstract-user-management/repositories/role.repository';
import { PermissionRepository } from 'src/shared/abstract-user-management/repositories/permission.repository';
import { RolePermissionRepository } from 'src/shared/abstract-user-management/repositories/role-permission.repository';
import { FollowRepository } from 'src/shared/abstract-user-management/repositories/follow.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/shared/abstract-user-management/entities/role.entity';
import { PermissionEntity } from 'src/shared/abstract-user-management/entities/permission.entity';
import { RolePermissionEntity } from 'src/shared/abstract-user-management/entities/role-permission.entity';
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
import { ReferenceTypesModule } from 'src/shared/reference-types/reference-types.module';
import { StorageModule } from 'src/shared/storage/storage.module';
import { UserConfigurationService } from './services/user-configuration.service';
import { ConfigurationsModule } from 'src/shared/configurations/configurations.module';
import { UserBookmarkRepository } from './repositories/user-bookmark.repository';
import { UserBookmarkService } from './services/user-bookmark.service';
import { UserBookmarkEntity } from './entities/user-bookmark.entity';
import { MailModule } from 'src/shared/mail/mail.module';
import { CustomAuthService } from './services/custom-auth.service';

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
  ],
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserUploadEntity,
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      FollowEntity,
      ExperienceEntity,
      EducationEntity,
      UserBookmarkEntity,
    ]),
    MailModule,
    StorageModule,
    ReferenceTypesModule,
    ConfigurationsModule,
  ],
})
export class UserManagementModule {}
