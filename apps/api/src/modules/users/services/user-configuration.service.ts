import { Injectable } from '@nestjs/common';
import { ConfigurationNamespaceService } from 'src/shared/configurations/services/configuration-namespace.service';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';
import { ConfigurationParamService } from 'src/shared/configurations/services/configuration-param.service';
import { ParamVariant } from 'src/shared/configurations/enums/param-variant.enum';
import { ConfigurationParamEntity } from 'src/shared/configurations/entities/configuration-param.entity';

@Injectable()
export class UserConfigurationService {
  constructor(
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
    private readonly configurationParamService: ConfigurationParamService,
  ) {}

  async createPersonalMapConfiguration(
    userId: string,
  ): Promise<ConfigurationParamEntity[]> {
    // Check if personal map configuration already exists
    const existingConfig =
      await this.configurationNamespaceService.findOneByCondition({
        filter: `userId||$eq||${userId};name||$eq||${ConfigurationNamespaces.PERSONAL_MAP}`,
      });
    if (existingConfig) throw new Error('Configuration already exists');

    // Get global map configuration to copy values
    const globalMapConfiguration =
      await this.configurationNamespaceService.findGlobalByName(
        ConfigurationNamespaces.MAPS,
        { join: 'params' },
      );

    if (!globalMapConfiguration)
      throw new Error('Global map configuration not found');

    const max = globalMapConfiguration.params.find(
      (p) => p.name === 'range.max',
    )?.value;

    const min = globalMapConfiguration.params.find(
      (p) => p.name === 'range.min',
    )?.value;

    // Create personal map configuration

    const namespace = await this.configurationNamespaceService.save({
      name: ConfigurationNamespaces.PERSONAL_MAP,
      description: 'Personal map configuration',
      userId,
    });

    return this.configurationParamService.saveMany([
      {
        name: 'range.min',
        description: 'Minimum range of the map',
        variant: ParamVariant.NUMBER,
        value: min,
        namespaceId: namespace.id,
      },
      {
        name: 'range.max',
        description: 'Maximum range of the map',
        variant: ParamVariant.NUMBER,
        value: max,
        namespaceId: namespace.id,
      },
    ]);
  }
}
