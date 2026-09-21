import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { SessionEntity } from '../entities/session.entity';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { SessionRepository } from '../repositories/session.repository';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import {
  FindManyOptions,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { UserService } from 'src/modules/users/services/user.service';
import { UserNotFoundException } from 'src/shared/abstract-user-management/errors/user/user.notfound.error';
import { getNowInTimezone, mergeTodayWithTime } from 'src/utils/date';

@Injectable()
export class SessionService extends AbstractCrudService<SessionEntity> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    super(sessionRepository);
  }

  getActiveCondition(extraConditions = {}, userId?: string, timezone?: string) {
    const now = getNowInTimezone(timezone);

    const query = [
      {
        ...extraConditions,
        ended: IsNull(),
        plannedStart: LessThanOrEqual(now),
        plannedEnd: MoreThanOrEqual(now),
        ...(userId && { userId }),
      },
    ];

    return query;
  }

  async findAllPaginatedActiveUserSessions(
    query: IQueryObject,
    userId?: string,
    timezone?: string,
  ): Promise<PageDto<SessionEntity>> {
    const queryBuilder = new QueryBuilder(this.sessionRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    queryOptions.where = this.getActiveCondition(
      queryOptions.where,
      userId,
      timezone,
    );
    const count = await this.sessionRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.sessionRepository.findAll(
      queryOptions as FindManyOptions<SessionEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: Number(query.page),
        take: Number(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async findAllPaginatedUserSessions(
    query: IQueryObject,
    userId?: string,
  ): Promise<PageDto<SessionEntity>> {
    const queryBuilder = new QueryBuilder(this.sessionRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    queryOptions.where = Array.isArray(queryOptions.where)
      ? queryOptions.where.map((w) => ({ ...w, userId }))
      : { ...queryOptions.where, userId };
    const count = await this.sessionRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.sessionRepository.findAll(
      queryOptions as FindManyOptions<SessionEntity>,
    );

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        page: Number(query.page),
        take: Number(query.limit),
      },
      itemCount: count,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async findAllActiveUserSessions(
    query: IQueryObject,
    userId?: string,
    timezone?: string,
  ): Promise<SessionEntity[]> {
    const queryBuilder = new QueryBuilder(this.sessionRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    return this.sessionRepository.findAll({
      where: this.getActiveCondition(queryOptions, userId, timezone),
    });
  }

  async findAllUserSessions(
    query: IQueryObject,
    userId?: string,
  ): Promise<SessionEntity[]> {
    const queryBuilder = new QueryBuilder(this.sessionRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    queryOptions.where = Array.isArray(queryOptions.where)
      ? queryOptions.where.map((w) => ({ ...w, userId }))
      : { ...queryOptions.where, userId };
    return this.sessionRepository.findAll(
      queryOptions as FindManyOptions<SessionEntity>,
    );
  }

  async start(
    dto: Partial<SessionEntity>,
    userId?: string,
  ): Promise<SessionEntity> {
    if (!userId) throw new Error('User id is required');
    dto.plannedStart = mergeTodayWithTime(dto.plannedStart || new Date());
    dto.plannedEnd = mergeTodayWithTime(dto.plannedEnd || new Date());

    // If plannedStart is after plannedEnd, move plannedEnd to the next day
    if (dto.plannedStart > dto.plannedEnd) {
      const nextDay = new Date(dto.plannedEnd);
      nextDay.setDate(nextDay.getDate() + 1);
      dto.plannedEnd = nextDay;
    }

    const user = await this.userService.findOneById(userId);
    if (!user) throw new UserNotFoundException();

    return this.sessionRepository.save({ ...dto, userId });
  }

  async updateDetails(
    id: number,
    dto: Partial<SessionEntity>,
  ): Promise<SessionEntity | null> {
    const session = await this.sessionRepository.findOneById(id);
    if (!session) throw new Error('Session not found');

    return this.sessionRepository.update(id, {
      plannedEnd: dto.plannedEnd,
      payload: dto.payload,
    });
  }

  async end(id: number): Promise<SessionEntity | null> {
    const session = await this.sessionRepository.findOneById(id);
    if (!session) throw new Error('Session not found');
    return this.sessionRepository.update(id, { ended: new Date() });
  }

  async softDeleteByUserId(userId: string): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .softDelete()
      .where('userId = :userId', { userId })
      .execute();
  }
}
