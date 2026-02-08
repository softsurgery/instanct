import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { PermissionsSeedCommand } from './permissions.seeder';
import { RolesSeedCommand } from './roles.seeder';
import { AdminSeedCommand } from './admin.seeder';
import { TemplateModule } from 'src/shared/templates/template.module';
import { TemplatesSeedCommand } from './templates.seeder';
import { StoreModule } from 'src/shared/store/store.module';
import { PlaygroundUsersSeedCommand } from './playground/users.seeder';
import { ReferenceTypesModule } from 'src/shared/reference-types/reference-types.module';
import { IndustriesSeedCommand } from './industries.seeder';
import { ObjectivesSeedCommand } from './objectives.seeder';
import { ConfigurationsModule } from 'src/shared/configurations/configurations.module';
import { ConfigurationSeedCommand } from './configuration.seeder';

@Module({
  imports: [
    CommandModule,
    UserManagementModule,
    ReferenceTypesModule,
    TemplateModule,
    StoreModule,
    ConfigurationsModule,
  ],
  providers: [
    //seeders
    PermissionsSeedCommand,
    RolesSeedCommand,
    AdminSeedCommand,
    TemplatesSeedCommand,
    ConfigurationSeedCommand,
    //reference types
    IndustriesSeedCommand,
    ObjectivesSeedCommand,
    //playground
    PlaygroundUsersSeedCommand,
  ],
})
export class SeedersModule {}
