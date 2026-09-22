import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ConfigurationParamRepository } from 'src/shared/configurations/repositories/configuration-param.repository';
import { ConfigurationNamespaceRepository } from 'src/shared/configurations/repositories/configuration-namespace.repository';
import { coreConfiguration } from './data/configuration.data';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';
import { seedConfigurationParams } from './configuration-seeder.helper';

@Injectable()
export class ConfigurationCoreSeedCommand {
  constructor(
    private readonly configurationNamespaceRepository: ConfigurationNamespaceRepository,
    private readonly configurationParamRepository: ConfigurationParamRepository,
  ) {}

  @Command({
    command: 'seed:configuration:core',
    describe: 'seed core system configuration',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of core configuration...');

    await seedConfigurationParams(
      this.configurationNamespaceRepository,
      this.configurationParamRepository,
      ConfigurationNamespaces.CORE,
      coreConfiguration,
    );

    const end = new Date();
    console.log(
      `✅ Core configuration seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
