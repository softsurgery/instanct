import { Global, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { AuthModule } from '@softsurgery/nsa-auth/auth.module';
import {
  USER_REPOSITORY,
  USER_SERVICE,
} from '@softsurgery/nsa-um/tokens/user-access';
import {
  USER_DTO,
  USER_ENTITY,
  bindUserDto,
  bindUserEntity,
  bindUserService,
  bindUserRepository,
} from '@softsurgery/nsa-um/registries/user-binding.registry';
import { ResponseUserDto } from './dtos/user/response-user.dto';
import { FollowService } from 'src/modules/users/services/follow.service';
import { NotificationModule } from '@softsurgery/nsa-notifications/notifications.module';
import { LoggerModule } from '@softsurgery/nsa-logger/logger.module';
import { SessionModule } from '@softsurgery/nsa-sessions/sessions.module';
import { PermissionService } from '@softsurgery/nsa-um/services/permission.service';
import { RolePermissionService } from '@softsurgery/nsa-um/services/role-permission.service';
import { RoleService } from '@softsurgery/nsa-um/services/role.service';
import { RoleRepository } from '@softsurgery/nsa-um/repositories/role.repository';
import { PermissionRepository } from '@softsurgery/nsa-um/repositories/permission.repository';
import { RolePermissionRepository } from '@softsurgery/nsa-um/repositories/role-permission.repository';
import { FollowRepository } from './repositories/follow.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbstractUserEntity } from '@softsurgery/nsa-um/entities/abstract-user.entity';
import { RoleEntity } from '@softsurgery/nsa-um/entities/role.entity';
import { PermissionEntity } from '@softsurgery/nsa-um/entities/permission.entity';
import { RolePermissionEntity } from '@softsurgery/nsa-um/entities/role-permission.entity';
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
import { ReferenceTypesModule } from '@softsurgery/nsa-reference-types/reference-types.module';
import { StorageModule } from '@softsurgery/nsa-storage/storage.module';
import { UserConfigurationService } from './services/user-configuration.service';
import { ConfigurationsModule } from '@softsurgery/nsa-configurations/configurations.module';
import { UserBookmarkRepository } from './repositories/user-bookmark.repository';
import { UserBookmarkService } from './services/user-bookmark.service';
import { UserBookmarkEntity } from './entities/user-bookmark.entity';
import { UserBlockRepository } from './repositories/user-block.repository';
import { UserBlockService } from './services/user-block.service';
import { UserBlockEntity } from './entities/user-block.entity';
import { MailModule } from '@softsurgery/nsa-mail/mail.module';
import { CustomAuthService } from './services/custom-auth.service';
import { UserPresenceService } from '@softsurgery/nsa-um/services/user-presence.service';
import { UserPresenceGateway } from './gateways/user-presence.gateway';
import { AdminPresenceGateway } from './gateways/admin-presence.gateway';

@Global()
@Module({
  controllers: [],
  providers: [
    CustomAuthService,
    UserPresenceService,
    UserPresenceGateway,
    AdminPresenceGateway,
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
    { provide: USER_DTO, useValue: ResponseUserDto },
    { provide: USER_ENTITY, useValue: UserEntity },
  ],
  exports: [
    UserPresenceService,
    UserPresenceGateway,
    AdminPresenceGateway,
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
    USER_DTO,
    USER_ENTITY,
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
    forwardRef(() => AuthModule),
  ],
})
export class UserManagementModule implements OnModuleInit {
  onModuleInit() {
    bindUserDto(ResponseUserDto);
    bindUserEntity(UserEntity);
    bindUserService(UserService);
    bindUserRepository(UserRepository);
  }
}
