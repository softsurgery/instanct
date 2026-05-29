import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { RequestEntity } from '../entities/request.entity';
import { RequestRepository } from '../repositories/request.repository';
import { UserService } from 'src/modules/users/services/user.service';
import { CreateRequestDto } from '../dtos/create-request.dto';
import { SessionService } from 'src/shared/sessions/services/session.service';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class RequestService extends AbstractCrudService<RequestEntity> {
  requestRepository: RequestRepository;
  constructor(
    requestRepository: RequestRepository,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {
    super(requestRepository);
    this.requestRepository = requestRepository;
  }

  async findIncomingRequestsPaginated(
    query: IQueryObject,
    userId: string,
  ): Promise<PageDto<RequestEntity>> {
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
    const activeSession = await this.sessionService.findAllActiveUserSessions(
      {},
      senderId,
    );
    if (activeSession.length === 0) {
      throw new NotFoundException('No active session found for the sender');
    }
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
      sessionId: activeSession[0].id,
      receivers: users,
    });
  }
}
