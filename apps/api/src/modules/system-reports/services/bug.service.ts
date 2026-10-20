import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { IQueryObject } from '@softsurgery/nsa-database';
import { QueryBuilder } from '@softsurgery/nsa-database';
import { PageDto } from '@softsurgery/nsa-database';
import { PageMetaDto } from '@softsurgery/nsa-database';
import { BugRepository } from '../repositories/bug.repository';
import { UserDeviceService } from '@softsurgery/nsa-auth/services/user-device.service';
import { BugNotFoundException } from '../errors/bug/bug.notfound.error';
import { BugEntity } from '../entities/bug.entity';
import { CreateBugDto } from '../dtos/bug/create-bug.dto';
import { BugStatus } from '../enums/bug-status.enum';

@Injectable()
export class BugService {
  constructor(
    private readonly bugRepository: BugRepository,
    private readonly userDeviceService: UserDeviceService,
  ) {}

  async findOneById(id: string): Promise<BugEntity> {
    const bug = await this.bugRepository.findOneById(id);
    if (!bug) {
      throw new BugNotFoundException();
    }
    return bug;
  }

  async findOneByCondition(
    query: IQueryObject = {},
  ): Promise<BugEntity | null> {
    const queryBuilder = new QueryBuilder(this.bugRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const bug = await this.bugRepository.findOne(
      queryOptions as FindOneOptions<BugEntity>,
    );
    return bug;
  }

  async findAll(query: IQueryObject): Promise<BugEntity[]> {
    const queryBuilder = new QueryBuilder(this.bugRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const bugs = await this.bugRepository.findAll(
      queryOptions as FindManyOptions<BugEntity>,
    );
    return bugs;
  }

  async findAllPaginated(query: IQueryObject): Promise<PageDto<BugEntity>> {
    const queryBuilder = new QueryBuilder(this.bugRepository.getMetadata());
    const queryOptions = queryBuilder.build(query);
    const count = await this.bugRepository.getTotalCount({
      where: queryOptions.where,
    });

    const entities = await this.bugRepository.findAll(
      queryOptions as FindManyOptions<BugEntity>,
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
  async save(createBugDto: CreateBugDto): Promise<BugEntity> {
    return await this.bugRepository.save(createBugDto);
  }

  @Transactional()
  async saveMany(createBugDtos: CreateBugDto[]): Promise<BugEntity[]> {
    return Promise.all(createBugDtos.map((dto) => this.save(dto)));
  }

  async softDelete(id: string): Promise<BugEntity | null> {
    return this.bugRepository.softDelete(id);
  }

  async delete(id: string): Promise<BugEntity | null> {
    const bug = await this.bugRepository.findOneById(id);
    if (!bug) {
      throw new BugNotFoundException();
    }
    return this.bugRepository.remove(bug);
  }

  //Extended Methods ===========================================================================

  @Transactional()
  async create(
    createBugDto: CreateBugDto,
    context?: { userId?: string; macAddress?: string },
  ): Promise<BugEntity> {
    const deviceId = await this.userDeviceService.resolveDeviceId(
      context?.userId,
      {
        deviceId: createBugDto.deviceId,
        macAddress: context?.macAddress,
      },
    );

    return this.bugRepository.save({
      ...createBugDto,
      deviceId,
      userId: context?.userId,
    });
  }

  @Transactional()
  async updateStatus(id: string, status: BugStatus): Promise<BugEntity> {
    const bug = await this.findOneById(id);
    bug.status = status;
    return this.bugRepository.save(bug);
  }
}
