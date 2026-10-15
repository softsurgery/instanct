import { Module } from '@nestjs/common';
import { PermissionController } from '@softsurgery/nsa-um/controllers/permission.controller';
import { RoleController } from '@softsurgery/nsa-um/controllers/role.controller';
import { UserController } from 'src/modules/users/controllers/user.controller';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { LoggerController } from '@softsurgery/nsa-logger/controller/logger.controller';
import { LoggerModule } from '@softsurgery/nsa-logger/logger.module';

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
