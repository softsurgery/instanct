import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { SessionEntity } from 'src/shared/sessions/entities/session.entity';
import { SessionRepository } from 'src/shared/sessions/repositories/session.repository';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { FindManyOptions, IsNull, MoreThan } from 'typeorm';
import { RequestEntity } from '../entities/request.entity';
import { RequestRepository } from '../repositories/request.repository';
import { UserService } from 'src/modules/users/services/user.service';
import { CreateRequestDto } from '../dtos/create-request.dto';
import { UpdateRequestDto } from '../dtos/update-request.dto';
import { RequestStatus } from '../enums/request-status.enum';
import { SessionService } from 'src/shared/sessions/services/session.service';

@Injectable()
export class RequestService
  extends AbstractCrudService<RequestEntity>
  implements OnModuleInit
{
  private readonly logger = new Logger(RequestService.name);

  requestRepository: RequestRepository;

  constructor(
    requestRepository: RequestRepository,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly sessionRepository: SessionRepository,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    super(requestRepository);
    this.requestRepository = requestRepository;
  }

  async onModuleInit(): Promise<void> {
    await this.expireStaleRequests();
    await this.scheduleActiveSessionExpirations();
  }

  async findOneById(id: number | string, join?: string) {
    await this.expireStaleRequests();
    return super.findOneById(id, join);
  }

  async findIncomingRequestsPaginated(
    query: IQueryObject,
    userId: string,
  ): Promise<PageDto<RequestEntity>> {
    await this.expireStaleRequests();

    const queryBuilder = new QueryBuilder(this.requestRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);

    queryOptions.relations = queryOptions.relations
      ? [...queryOptions.relations, 'session', 'session.user', 'receivers']
      : ['session', 'session.user', 'receivers'];

    queryOptions.where = {
      ...queryOptions.where,
      receivers: { id: userId },
    } satisfies FindManyOptions<RequestEntity>['where'];

    const count = await this.repository.getTotalCount({
      where: queryOptions.where,
      relations: queryOptions.relations,
    } as FindManyOptions<RequestEntity>);

    const entities = await this.repository.findAll(
      queryOptions as FindManyOptions<RequestEntity>,
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

  async findAllIncomingRequests(
    query: IQueryObject,
    userId: string,
  ): Promise<RequestEntity[]> {
    await this.expireStaleRequests();

    const queryBuilder = new QueryBuilder(this.requestRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);

    queryOptions.relations = queryOptions.relations
      ? [...queryOptions.relations, 'session', 'session.user', 'receivers']
      : ['session', 'session.user', 'receivers'];

    queryOptions.where = {
      ...queryOptions.where,
      receivers: { id: userId },
    } satisfies FindManyOptions<RequestEntity>['where'];

    return this.repository.findAll(
      queryOptions as FindManyOptions<RequestEntity>,
    );
  }

  async findOutgoingRequestsPaginated(
    query: IQueryObject,
    userId: string,
  ): Promise<PageDto<RequestEntity>> {
    await this.expireStaleRequests();

    const queryBuilder = new QueryBuilder(this.requestRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    queryOptions.relations = queryOptions.relations
      ? [...queryOptions.relations, 'session', 'session.user']
      : ['session', 'session.user'];

    queryOptions.where = {
      ...queryOptions.where,
      session: {
        userId,
      },
    } satisfies FindManyOptions<RequestEntity>['where'];

    const count = await this.repository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.repository.findAll(
      queryOptions as FindManyOptions<RequestEntity>,
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

  async findAllOutgoingRequests(
    query: IQueryObject,
    userId: string,
  ): Promise<RequestEntity[]> {
    await this.expireStaleRequests();

    const queryBuilder = new QueryBuilder(this.requestRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);

    queryOptions.relations = queryOptions.relations
      ? [...queryOptions.relations, 'session', 'session.user']
      : ['session', 'session.user'];

    queryOptions.where = {
      ...queryOptions.where,
      session: {
        userId: userId,
      },
    } satisfies FindManyOptions<RequestEntity>['where'];

    return this.repository.findAll(
      queryOptions as FindManyOptions<RequestEntity>,
    );
  }

  async sendRequest(
    data: CreateRequestDto,
    senderId: string,
  ): Promise<RequestEntity> {
    await this.expireStaleRequests();

    const activeSession = await this.sessionService.findAllActiveUserSessions(
      {},
      senderId,
    );
    if (activeSession.length === 0) {
      throw new NotFoundException('No active session found for the sender');
    }

    const session = activeSession[0];
    this.scheduleSessionExpiration(session);

    const users = await Promise.all(
      data.receiverIds.map(async (id) => {
        const user = await this.userService.findOneById(id);

        if (!user) {
          throw new NotFoundException(`User with id ${id} not found`);
        }

        return user;
      }),
    );

    return this.requestRepository.save({
      ...data,
      sessionId: session.id,
      receivers: users,
    });
  }

  async updateRequestDetails(
    id: number,
    userId: string,
    data: UpdateRequestDto,
  ): Promise<RequestEntity> {
    const request = await this.findOneById(String(id), 'session');

    if (!request) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }

    if (request.session?.userId !== userId) {
      throw new ForbiddenException('Only the sender can update this request');
    }

    if (request.status !== RequestStatus.Sent) {
      throw new BadRequestException(
        'Cannot update a request that has already been answered',
      );
    }

    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }

    return updated;
  }

  private async expireStaleRequests(): Promise<void> {
    const now = new Date();
    const expiredCount =
      await this.requestRepository.expireSentRequestsForEndedSessions(now);

    if (expiredCount > 0) {
      this.logger.log(`Expired ${expiredCount} pending request(s)`);
    }
  }

  private async scheduleActiveSessionExpirations(): Promise<void> {
    const now = new Date();
    const sessions = await this.sessionRepository.findAll({
      where: {
        ended: IsNull(),
        plannedEnd: MoreThan(now),
      },
    });

    for (const session of sessions) {
      this.scheduleSessionExpiration(session);
    }
  }

  private scheduleSessionExpiration(session: SessionEntity): void {
    if (!session.plannedEnd || session.ended) return;

    const jobName = this.getExpirationJobName(session.id);
    this.cancelSessionExpiration(session.id);

    const delay = session.plannedEnd.getTime() - Date.now();
    if (delay <= 0) {
      void this.expireSentRequestsForSession(session.id);
      return;
    }

    const timeout = setTimeout(() => {
      void this.expireSentRequestsForSession(session.id);
      this.schedulerRegistry.deleteTimeout(jobName);
    }, delay);

    this.schedulerRegistry.addTimeout(jobName, timeout);
  }

  private cancelSessionExpiration(sessionId: number): void {
    const jobName = this.getExpirationJobName(sessionId);
    try {
      this.schedulerRegistry.deleteTimeout(jobName);
    } catch {
      // No scheduled expiration for this session.
    }
  }

  private async expireSentRequestsForSession(sessionId: number): Promise<void> {
    const expiredCount =
      await this.requestRepository.expireSentRequestsForSession(sessionId);

    if (expiredCount > 0) {
      this.logger.log(
        `Expired ${expiredCount} pending request(s) for session ${sessionId}`,
      );
    }
  }

  private getExpirationJobName(sessionId: number): string {
    return `expire-requests-session-${sessionId}`;
  }
}
