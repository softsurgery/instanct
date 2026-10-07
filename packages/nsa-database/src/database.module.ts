import { Module } from '@nestjs/common';
import { MigrationService } from './services/database-migration.service';
import { MigrationRepository } from './repositories/migration.repository';
import { MigrationEntity } from './entities/migration.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriggerRegistry } from './services/trigger-registry.service';
import { TriggerSynchronizer } from './services/trigger-synchronizer.service';
import { SchemaSyncCommand } from './commands/schema-sync.command';

@Module({
  imports: [TypeOrmModule.forFeature([MigrationEntity])],
  providers: [
    MigrationService,
    MigrationRepository,
    TriggerRegistry,
    TriggerSynchronizer,
    SchemaSyncCommand,
  ],
  exports: [MigrationService, TriggerRegistry],
})
export class DatabaseModule {}
