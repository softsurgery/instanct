import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RolePermissionService } from './services/role-permission.service';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UploadModule } from 'src/shared/uploads/uploads.module';
import { WalkOfLifeService } from './modules/profile-management/services/walk-of-life.service';
import { ProfileService } from './services/profile.service';
import { ProfileUploadService } from './services/profile-upload.service';
import { FollowService } from './services/follow.service';
import { ProfileRepository } from './repositories/profile.repository';
import { ProfileUploadRepository } from './repositories/profile-upload.repository';
import { FollowRepository } from './repositories/follow.repository';
import { ProfileEntity } from './entities/profile.entity';
import { ProfileUploadEntity } from './entities/profile-upload.entity';
import { FollowEntity } from './entities/follow.entity';

@Module({
  controllers: [],
  providers: [
    UserService,
    RoleService,
    PermissionService,
    RolePermissionService,
    ProfileService,
    ProfileUploadService,
    FollowService,
    WalkOfLifeService,

    UserRepository,
    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,
    ProfileRepository,
    ProfileUploadRepository,
    FollowRepository,

    UserService,
    RoleService,
    PermissionService,
    RolePermissionService,
    ProfileService,
    ProfileUploadService,
    FollowService,
  ],
  exports: [
    UserService,
    RoleService,
    PermissionService,
    ProfileService,
    ProfileUploadService,
    FollowService,
    WalkOfLifeService,

    UserRepository,
    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,
    ProfileRepository,
    ProfileUploadRepository,
    FollowRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      ProfileEntity,
      ProfileUploadEntity,
      FollowEntity,
    ]),
    UploadModule,
  ],
})
export class UserManagementModule {}
