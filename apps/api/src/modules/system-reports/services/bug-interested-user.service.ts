import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AbstractCrudService } from '@softsurgery/nsa-database';
import { BugInterestedUserEntity } from '../entities/bug-interested-user.entity';
import { BugInterestedUserRepository } from '../repositories/bug-interested-user.repository';
import { CreateBugInterestedUserDto } from '../dtos/bug-interested-user/create-bug-interested-user.dto';

@Injectable()
export class BugInterestedUserService extends AbstractCrudService<BugInterestedUserEntity> {
  constructor(
    private readonly bugInterestedUserRepository: BugInterestedUserRepository,
  ) {
    super(bugInterestedUserRepository);
  }

  async findByBugId(bugId: number): Promise<BugInterestedUserEntity[]> {
    return this.bugInterestedUserRepository.findAll({
      where: { bugId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<BugInterestedUserEntity[]> {
    return this.bugInterestedUserRepository.findAll({
      where: { userId },
      relations: ['bug'],
    });
  }

  async findEntry(
    bugId: number,
    userId: string,
  ): Promise<BugInterestedUserEntity | null> {
    return this.bugInterestedUserRepository.findOne({
      where: { bugId, userId },
      relations: ['user', 'bug'],
    });
  }

  @Transactional()
  async addInterestedUser(
    bugId: number,
    userId: string,
  ): Promise<BugInterestedUserEntity> {
    const existing = await this.bugInterestedUserRepository.findOne({
      where: { bugId, userId },
      relations: ['user'],
      withDeleted: true,
    });
    if (existing) {
      if (existing.deletedAt)
        await this.bugInterestedUserRepository.restore(existing.id);

      return existing;
    }

    const created = await this.bugInterestedUserRepository.save({
      bugId,
      userId,
    });

    return (
      (await this.bugInterestedUserRepository.findOne({
        where: { id: created.id },
        relations: ['user'],
      })) || created
    );
  }

  @Transactional()
  async removeInterestedUser(
    bugId: number,
    userId: string,
  ): Promise<BugInterestedUserEntity | null> {
    const existing = await this.bugInterestedUserRepository.findOne({
      where: { bugId, userId },
    });
    if (!existing) {
      return null;
    }
    return this.softDelete(existing.id);
  }

  @Transactional()
  async updateAssociations(
    bugId: number,
    userIds: (string | Pick<BugInterestedUserEntity, 'id' | 'userId'>)[],
  ): Promise<{
    keptItems: Pick<BugInterestedUserEntity, 'id' | 'userId' | 'bugId'>[];
    newItems: Pick<BugInterestedUserEntity, 'id' | 'userId' | 'bugId'>[];
    eliminatedItems: Pick<BugInterestedUserEntity, 'id' | 'userId' | 'bugId'>[];
  }> {
    const currentList = await this.bugInterestedUserRepository.findAll({
      where: { bugId },
    });

    const existingItems = currentList.map((p) => ({
      id: p.id,
      userId: p.userId,
      bugId: p.bugId,
    }));

    const rawUserIds = (userIds || []).map((u) =>
      typeof u === 'string' ? u : u.userId,
    );
    const uniqueUserIds = Array.from(new Set(rawUserIds.filter(Boolean)));

    const updatedItems = uniqueUserIds.map((userId) => {
      const existing = currentList.find((p) => p.userId === userId);
      return {
        id: existing?.id ?? 0,
        userId,
        bugId,
      };
    });

    return await this.bugInterestedUserRepository.updateAssociations<
      Pick<BugInterestedUserEntity, 'id' | 'userId' | 'bugId'>
    >({
      existingItems,
      updatedItems,
      keys: ['userId', 'bugId'],
      onDelete: async (id: number | string) => {
        return this.softDelete(id);
      },
      onCreate: async (p: CreateBugInterestedUserDto) => {
        const softDeleted = await this.bugInterestedUserRepository.findOne({
          where: { bugId: p.bugId, userId: p.userId },
          withDeleted: true,
        });
        if (softDeleted && softDeleted.deletedAt) {
          await this.bugInterestedUserRepository.restore(softDeleted.id);
          return (await this.bugInterestedUserRepository.findOneById(
            softDeleted.id,
          ))!;
        }
        return this.save({
          bugId: p.bugId,
          userId: p.userId,
        });
      },
    });
  }

  @Transactional()
  async syncInterestedUsers(
    bugId: number,
    userIds: string[],
  ): Promise<BugInterestedUserEntity[]> {
    await this.updateAssociations(bugId, userIds);
    return this.findByBugId(bugId);
  }

  async isUserInterested(bugId: number, userId: string): Promise<boolean> {
    const count = await this.bugInterestedUserRepository.getTotalCount({
      where: { bugId, userId },
    });
    return count > 0;
  }
}
