import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { SessionRepository } from '../repositories/session.repository';
import { SessionEntity } from '../entities/session.entity';
import { SessionNotFoundException } from '../errors/session.notfound.error';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async findOneById(id: string): Promise<SessionEntity> {
    const session = await this.sessionRepository.findOneById(id);
    if (!session) {
      throw new SessionNotFoundException();
    }
    return session;
  }

  async findOneByCondition(query: IQueryObject): Promise<SessionEntity | null> {
    const queryBuilder = new QueryBuilder(this.sessionRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const permission = await this.sessionRepository.findOne(
      queryOptions as FindOneOptions<SessionEntity>,
    );
    if (!permission) return null;
    return permission;
  }

  async findAll(query: IQueryObject = {}): Promise<SessionEntity[]> {
    const queryBuilder = new QueryBuilder(this.sessionRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    return await this.sessionRepository.findAll(
      queryOptions as FindManyOptions<SessionEntity>,
    );
  }

  async findAllPaginated(query: IQueryObject): Promise<PageDto<SessionEntity>> {
    const queryBuilder = new QueryBuilder(this.sessionRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
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

  @Transactional()
  async save(createPermissionDto: Partial<SessionEntity>) {
    return this.sessionRepository.save(createPermissionDto);
  }

  async saveMany(createPermissionDto: Partial<SessionEntity>[]) {
    return this.sessionRepository.saveMany(createPermissionDto);
  }

  async softDelete(id: string): Promise<SessionEntity | null> {
    return this.sessionRepository.softDelete(id);
  }

  async delete(id: string): Promise<SessionEntity | null> {
    const permission = await this.findOneById(id);
    return this.sessionRepository.remove(permission);
  }
}
