import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { PermissionsSeedCommand } from './permissions.seeder';
import { RolesSeedCommand } from './roles.seeder';
import { AdminSeedCommand } from './admin.seeder';
import { TemplateModule } from 'src/shared/templates/template.module';
import { TemplatesSeedCommand } from './templates.seeder';
import { PlaygroundUsersSeedCommand } from './playground/users.seeder';
import { ReferenceTypesModule } from 'src/shared/reference-types/reference-types.module';
import { IndustriesSeedCommand } from './industries.seeder';
import { ObjectivesSeedCommand } from './objectives.seeder';
import { ConfigurationsModule } from 'src/shared/configurations/configurations.module';
import { ConfigurationSeedCommand } from './configuration.seeder';
import { ConfigurationCoreSeedCommand } from './configuration-core.seeder';
import { ConfigurationMapSeedCommand } from './configuration-map.seeder';
import { ConfigurationApplicationSeedCommand } from './configuration-application.seeder';
import { PublicResourceSeedCommand } from './public-resource.seeder';
import { StorageModule } from 'src/shared/storage/storage.module';
import { ContentModule } from '@/shared/content/content.module';
import { ContentSeedCommand } from './content.seeder';

@Module({
  imports: [
    CommandModule,
    UserManagementModule,
    ReferenceTypesModule,
    TemplateModule,
    ConfigurationsModule,
    StorageModule,
    ContentModule,
  ],
  providers: [
    //seeders
    PermissionsSeedCommand,
    RolesSeedCommand,
    AdminSeedCommand,
    TemplatesSeedCommand,
    ConfigurationSeedCommand,
    ConfigurationCoreSeedCommand,
    ConfigurationMapSeedCommand,
    ConfigurationApplicationSeedCommand,
    ContentSeedCommand,
    PublicResourceSeedCommand,
    //reference types
    IndustriesSeedCommand,
    ObjectivesSeedCommand,
    //playground
    PlaygroundUsersSeedCommand,
  ],
})
export class SeedersModule {}
