import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { Injectable } from '@nestjs/common';
import { ConfigurationParamEntity } from '../entities/configuration-param.entity';
import { ConfigurationParamRepository } from '../repositories/configuration-param.repository';

@Injectable()
export class ConfigurationParamService extends AbstractCrudService<ConfigurationParamEntity> {
  constructor(
    private readonly configurationParamRepository: ConfigurationParamRepository,
  ) {
    super(configurationParamRepository);
  }
}
