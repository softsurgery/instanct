import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ConfigurationParamRepository } from 'src/shared/configurations/repositories/configuration-param.repository';
import { ConfigurationNamespaceRepository } from 'src/shared/configurations/repositories/configuration-namespace.repository';
import { mapConfiguration } from './data/configuration.data';

@Injectable()
export class ConfigurationSeedCommand {
  constructor(
    private readonly configurationNamespaceRepository: ConfigurationNamespaceRepository,
    private readonly configurationParamRepository: ConfigurationParamRepository,
  ) {}

  @Command({
    command: 'seed:configuration',
    describe: 'seed system configuration',
  })
  async seed() {
    const start = new Date();
    console.log('🚀 Starting seeding of admin...');
    //=============================================================================================
    const namespaceId = 'maps';

    const mapsConfigNamespace =
      await this.configurationNamespaceRepository.findOne({
        where: { id: namespaceId },
      });

    if (!mapsConfigNamespace) {
      await this.configurationNamespaceRepository.save({
        id: namespaceId,
        description: 'Maps configuration',
      });

      await Promise.all(
        mapConfiguration.map((param) =>
          this.configurationParamRepository.save(param),
        ),
      );
    }
    //=============================================================================================
    const end = new Date();
    console.log(
      `✅ Seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
