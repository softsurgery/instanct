import { Module } from '@nestjs/common';
import { LandingConfigurationController } from 'nsa-configurations/controllers/landing-configuration.controller';
import { ConfigurationsModule } from 'nsa-configurations/configurations.module';

@Module({
  controllers: [LandingConfigurationController],
  providers: [],
  exports: [],
  imports: [ConfigurationsModule],
})
export class RoutesPublicModule {}
