import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { Education, Experience, Skill } from '../walk-of-life.interface';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { UserNotFoundException } from 'src/shared/abstract-user-management/errors/user/user.notfound.error';

@Injectable()
export class WalkOfLifeService {
  constructor(private readonly userRepository: UserRepository) {}

  @Transactional()
  async updateExperiences(
    id: number,
    experiences: Experience[],
  ): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new UserNotFoundException();
    return this.userRepository.update(id, { experiences });
  }

  @Transactional()
  async updateEducations(
    id: number,
    educations: Education[],
  ): Promise<UserEntity | null> {
    const profile = await this.userRepository.findOneById(id);
    if (!profile) throw new UserNotFoundException();
    return this.userRepository.update(id, { educations });
  }

  async updateSkills(id: number, skills: Skill[]): Promise<UserEntity | null> {
    const profile = await this.userRepository.findOneById(id);
    if (!profile) throw new UserNotFoundException();
    return this.userRepository.update(id, { skills });
  }
}
