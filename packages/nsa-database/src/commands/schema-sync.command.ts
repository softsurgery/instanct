import { Injectable, Logger } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { DataSource } from 'typeorm';
import { MigrationService } from '../services/database-migration.service';
import { join } from 'path';
import { MigrationEntity } from '../entities/migration.entity';

@Injectable()
export class SchemaSyncCommand {
  private readonly logger = new Logger(SchemaSyncCommand.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly migrationService: MigrationService,
  ) {}

  @Command({
    command: 'schema:adapt',
    describe:
      'Adapts synchronized data to migration by keeping up with the last migration and applying missing things.',
  })
  async adapt() {
    this.logger.log('Starting schema synchronization...');

    try {
      // 1. Apply missing things via TypeORM sync without dropping data
      await this.dataSource.synchronize(false);
      this.logger.log('Schema synchronized successfully without losing data.');

      // 2. Keep up with the last migration by marking all SQL files as run
      this.logger.log('Adapting custom migration system...');
      await this.migrationService.createMigrationsTableIfNotExists();

      const migrationPath = join(process.cwd(), 'src/assets/migrations');
      const migrationFiles =
        this.migrationService.loadMigrationFiles(migrationPath);

      for (const file of migrationFiles) {
        let existingMigration: MigrationEntity | null = null;
        try {
          existingMigration = await this.migrationService.findOneByVersion(
            file.version,
          );
        } catch {
          // MigrationNotFoundException thrown
        }

        if (!existingMigration) {
          const migration = new MigrationEntity();
          migration.version = file.version;
          migration.script = file.script;
          migration.description = file.description;
          migration.checksum = file.checksum;
          migration.success = true; // Mark as successful without executing SQL

          await this.migrationService.save(migration);
          this.logger.log(
            `Adapted migration: ${file.version} ${file.description}`,
          );
        } else if (!existingMigration.success) {
          existingMigration.success = true;
          await this.migrationService.save(existingMigration);
          this.logger.log(
            `Marked existing migration as successful: ${file.version} ${file.description}`,
          );
        }
      }

      this.logger.log('Custom migration system successfully adapted.');
    } catch (error) {
      this.logger.error('Failed to adapt schema', error);
      throw error;
    }
  }
}
