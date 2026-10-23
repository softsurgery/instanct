import { Module } from '@nestjs/common';
import { LandingConfigurationController } from '@softsurgery/nsa-configurations/controllers/landing-configuration.controller';
import { ConfigurationsModule } from '@softsurgery/nsa-configurations/configurations.module';
import { AppVersionController } from './app-version.controller';

@Module({
  controllers: [LandingConfigurationController, AppVersionController],
  providers: [],
  exports: [],
  imports: [ConfigurationsModule],
})
export class RoutesPublicModule {}
