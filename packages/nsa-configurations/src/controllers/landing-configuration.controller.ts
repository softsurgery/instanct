import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'nsa-auth/utils/public-strategy';
import { ConfigurationNamespaceService } from '../services/configuration-namespace.service';
import { CONFIGURATION_NAMESPACES } from '../enums/configuration-namespaces.registry';

@ApiTags('landing-configuration')
@Controller({
  version: '1',
  path: '/landing-configuration',
})
export class LandingConfigurationController {
  constructor(
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
    @Inject(CONFIGURATION_NAMESPACES)
    private readonly configurationNamespaces: Record<string, string>,
  ) {}

  @Public()
  @Get()
  async getLandingConfiguration() {
    const contactEmail =
      await this.configurationNamespaceService.getSpecificParam(
        this.configurationNamespaces.CORE,
        'company.support',
      );

    return {
      contactEmail,
    };
  }
}
