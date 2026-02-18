import { Injectable } from '@nestjs/common';
import { ConfigurationNamespaceService } from 'src/shared/configurations/services/configuration-namespace.service';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';
import { ConfigurationParamService } from 'src/shared/configurations/services/configuration-param.service';
import { ParamVariant } from 'src/shared/configurations/enums/param-variant.enum';
import { ConfigurationNamespaceEntity } from 'src/shared/configurations/entities/configuration-namespace.entity';

@Injectable()
export class UserConfigurationService {
  constructor(
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
    private readonly configurationParamService: ConfigurationParamService,
  ) {}

  async getGlobalMapConfigurationParams() {
    const namespace = await this.configurationNamespaceService.findGlobalByName(
      ConfigurationNamespaces.MAPS,
      { join: 'params' },
    );

    if (!namespace) throw new Error('Global map configuration not found');

    return {
      rangeMin: Number(
        namespace.params.find((p) => p.name === 'range.min')?.value,
      ),
      rangeMax: Number(
        namespace.params.find((p) => p.name === 'range.max')?.value,
      ),
    };
  }

  async getPersonalMapConfiguration(
    userId: string,
  ): Promise<ConfigurationNamespaceEntity | null> {
    const namespace =
      await this.configurationNamespaceService.findOneByCondition({
        filter: `userId||$eq||${userId};name||$eq||${ConfigurationNamespaces.PERSONAL_MAP}`,
        join: 'params',
      });

    if (!namespace) throw new Error('Personal map configuration not found');

    return namespace;
  }

  async createPersonalMapConfiguration(
    userId: string,
  ): Promise<ConfigurationNamespaceEntity> {
    // Check if personal map configuration already exists
    const existingConfig =
      await this.configurationNamespaceService.findOneByCondition({
        filter: `userId||$eq||${userId};name||$eq||${ConfigurationNamespaces.PERSONAL_MAP}`,
      });
    if (existingConfig) throw new Error('Configuration already exists');

    // Get global map configuration to copy values
    const globalMapConfiguration = await this.getGlobalMapConfigurationParams();
    // Create personal map configuration

    const namespace = await this.configurationNamespaceService.save({
      name: ConfigurationNamespaces.PERSONAL_MAP,
      description: 'Personal map configuration',
      userId,
    });

    await this.configurationParamService.saveMany([
      {
        name: 'radius',
        description: 'Radius of the map',
        variant: ParamVariant.NUMBER,
        value: globalMapConfiguration.rangeMin.toString(),
        namespaceId: namespace.id,
      },
      {
        name: 'clusters',
        description: 'Whether to show clusters on the map',
        variant: ParamVariant.BOOLEAN,
        value: 'true',
        namespaceId: namespace.id,
      },
      {
        name: 'showUsernames',
        description: 'Whether to show usernames on the map',
        variant: ParamVariant.BOOLEAN,
        value: 'true',
        namespaceId: namespace.id,
      },
    ]);
    return namespace;
  }

  async updatePersonalMapConfiguration(
    userId: string,
    params: { radius: number; clusters: boolean; showUsernames: boolean },
  ): Promise<ConfigurationNamespaceEntity | null> {
    const namespace =
      await this.configurationNamespaceService.findOneByCondition({
        filter: `userId||$eq||${userId};name||$eq||${ConfigurationNamespaces.PERSONAL_MAP}`,
        join: 'params',
      });

    if (!namespace) throw new Error('Personal map configuration not found');

    const globalMapConfiguration = await this.getGlobalMapConfigurationParams();

    if (
      globalMapConfiguration?.rangeMin <= params.radius &&
      globalMapConfiguration?.rangeMax >= params.radius
    ) {
      const radiusId = namespace.params.find((p) => p.name === 'radius')?.id;
      const clustersId = namespace.params.find(
        (p) => p.name === 'clusters',
      )?.id;
      const showUsernamesId = namespace.params.find(
        (p) => p.name === 'showUsernames',
      )?.id;

      if (!radiusId || !clustersId || !showUsernamesId)
        throw new Error('Personal map configuration parameters not found');
      await this.configurationParamService.updateBatchParams([
        {
          id: radiusId,
          value: params.radius.toString(),
        },
        {
          id: clustersId,
          value: params.clusters ? 'true' : 'false',
        },
        {
          id: showUsernamesId,
          value: params.showUsernames ? 'true' : 'false',
        },
      ]);
      return this.getPersonalMapConfiguration(userId);
    } else {
      throw new Error(
        `Personal map configuration must be greater than global map configuration (rangeMin: ${globalMapConfiguration.rangeMin}, rangeMax: ${globalMapConfiguration.rangeMax})`,
      );
    }
  }
}
