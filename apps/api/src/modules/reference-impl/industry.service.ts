import { Injectable, NotFoundException } from '@nestjs/common';
import { RefParamEntity } from 'src/shared/reference-types/entities/ref-param.entity';
import { RefTypeEntity } from 'src/shared/reference-types/entities/ref-type.entity';
import { RefParamRepository } from 'src/shared/reference-types/repositories/ref-param.repository';
import { RefTypeRepository } from 'src/shared/reference-types/repositories/ref-type.repository';

@Injectable()
export class IndustryService {
  constructor(
    private readonly refTypeRepository: RefTypeRepository,
    private readonly refParamRepository: RefParamRepository,
  ) {}

  async getIndustryParent(): Promise<RefTypeEntity | null> {
    const parent = await this.refTypeRepository.findOne({
      where: { label: 'Industry' },
    });
    if (!parent) {
      throw new NotFoundException();
    }
    return parent;
  }

  async getIndustryByLabel(label: string): Promise<RefTypeEntity | null> {
    const parent = await this.getIndustryParent();
    return this.refTypeRepository.findOne({
      where: { label, parentId: parent?.id },
    });
  }

  async getAllIndustries(): Promise<RefTypeEntity[]> {
    const parent = await this.getIndustryParent();
    return this.refTypeRepository.findAll({
      where: { parentId: parent?.id },
    });
  }

  async getIndustryParams(label: string): Promise<RefParamEntity[]> {
    const parent = await this.getIndustryParent();
    return this.refParamRepository.findAll({
      where: { refType: { label, parentId: parent?.id } },
    });
  }
}
