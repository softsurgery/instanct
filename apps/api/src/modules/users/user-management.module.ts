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
import { UploadModule } from 'src/shared/uploads/uploads.module';
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

@Module({
  controllers: [],
  providers: [
    //services
    UserService,
    UserUploadService,

    RoleService,
    PermissionService,
    RolePermissionService,

    FollowService,
    ExperienceService,
    EducationService,

    //repositories
    UserRepository,
    UserUploadRepository,

    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,

    FollowRepository,
    ExperienceRepository,
    EducationRepository,
  ],
  exports: [
    //services
    UserService,
    UserUploadService,

    RoleService,
    PermissionService,
    RolePermissionService,

    FollowService,
    ExperienceService,
    EducationService,

    //repositories
    UserRepository,
    UserUploadRepository,

    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,

    FollowRepository,
    ExperienceRepository,
    EducationRepository,
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
    ]),
    UploadModule,
  ],
})
export class UserManagementModule {}
