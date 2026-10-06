import { Module } from '@nestjs/common';
import { LandingConfigurationController } from 'src/shared/configurations/controllers/landing-configuration.controller';
import { ConfigurationsModule } from 'src/shared/configurations/configurations.module';

@Module({
  controllers: [LandingConfigurationController],
  providers: [],
  exports: [],
  imports: [ConfigurationsModule],
})
export class RoutesPublicModule {}
