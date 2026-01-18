import { Module } from '@nestjs/common';
import { PermissionController } from 'src/shared/abstract-user-management/controllers/permission.controller';
import { RoleController } from 'src/shared/abstract-user-management/controllers/role.controller';
import { UserController } from 'src/modules/users/controllers/user.controller';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { LoggerController } from 'src/shared/logger/controller/logger.controller';
import { LoggerModule } from 'src/shared/logger/logger.module';

@Module({
  controllers: [
    UserController,
    RoleController,
    PermissionController,
    LoggerController,
  ],
  providers: [],
  exports: [],
  imports: [UserManagementModule, LoggerModule],
})
export class RoutesAdminModule {}
