import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationNamespaceEntity } from './entities/configuration-namespace.entity';
import { ConfigurationParamEntity } from './entities/configuration-param.entity';
import { ConfigurationNamespaceRepository } from './repositories/configuration-namespace.repository';
import { ConfigurationParamRepository } from './repositories/configuration-param.repository';

@Module({
  providers: [ConfigurationNamespaceRepository, ConfigurationParamRepository],
  exports: [ConfigurationNamespaceRepository, ConfigurationParamRepository],
  imports: [
    TypeOrmModule.forFeature([
      ConfigurationNamespaceEntity,
      ConfigurationParamEntity,
    ]),
  ],
})
export class ConfigurationsModule {}
