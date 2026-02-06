import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ConfigurationParamRepository } from 'src/shared/configurations/repositories/configuration-param.repository';
import { ConfigurationNamespaceRepository } from 'src/shared/configurations/repositories/configuration-namespace.repository';
import { mapConfiguration } from './data/configuration.data';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';

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
    console.log('🚀 Starting seeding of configuration...');
    //=============================================================================================
    const namespace = ConfigurationNamespaces.MAPS;

    const mapsConfigNamespace =
      await this.configurationNamespaceRepository.findOne({
        where: { name: namespace },
      });

    if (!mapsConfigNamespace) {
      const namespaceEntity = await this.configurationNamespaceRepository.save({
        name: namespace,
        description: 'Maps configuration',
      });

      await Promise.all(
        mapConfiguration.map((param) =>
          this.configurationParamRepository.save({
            ...param,
            namespaceId: namespaceEntity.id,
          }),
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
