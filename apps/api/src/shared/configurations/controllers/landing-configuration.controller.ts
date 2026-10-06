import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/shared/auth/utils/public-strategy';
import { ConfigurationNamespaceService } from '../services/configuration-namespace.service';
import { ConfigurationNamespaces } from 'src/app/enums/configuration-namespaces.enum';

@ApiTags('landing-configuration')
@Controller({
  version: '1',
  path: '/landing-configuration',
})
export class LandingConfigurationController {
  constructor(
    private readonly configurationNamespaceService: ConfigurationNamespaceService,
  ) {}

  @Public()
  @Get()
  async getLandingConfiguration() {
    const contactEmail =
      await this.configurationNamespaceService.getSpecificParam(
        ConfigurationNamespaces.CORE,
        'company.support',
      );

    return {
      contactEmail,
    };
  }
}
