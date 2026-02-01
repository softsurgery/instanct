import { Injectable, NotFoundException } from '@nestjs/common';
import { RefParamEntity } from 'src/shared/reference-types/entities/ref-param.entity';
import { RefTypeEntity } from 'src/shared/reference-types/entities/ref-type.entity';
import { RefParamRepository } from 'src/shared/reference-types/repositories/ref-param.repository';
import { RefTypeRepository } from 'src/shared/reference-types/repositories/ref-type.repository';

@Injectable()
export class ObjectifService {
  constructor(
    private readonly refTypeRepository: RefTypeRepository,
    private readonly refParamRepository: RefParamRepository,
  ) {}

  async getObjectifParent(): Promise<RefTypeEntity | null> {
    const parent = await this.refTypeRepository.findOne({
      where: { label: 'Objectif' },
    });
    if (!parent) {
      throw new NotFoundException();
    }
    return parent;
  }

  async getObjectifParams(): Promise<RefParamEntity[]> {
    const parent = await this.getObjectifParent();
    return this.refParamRepository.findAll({
      where: { refType: { parentId: parent?.id } },
    });
  }
}
