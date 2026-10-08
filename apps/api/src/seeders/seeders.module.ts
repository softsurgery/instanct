import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { UserManagementModule } from 'src/modules/users/user-management.module';
import { PermissionsSeedCommand } from './permissions.seeder';
import { RolesSeedCommand } from './roles.seeder';
import { AdminSeedCommand } from './admin.seeder';
import { TemplateModule } from 'nsa-templates/template.module';
import { TemplatesSeedCommand } from './templates.seeder';
import { PlaygroundUsersSeedCommand } from './playground/users.seeder';
import { ReferenceTypesModule } from 'nsa-reference-types/reference-types.module';
import { IndustriesSeedCommand } from './industries.seeder';
import { ObjectivesSeedCommand } from './objectives.seeder';
import { ConfigurationsModule } from 'nsa-configurations/configurations.module';
import { ConfigurationSeedCommand } from './configuration.seeder';
import { ConfigurationCoreSeedCommand } from './configuration-core.seeder';
import { ConfigurationMapSeedCommand } from './configuration-map.seeder';
import { ConfigurationApplicationSeedCommand } from './configuration-application.seeder';
import { PublicResourceSeedCommand } from './public-resource.seeder';
import { StorageModule } from 'nsa-storage/storage.module';
import { ContentModule } from 'nsa-content/content.module';
import { ContentSeedCommand } from './content.seeder';
import { UpdateNamespacesCommand } from './update-namespaces.seeder';

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
    UpdateNamespacesCommand,
    //reference types
    IndustriesSeedCommand,
    ObjectivesSeedCommand,
    //playground
    PlaygroundUsersSeedCommand,
  ],
})
export class SeedersModule {}
