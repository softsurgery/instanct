import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { ConfigurationNamespaceEntity } from '../entities/configuration-namespace.entity';
import { Injectable } from '@nestjs/common';
import { ConfigurationNamespaceRepository } from '../repositories/configuration-namespace.repository';
import { ParamVariant } from '../enums/param-variant.enum';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class ConfigurationNamespaceService extends AbstractCrudService<ConfigurationNamespaceEntity> {
  constructor(
    private readonly configurationNampespaceRepository: ConfigurationNamespaceRepository,
  ) {
    super(configurationNampespaceRepository);
  }

  async getSpecificParam(
    namespace: string,
    param: string,
  ): Promise<string | number | boolean | null> {
    const namespaceEntity =
      await this.configurationNampespaceRepository.findOneById(namespace);
    if (!namespaceEntity) return null;
    const paramEntity = namespaceEntity.params.find((p) => p.name === param);
    switch (paramEntity?.variant) {
      case (ParamVariant.STRING, ParamVariant.SELECT):
        return paramEntity.value || null;
      case ParamVariant.NUMBER:
        return Number(paramEntity.value);
      case ParamVariant.BOOLEAN:
        return paramEntity.value === 'true';
      default:
        return null;
    }
  }

  async findAllGlobal(
    query: IQueryObject,
  ): Promise<ConfigurationNamespaceEntity[]> {
    const queryBuilder = new QueryBuilder(this.repository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    queryOptions.where = {
      ...queryOptions.where,
      userId: null,
    };
    return await this.repository.findAll(
      queryOptions as FindManyOptions<ConfigurationNamespaceEntity>,
    );
  }
}
