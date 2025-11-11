import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { IQueryObject } from 'src/shared/database/interfaces/database-query-options.interface';
import { QueryBuilder } from 'src/shared/database/utils/database-query-builder';
import { PageDto } from 'src/shared/database/dtos/database.page.dto';
import { PageMetaDto } from 'src/shared/database/dtos/database.page-meta.dto';
import { RefParamRepository } from '../repositories/ref-param.repository';
import { RefParamNotFoundException } from '../errors/ref-param/ref-param.notfound.error';
import { RefParamEntity } from '../entities/ref-param.entity';
import { RefParamAlreadyExistsException } from '../errors/ref-param/ref-param.alreadyexists.error';

@Injectable()
export class RefParamService {
  constructor(private readonly refParamRepository: RefParamRepository) {}

  async findOneById(id: string): Promise<RefParamEntity> {
    const type = await this.refParamRepository.findOneById(id);
    if (!type) {
      throw new RefParamNotFoundException();
    }
    return type;
  }

  async findOneByCondition(
    query: IQueryObject = {},
  ): Promise<RefParamEntity | null> {
    const queryBuilder = new QueryBuilder(
      this.refParamRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const type = await this.refParamRepository.findOne(
      queryOptions as FindOneOptions<RefParamEntity>,
    );
    return type;
  }

  async findAll(query: IQueryObject): Promise<RefParamEntity[]> {
    const queryBuilder = new QueryBuilder(
      this.refParamRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const types = await this.refParamRepository.findAll(
      queryOptions as FindManyOptions<RefParamEntity>,
    );
    return types;
  }

  async findAllPaginated(
    query: IQueryObject,
  ): Promise<PageDto<RefParamEntity>> {
    const queryBuilder = new QueryBuilder(
      this.refParamRepository.getMetadata(),
    );
    const queryOptions = queryBuilder.build(query);
    const count = await this.refParamRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.refParamRepository.findAll(
      queryOptions as FindManyOptions<RefParamEntity>,
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
  async save(refParam: Partial<RefParamEntity>): Promise<RefParamEntity> {
    const existing = refParam.label && (await this.findByLabel(refParam.label));
    if (existing) {
      throw new RefParamAlreadyExistsException();
    }
    return await this.refParamRepository.save(refParam);
  }

  @Transactional()
  async saveMany(
    refParams: Partial<RefParamEntity>[],
  ): Promise<RefParamEntity[]> {
    return Promise.all(refParams.map((dto) => this.save(dto)));
  }

  @Transactional()
  async update(
    id: number,
    refParam: Partial<RefParamEntity>,
  ): Promise<RefParamEntity | null> {
    const existing = refParam.label && (await this.findByLabel(refParam.label));
    if (existing && existing.id !== id) {
      throw new RefParamAlreadyExistsException();
    }
    return this.refParamRepository.update(id, refParam);
  }

  async softDelete(id: number): Promise<RefParamEntity | null> {
    return this.refParamRepository.softDelete(id);
  }

  async delete(id: number): Promise<RefParamEntity | null> {
    const type = await this.refParamRepository.findOneById(id);
    if (!type) {
      throw new RefParamNotFoundException();
    }
    return this.refParamRepository.remove(type);
  }

  //Extended Methods ===========================================================================

  async findByLabel(label: string): Promise<RefParamEntity | null> {
    return this.refParamRepository.findOne({ where: { label } });
  }
}
