import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ConfigurationParamRepository } from 'src/shared/configurations/repositories/configuration-param.repository';
import { ConfigurationNamespaceRepository } from 'src/shared/configurations/repositories/configuration-namespace.repository';
import { applicationConfiguration } from './data/configuration.data';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';
import { seedConfigurationParams } from './configuration-seeder.helper';

@Injectable()
export class ConfigurationApplicationSeedCommand {
  constructor(
    private readonly configurationNamespaceRepository: ConfigurationNamespaceRepository,
    private readonly configurationParamRepository: ConfigurationParamRepository,
  ) {}

  @Command({
    command: 'seed:configuration:application',
    describe: 'seed application configuration',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of application configuration...');
    await seedConfigurationParams(
      this.configurationNamespaceRepository,
      this.configurationParamRepository,
      ConfigurationNamespaces.APPLICATION,
      applicationConfiguration,
    );
    const end = new Date();
    console.log(
      `✅ Application configuration seeding completed in ${
        end.getTime() - start.getTime()
      }ms ⏱️`,
    );
  }
}
