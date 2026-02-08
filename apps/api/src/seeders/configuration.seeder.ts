import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ConfigurationParamRepository } from 'src/shared/configurations/repositories/configuration-param.repository';
import { ConfigurationNamespaceRepository } from 'src/shared/configurations/repositories/configuration-namespace.repository';
import { mapConfiguration } from './data/configuration.data';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';
import { coreConfiguration } from './data/configuration.data';

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

    const configurationByNamespace = {
      [ConfigurationNamespaces.CORE]: coreConfiguration,
      [ConfigurationNamespaces.MAPS]: mapConfiguration,
    };

    for (const [namespace, params] of Object.entries(
      configurationByNamespace,
    ) as [ConfigurationNamespaces, typeof mapConfiguration][]) {
      const existing = await this.configurationNamespaceRepository.findOne({
        where: { name: namespace },
      });

      if (existing) continue;
      const namespaceEntity = await this.configurationNamespaceRepository.save({
        name: namespace,
        description: `${namespace} configuration`,
      });

      await Promise.all(
        params.map((param) =>
          this.configurationParamRepository.save({
            ...param,
            namespaceId: namespaceEntity.id,
          }),
        ),
      );
    }
    const end = new Date();
    console.log(
      `✅ Seeding completed in ${end.getTime() - start.getTime()}ms ⏱️`,
    );
  }
}
