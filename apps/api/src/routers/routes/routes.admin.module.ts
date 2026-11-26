import { Module } from '@nestjs/common';
import { PermissionController } from '@softsurgery/nsa-um/controllers/permission.controller';
import { RoleController } from '@softsurgery/nsa-um/controllers/role.controller';
import { UserController } from 'src/modules/users/controllers/user.controller';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { LoggerController } from '@softsurgery/nsa-logger/controller/logger.controller';
import { LoggerModule } from '@softsurgery/nsa-logger/logger.module';
import { ExperimentalGeolocationController } from 'src/modules/geolocation/controllers/experimental-geolocation.controller';
import { GeolocationModule } from 'src/modules/geolocation/geolocation.module';

@Module({
  controllers: [
    UserController,
    RoleController,
    PermissionController,
    LoggerController,
    ExperimentalGeolocationController,
  ],
  providers: [],
  exports: [],
  imports: [UserManagementModule, LoggerModule, GeolocationModule],
})
export class RoutesAdminModule {}
