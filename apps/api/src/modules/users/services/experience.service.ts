import { Injectable } from '@nestjs/common';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { ExperienceEntity } from '../entities/experience.entity';
import { ExperienceRepository } from '../repositories/experience.repository';

@Injectable()
export class ExperienceService extends AbstractCrudService<ExperienceEntity> {
  constructor(private readonly experienceRepository: ExperienceRepository) {
    super(experienceRepository);
  }
}
