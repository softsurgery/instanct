import { Injectable, Logger } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { DataSource } from 'typeorm';

@Injectable()
export class UpdateNamespacesCommand {
  private readonly logger = new Logger(UpdateNamespacesCommand.name);

  constructor(private readonly dataSource: DataSource) {}

  @Command({
    command: 'schema:update-namespaces',
    describe: 'Updates configuration namespace IDs to match their names',
  })
  async update() {
    this.logger.log('Starting namespace ID update...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');

      const namespaces = (await queryRunner.query(
        'SELECT id, name FROM `configuration-namespace` WHERE userId IS NULL;',
      )) as { id: string; name: string }[];

      this.logger.log(`Found ${namespaces.length} namespaces with no userId.`);

      for (const ns of namespaces) {
        if (!ns.name) {
          this.logger.log(`Namespace ${ns.id} has no name, skipping.`);
          continue;
        }
        if (ns.id === ns.name) {
          continue; // Already matches
        }

        this.logger.log(`Updating namespace: ${ns.id} -> ${ns.name}`);

        // Update the parameters
        await queryRunner.query(
          'UPDATE `configuration-param` SET namespaceId = ? WHERE namespaceId = ?;',
          [ns.name, ns.id],
        );

        // Update the namespace
        await queryRunner.query(
          'UPDATE `configuration-namespace` SET id = ? WHERE id = ?;',
          [ns.name, ns.id],
        );
      }

      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
      this.logger.log('Successfully updated namespaces and parameters.');
    } catch (error) {
      this.logger.error('Failed to update namespaces', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
