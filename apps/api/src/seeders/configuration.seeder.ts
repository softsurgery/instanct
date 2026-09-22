import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ConfigurationCoreSeedCommand } from './configuration-core.seeder';
import { ConfigurationMapSeedCommand } from './configuration-map.seeder';
import { ConfigurationApplicationSeedCommand } from './configuration-application.seeder';

@Injectable()
export class ConfigurationSeedCommand {
  constructor(
    private readonly configurationCoreSeedCommand: ConfigurationCoreSeedCommand,
    private readonly configurationMapSeedCommand: ConfigurationMapSeedCommand,
    private readonly configurationApplicationSeedCommand: ConfigurationApplicationSeedCommand,
  ) {}

  @Command({
    command: 'seed:configuration',
    describe: 'seed system configuration (core and maps)',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of configuration...');

    await this.configurationCoreSeedCommand.seed();
    await this.configurationMapSeedCommand.seed();
    await this.configurationApplicationSeedCommand.seed();

    const end = new Date();
    console.log(
      `✅ Seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
