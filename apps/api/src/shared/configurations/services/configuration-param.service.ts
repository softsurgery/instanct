import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { Injectable } from '@nestjs/common';
import { ConfigurationParamEntity } from '../entities/configuration-param.entity';
import { ConfigurationParamRepository } from '../repositories/configuration-param.repository';
import { UpdateConfigurationParamaterDto } from '../dtos/paramater/update-configuration-paramater.dto';
import { Transactional } from '@nestjs-cls/transactional';
import { ParamVariant } from '../enums/param-variant.enum';
import { ConfigurationParamaterNotFoundException } from '../errors/paramater/paramater.notfound.error copy';
import { ConfigurationParamaterInvalideValueException } from '../errors/paramater/paramater.invalide.error';
import { isValidConfigurationListValue } from '../utils/configuration-list-schema';

@Injectable()
export class ConfigurationParamService extends AbstractCrudService<ConfigurationParamEntity> {
  constructor(
    private readonly configurationParamRepository: ConfigurationParamRepository,
  ) {
    super(configurationParamRepository);
  }

  static isValidValue(param: ConfigurationParamEntity) {
    switch (param.variant) {
      case ParamVariant.STRING:
        return true;
      case ParamVariant.NUMBER:
        return !isNaN(Number(param.value));
      case ParamVariant.BOOLEAN:
        return param.value === 'true' || param.value === 'false';
      case ParamVariant.SELECT:
        return param.options?.some((option) => option.value === param.value);
      case ParamVariant.LIST:
        return isValidConfigurationListValue(param.value, param.schema);
      default:
        return false;
    }
  }

  @Transactional()
  async updateBatchParams(
    dtos: UpdateConfigurationParamaterDto[],
  ): Promise<(ConfigurationParamEntity | null)[]> {
    return Promise.all(
      dtos.map(async (dto) => {
        const entity = await this.findOneById(dto.id);

        if (!entity) {
          throw new ConfigurationParamaterNotFoundException();
        }

        const nextValue = {
          ...entity,
          value: dto.value,
        };

        if (!ConfigurationParamService.isValidValue(nextValue)) {
          throw new ConfigurationParamaterInvalideValueException();
        }

        return this.repository.update(dto.id, { value: dto.value });
      }),
    );
  }
}
