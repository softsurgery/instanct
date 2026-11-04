import { Transactional } from '@nestjs-cls/transactional';
import { Injectable, Logger } from '@nestjs/common';
import { AbstractCrudService } from '@softsurgery/nsa-database';
import { MailService } from '@softsurgery/nsa-mail/services/mail.service';
import { UserDeviceService } from '@softsurgery/nsa-auth/services/user-device.service';
import { BugRepository } from '../repositories/bug.repository';
import { BugInterestedUserService } from './bug-interested-user.service';
import { BugEntity } from '../entities/bug.entity';
import { CreateBugDto } from '../dtos/bug/create-bug.dto';
import { UpdateBugDto } from '../dtos/bug/update-bug.dto';
import { BugStatus } from '../enums/bug-status.enum';
import { BugNotFoundException } from '../errors/bug/bug.notfound.error';

@Injectable()
export class BugService extends AbstractCrudService<BugEntity> {
  private readonly logger = new Logger(BugService.name);

  constructor(
    private readonly bugRepository: BugRepository,
    private readonly userDeviceService: UserDeviceService,
    private readonly bugInterestedUserService: BugInterestedUserService,
    private readonly mailService: MailService,
  ) {
    super(bugRepository);
  }

  override async findOneById(
    id: number | string,
    join?: string,
  ): Promise<BugEntity> {
    const bug = await super.findOneById(id, join).catch(() => null);
    if (!bug) throw new BugNotFoundException();
    return bug;
  }

  @Transactional()
  async create(
    createBugDto: CreateBugDto,
    context?: { userId?: string; macAddress?: string },
  ): Promise<BugEntity> {
    const userId = createBugDto.userId || context?.userId;
    let deviceId: string | null = null;
    if (createBugDto.deviceId) {
      deviceId = createBugDto.deviceId;
    } else if (createBugDto.deviceId === undefined && context?.macAddress) {
      deviceId =
        (await this.userDeviceService.resolveDeviceId(userId, {
          macAddress: context.macAddress,
        })) || null;
    }

    const { interestedUserIds, ...rest } = createBugDto;

    const savedBug = await this.bugRepository.save({
      ...rest,
      deviceId,
      userId,
    });

    if (interestedUserIds && interestedUserIds.length > 0) {
      await this.bugInterestedUserService.syncInterestedUsers(
        savedBug.id,
        interestedUserIds,
      );
      return (
        (await this.bugRepository.findOne({
          where: { id: savedBug.id },
          relations: [
            'interestedUsers',
            'interestedUsers.user',
            'user',
            'device',
          ],
        })) || savedBug
      );
    }

    return savedBug;
  }

  @Transactional()
  override async update(
    id: number | string,
    updateBugDto: UpdateBugDto,
    notify: boolean = true,
  ): Promise<BugEntity> {
    const prev = await this.findOneById(id);
    const { interestedUserIds, ...rest } = updateBugDto;

    const bug = await this.bugRepository.update(id, rest);
    if (!bug) throw new BugNotFoundException();

    if (interestedUserIds !== undefined) {
      await this.bugInterestedUserService.syncInterestedUsers(
        bug.id,
        interestedUserIds,
      );
    }

    if (
      notify &&
      prev.status !== BugStatus.RESOLVED &&
      bug.status === BugStatus.RESOLVED
    ) {
      await this.notifyInterestedUsers(bug);
    }

    return bug;
  }

  @Transactional()
  async updateStatus(
    id: number | string,
    status: BugStatus,
    notify: boolean = true,
  ): Promise<BugEntity> {
    const updated = await this.update(id, { status }, notify);
    if (!updated) throw new BugNotFoundException();
    return updated;
  }

  private async notifyInterestedUsers(bug: BugEntity): Promise<void> {
    try {
      const interestedUsers =
        (bug.interestedUsers?.length ?? 0) > 0
          ? bug.interestedUsers
          : await this.bugInterestedUserService.findByBugId(bug.id);

      if (!interestedUsers?.length) return;

      const subject = `[Resolved] Bug Report: ${bug.title}`;
      for (const item of interestedUsers) {
        const user = item.user;
        if (!user?.email) continue;

        const recipientName =
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          user.username ||
          'Valued User';

        await this.mailService.sendTemplate(
          user.email,
          subject,
          'bug-resolved',
          {
            client: recipientName,
            bugId: bug.id,
            variant: bug.variant,
            title: bug.title,
            description: bug.description,
          },
        );
      }
    } catch (err) {
      this.logger.error(
        'Failed to notify interested users for bug resolution',
        err,
      );
    }
  }
}
