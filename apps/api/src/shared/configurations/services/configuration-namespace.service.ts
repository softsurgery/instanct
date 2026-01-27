import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { ConfigurationNamespaceEntity } from '../entities/configuration-namespace.entity';
import { Injectable } from '@nestjs/common';
import { ConfigurationNamespaceRepository } from '../repositories/configuration-namespace.repository';

@Injectable()
export class ConfigurationNamespaceService extends AbstractCrudService<ConfigurationNamespaceEntity> {
  constructor(
    private readonly configurationNampespaceRepository: ConfigurationNamespaceRepository,
  ) {
    super(configurationNampespaceRepository);
  }
}
